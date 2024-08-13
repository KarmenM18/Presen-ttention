## SheHacks: Presen-ttention

<img width="530" height = "380" alt="maze1" src="https://github.com/user-attachments/assets/4e66498a-c641-4f3a-917a-6a41f2d76432">
<img width="500" height = "380" alt="maze1" src="https://github.com/user-attachments/assets/fbfc0b8d-7bb2-40c0-8958-4f86e34e4185">

### Inspiration 💫
Since Covid, user monitoring has been used for more and more of our lives. Monitoring software like Zoom or Respondus Lockdown watches a user's every move to see if their eyes are on the screen, and if not flags them as not paying attention or cheating on an exam. But what if it's not the user's fault? What if the lecture is just really, really boring? We wanted to find an application of this technology that instead of punishing distracted students would help give feedback to presenters on how to make more engaging presentations.

### What it does ⚙️
The app uses a webcam to look at the presentation audience. As the presenter speaks, the image is analyzed to detect where each person is looking, and estimates how engaged the audience is based on how many are facing the presenter. This feedback is given to the presenter in real-time, and they are also presented with a summary of their presentation afterwards. It's also possible to change the content of the presentation in real-time in response to a less engaged audience to draw them back in.

### How we built it 🛠️
The app integrates directly with Microsoft PowerPoint using an add-in built in JavaScript. The image is analyzed using OpenCV on a Flask server using a two-step process: First individual faces in the image are detected and cropped to a thumbnail size, then pose estimation is run on each face to determine where the person is looking. If they're not looking at the camera, they're tallied as distracted.

### Setup 💻
Create a venv first (strongly recommended). Then, install necessary dependencies:

pip install flask opencv-python headpose

### Challenges we ran into 🚧
* Navigating Incompatibility between Office API and Webcam: Office applications have their own security and permission models, and integrating with external devices like webcams required careful navigation to ensure seamless functionality across different operating systems.

* Integrating Python Computer Vision algorithm with Front-End Display: this challenge encompasses several aspects, such as developing a Flask server to host the Python-based computer vision algorithm, establishing communication between the frontend (PowerPoint add-in) and backend (Flask server), and finally, displaying the analyzed data in a user-friendly manner within the PowerPoint interface. We had to address issues related to data transfer, format compatibility, and ensuring a smooth user experience during the integration process.

### Accomplishments that we're proud of 🏆
* Creating a Microsoft Office add-in for the first time
* Learning more about integration and customization using
* Trying out the Office JavaScript API
* Successful Integration of Computer Vision with PowerPoint
* Addressing Incompatibility Challenges

###What We Learned 📝
* End-to-End Workflow Understanding: working on an add-in that integrates with Microsoft PowerPoint using JavaScript and communicates with a Flask server running OpenCV poses challenges related to cross-platform compatibility. Our team learned how to navigate issues related to permissions, security, and compatibility between the Office API and webcam access on different platforms. This involved understanding and addressing differences in how permissions are handled on various operating systems.

* Microsoft Office Add-In Development: when integrating the frontend (PowerPoint add-in) and backend (Flask server with OpenCV), our team gained a better understanding into how data flows between different components, how the frontend interacts with the backend, and the importance of seamless communication between different parts of the system.

* User Experience Considerations: during the development of the PowerPoint add-in, our team had to discuss and weigh out the best ways to present pose detection results to the user. We opted to use a line graph for our choice of data visualization, allowing the user to gain a more comprehensive understanding of the implications of the detection results.

### What's next for Presentention 🔮
One of the biggest applications of this pose detection model is in the automotive industry, specifically related to driver safety. Such detection software can play a crucial role in detecting whether a driver is distracted or not, prompting the driver to shift their focus back onto the road. Such a feature can play a key role in avoiding and mitigating potential hazardous situations on the road.

