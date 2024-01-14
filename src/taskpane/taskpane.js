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

Office.onReady(function (info) {
    if (info.host === Office.HostType.PowerPoint) {
        initialize();
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

var isRecording = false;

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
        sendDataToServer({slideIndex: selectedSlideIndex, timestamp: timestamp});
    }
}

function toggleRecording() {
    isRecording = !isRecording;
    var startRecordingButton = document.getElementById("startRecording");
    startRecordingButton.innerText = isRecording ? "Stop Recording" : "Start Recording";
}

function sendDataToServer(data) {

    fetch('http://localhost:5000', {
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
