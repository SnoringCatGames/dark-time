'use strict';

(() => {
  var backgroundColor = window.darkTime.common.BACKGROUND_COLOR_DEFAULT;
  var textActiveColor = window.darkTime.common.TEXT_ACTIVE_COLOR_DEFAULT;
  var textInactiveColor = window.darkTime.common.TEXT_INACTIVE_COLOR_DEFAULT;

  let body;
  let timeContainer;
  let style;
  let cssTextNode;
  let timeString = '';

  window.addEventListener('load', init, false);

  function init() {
    console.log('onDocumentLoad');

    window.removeEventListener('load', init);

    body = document.querySelector('body');
    timeContainer = document.querySelector('#time');
    style = document.createElement('style');
    const head = document.querySelector('head');
    head.appendChild(style);

    loadColors();
    initializeBody();
    updateTime();
  }

  function loadColors() {
    chrome.storage.sync.get({
      backgroundColor: window.darkTime.common.BACKGROUND_COLOR_DEFAULT,
      textActiveColor: window.darkTime.common.TEXT_ACTIVE_COLOR_DEFAULT,
      textInactiveColor: window.darkTime.common.TEXT_INACTIVE_COLOR_DEFAULT,
    }, items => {
      if (!!chrome.runtime.lastError) {
        console.error('Error loading!: ' + chrome.runtime.lastError);
      } else {
        backgroundColor = items.backgroundColor;
        textActiveColor = items.textActiveColor;
        textInactiveColor = items.textInactiveColor;
      }
      initializeBody();
    });
  }

  function initializeBody() {
    onInteraction();

    setTimeout(() => body.classList.add('loaded'), 50);

    body.addEventListener('mousemove', onInteraction);
    body.addEventListener('mousedown', onInteraction);
    body.addEventListener('mouseup', onInteraction);
    body.addEventListener('touchstart', onInteraction);
    body.addEventListener('touchend', onInteraction);
    body.addEventListener('touchmove', onInteraction);
  }

  function onInteraction() {
    if (!!cssTextNode) {
      style.removeChild(cssTextNode);
    }
    const cssText = `
      html>body, html>body.loaded {
        background-color: ${backgroundColor};
        color: ${textInactiveColor};
      }
      
      html>body:hover, html>body.loaded:hover {
        color: ${textActiveColor};
      }
    `;
    cssTextNode = document.createTextNode(cssText);
    style.appendChild(cssTextNode);
  }

  function updateTime() {
    const date = new Date();
    const newTimeString = date.toLocaleTimeString([], {timeStyle: 'short'});
    if (newTimeString !== timeString) {
      timeString = newTimeString;
      timeContainer.textContent = timeString;
      document.title = timeString;
    }
    window.requestAnimationFrame(updateTime);
  }
})();
