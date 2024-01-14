/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office 

Office.onReady((info) => {
  if (info.host === Office.HostType.PowerPoint) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("run").onclick = run;
  }
});

export async function run() {
  /**
   * Insert your PowerPoint code here
   
  const options = { coercionType: Office.CoercionType.Text };

  await Office.context.document.setSelectedDataAsync(" ", options);
  await Office.context.document.setSelectedDataAsync("Hello World!", options);
} */

Office.onReady(function (info) {
  if (info.host === Office.HostType.PowerPoint) {
      Office.context.presentation.addHandlerAsync(
          Office.EventType.SlideSelectionChanged
          ,onSlideSelectionChanged);
  }
});

function onSlideSelectionChanged(eventArgs) {
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
}
