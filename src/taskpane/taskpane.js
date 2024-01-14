/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

// global document, Office

/* Office.onReady((info) => {
  if (info.host === Office.HostType.PowerPoint) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    //document.getElementById("run").onclick = run;
  }
}); */

/*
export async function run() {
  /**
   * Insert your PowerPoint code here
   
  const options = { coercionType: Office.CoercionType.Text };

  await Office.context.document.setSelectedDataAsync(" ", options);
  await Office.context.document.setSelectedDataAsync("Hello World!", options);
} */

// Office.onReady(function (info) {
//   if (info.host === Office.HostType.PowerPoint) {
//       Office.context.presentation.addHandlerAsync(
//           Office.EventType.SlideSelectionChanged
//           ,onSlideSelectionChanged);
//   }
// });

/* function onSlideSelectionChanged(eventArgs) {
  var pageNumber = eventArgs.startSlideIndex + 1; // Assuming 1-based indexing
  var timestamp = new Date().toISOString();
  sendDataToServer({ pageNumber, timestamp });
}

function sendDataToServer(data) {
  // Use AJAX, fetch, or any suitable method to send data to your server
  fetch('your-server-endpoint', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
  });
} */
import { v4 as uuidv4 } from 'uuid'
import {send} from "process";

var currentUUID = ""
var isRecording = false
var t = null

Office.onReady(function (info) {
    if (info.host === Office.HostType.PowerPoint) {
        initialize();
        document.getElementById("startRecording").onclick = function () { // onClick event handler assigned to button, executes picture capture
            toggleRecording()
        };
    }
});

function getSelectedSlideID() {
    return new OfficeExtension.Promise(function (resolve, reject) {
        Office.context.document.getSelectedDataAsync(Office.CoercionType.SlideRange, function (asyncResult) {
            try {
                if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                    reject(console.error(asyncResult.error.message));
                } else {
                    resolve(asyncResult.value.slides[0].index);
                }
            }
            catch (error) {
                reject(console.log(error));
            }
        });
    })
}

function initialize() {
    document.getElementById("startRecording").addEventListener("click", async function () {
        var slideNumber = document.getElementById("currentSlide")
        slideNumber.innerText = "Current slide: " + await getSelectedSlideID()
        //toggleRecording(); // Function to toggle recording status
    });
}

function onSlideSelectionChanged(eventArgs) {

    slideNumber.innerText = "Current slide: " + eventArgs.startSlideIndex
    if (isRecording) {
        var selectedSlideIndex = eventArgs.startSlideIndex + 1;
        var timestamp = new Date().toISOString();
        sendDataToServer({ slideIndex: selectedSlideIndex, timestamp: timestamp });
    }
}

function toggleRecording() {
    isRecording = !isRecording;
    if (isRecording) {
        currentUUID = uuidv4()
        t = setInterval(sendDataToServer, 1000)
    } else {
        clearInterval(t)
    }
    var startRecordingButton = document.getElementById("startRecording");
    startRecordingButton.innerText = isRecording ? "Stop Recording" : "Start Recording";
}

async function sendDataToServer() {

    const data = {
        "uuid": currentUUID,
        "slide": await getSelectedSlideID(),
        "timestamp": Date.now()
    };

    fetch('http://localhost:5000/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(result => {
        console.log('Server response:', result);
    }).catch(error => {
        console.error('Error sending data to the server:', error);
    });
}

// PURPOSE: takes the Image URL obtained from webcam capture, inserts into powerpoint
function insertImageIntoPresentation(imageURL) {

    // Use Office API to set ImageURL data asynchronously
    Office.context.document.setSelectedDataAsync(
        imageURL,
        {
            // Define properties for the image to be inserted
            coercionType: Office.CoercionType.Image,
            imageLeft: 0,  // Set the left position of the image
            imageTop: 0,   // Set the top position of the image
            imageWidth: 400,  // Set the width of the image
            imageHeight: 300  // Set the height of the image
        },
        function (result) {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
                console.log('Image inserted into PowerPoint');
            } else {
                console.error('Error inserting image into PowerPoint:', result.error.message);
            }
        }
    );
}
