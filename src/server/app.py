from flask import Flask, request, make_response, jsonify, send_file, g, render_template
import csv
import io
from functools import reduce
import sqlite3
import cv2
import numpy as np
import pandas as pd
from matplotlib.figure import Figure
from flask_cors import CORS
from headpose.detect import PoseEstimator
from base64 import b64decode, b64encode
import PIL
import time
import os

DATABASE_PATH = "data.db"

app = Flask(__name__)
CORS(app)

est = PoseEstimator()

face_cascade = cv2.CascadeClassifier(
    cv2.samples.findFile(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'))

last_image = None


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE_PATH)
        db.row_factory = sqlite3.Row
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.route("/")
def hello():
    return "Hello World!"


@app.route("/stats", methods=['GET'])
def get_statistics():
    cur = get_db().cursor()
    uuid = "id" + request.args.get('uuid').replace("-", "")

    file_name = f"data/{uuid}.csv"

    data_dir = "data"
    file_name = f"{data_dir}/{uuid}.csv"

    # Ensure the data directory exists
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)

    sel_unique = f"SELECT COUNT(DISTINCT slide) FROM {uuid}"
    res = cur.execute(sel_unique)
    num_slides = res.fetchone()[0]

    with open(file_name, mode='w') as csv_file:
        writer = csv.DictWriter(csv_file,
                                fieldnames=['slide', 'num_imgs', 'focused_average', 'focused_min', 'focused_max'])
        writer.writeheader()

        for slide in range(1, num_slides + 1):
            query = f"SELECT num_faces, num_distracted FROM {uuid} WHERE slide = ?"
            res = cur.execute(query, (slide,))

            slide_focused = list(map(lambda x: x[0] - x[1], res))

            avg_focused = reduce(lambda x, y: x + y, slide_focused) // len(slide_focused)
            min_focused = min(slide_focused)
            max_focused = max(slide_focused)

            writer.writerow({'slide': slide, 'num_imgs': len(slide_focused), 'focused_average': avg_focused,
                             'focused_min': min_focused, 'focused_max': max_focused})

    df = pd.read_csv(file_name)
    title = "Presentation Statistics"

    return render_template('stats.html', title=title, plot=create_graph(df))


def create_graph(df):
    fig = Figure()
    ax = fig.subplots()
    ax.set_xlabel("Slide")
    ax.set_ylabel("Average Focused")
    ax.set_xticks(df['slide'])
    ax.plot(df['slide'], df['focused_average'])

    img = io.StringIO()
    fig.savefig(img, format='svg')
    svg_img = '<svg' + img.getvalue().split('<svg')[1]

    return svg_img


@app.route("/image", methods=['GET'])
def get_image():
    if last_image is None:
        return ""
    else:
        retval, buffer = cv2.imencode('.png', last_image)
        response = make_response(buffer.tobytes())
        return response


@app.route("/upload", methods=['POST'])
def upload():
    global last_image
    #result, img = cam.read()

    # initialize webcam capture

    cam = cv2.VideoCapture(0)
    if not cam.isOpened():
        return jsonify({"error": "Unable to access the webcam"}), 500

    result, img = cam.read()
    if not result:
        return jsonify({"error": "Failed to capture image from webcam"}), 500

    # Release the webcam capture after reading the image
    cam.release()

    last_image = img
    uuid = "id" + request.args.get('uuid').replace("-", "")
    slide = request.args.get('slide')
    timestamp = request.args.get('timestamp')

    faces = face_cascade.detectMultiScale3(
        cv2.cvtColor(img, cv2.COLOR_BGR2GRAY),
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30),
        flags=cv2.CASCADE_SCALE_IMAGE,
        outputRejectLevels=True
    )
    face_poses = []
    for (rect, neighbours, weight) in zip(faces[0], faces[1], faces[2]):
        x, y, w, h = rect
        face_buffer = int(w / 5)
        buff_y = y - int(face_buffer / 2)
        buff_h = h + face_buffer
        buff_x = x - int(face_buffer / 2)
        buff_w = w + face_buffer
        rectangle_crop = img[buff_y:buff_y + buff_h, buff_x:buff_x + buff_w]

        last_image = cv2.rectangle(last_image, (x, y), (x + w, y + h), (255, 0, 0), 2)

        try:
            roll, pitch, yaw = est.pose_from_image(rectangle_crop)
            face_poses.append((roll, pitch, yaw))
        except:
            print("Couldn't get headpose")

    num_faces = len(face_poses)
    num_distracted = len(list(filter(lambda p: abs(p[1]) > 15, face_poses)))

    # error message points here when running Flask server + requesting to view stats
    write_to_db(uuid, slide, timestamp, num_faces, num_distracted)

    return {"num_faces": num_faces, "num_distracted": num_distracted}


def write_to_db(uuid, slide, timestamp, num_faces, num_distracted):
    conn = get_db()
    cur = conn.cursor()

    create_statement = f"CREATE TABLE IF NOT EXISTS {uuid} (slide INTEGER, timestamp TEXT, num_faces INTEGER, num_distracted INTEGER)"
    insert_statement = f"INSERT INTO {uuid} VALUES (?, ?, ?, ?) ON CONFLICT (slide, timestamp) DO UPDATE SET num_faces=excluded.num_faces, num_distracted=excluded.num_distracted"

    # error message points here when running Flask server + requesting to view stats
    cur.execute(create_statement)
    cur.execute(insert_statement, (slide, timestamp, num_faces, num_distracted))

    conn.commit()


if __name__ == "__main__":
    app.run()
