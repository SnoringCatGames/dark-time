'use strict';

(() => {
  const data = {};

  data.dataRequestState = 'request-not-sent';
  data.data = null;

  let timeContainer;

  window.addEventListener('load', init, false);

  function init() {
    console.log('onDocumentLoad');

    window.removeEventListener('load', init);

    setTimeout(() => {
      const body = document.querySelector('body');
      body.classList.add('loaded');
    }, 10);

    timeContainer = document.querySelector('#time');
    update();

    // fetchData(function () {
    //   dashboardContainer.textContent = JSON.stringify(data.data);
    // });
  }

  function update() {
    const date = new Date();
    timeContainer.innerText = date.toLocaleTimeString([], {timeStyle: 'short'});
    window.requestAnimationFrame(update);
  }

  // function fetchData(callback) {
  //   var xhr = new XMLHttpRequest();
  //
  //   xhr.addEventListener('load', onLoad, false);
  //   xhr.addEventListener('error', onError, false);
  //   xhr.addEventListener('abort', onAbort, false);
  //
  //   console.log('Sending request to ' + dataUrl);
  //
  //   xhr.open('GET', dataUrl, true);
  //   xhr.send();
  //
  //   data.dataRequestState = 'waiting-for-response';
  //
  //   // ---  --- //
  //
  //   function onLoad() {
  //     console.log('Response status=' + xhr.status + ' (' + xhr.statusText + ')');
  //     //console.log('Response body=' + xhr.response);
  //
  //     data.dataRequestState = 'received-response';
  //
  //     try {
  //       data.data = JSON.parse(xhr.response);
  //     } catch (error) {
  //       data.data = {};
  //       console.error('Unable to parse response body as JSON: ' + xhr.response);
  //       return;
  //     }
  //
  //     callback();
  //   }
  //
  //   function onError() {
  //     console.error('An error occurred while transferring the data');
  //
  //     data.dataRequestState = 'error-with-request';
  //   }
  //
  //   function onAbort() {
  //     console.error('The transfer has been cancelled by the user');
  //
  //     data.dataRequestState = 'error-with-request';
  //   }
  // }
})();
