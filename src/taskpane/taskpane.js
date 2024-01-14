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

var isRecording = false;

Office.onReady(function (info) {
  if (info.host === Office.HostType.PowerPoint) {
      Office.context.presentation.addHandlerAsync(
          Office.EventType.SlideSelectionChanged,
          onSlideSelectionChanged,
          function (result) {
              if (result.status === Office.AsyncResultStatus.Failed) {
                  console.error('Error adding event handler:', result.error.message);
              }
          }
      );

      initialize();
  }
});

function initialize() {
  document.getElementById("startRecording").addEventListener("click", function() {
      toggleRecording(); // Function to toggle recording status
  });
}

function onSlideSelectionChanged(eventArgs) {
  if (isRecording) {
      var selectedSlideIndex = eventArgs.startSlideIndex + 1;
      var timestamp = new Date().toISOString();
      sendDataToServer({ slideIndex: selectedSlideIndex, timestamp: timestamp });
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
