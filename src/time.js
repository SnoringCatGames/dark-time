'use strict';

(() => {
  let backgroundColor = window.darkTime.common.BACKGROUND_COLOR_DEFAULT;
  let textActiveColor = window.darkTime.common.TEXT_ACTIVE_COLOR_DEFAULT;
  let textInactiveColor = window.darkTime.common.TEXT_INACTIVE_COLOR_DEFAULT;

  let body;
  let timeContainer;
  let style;
  let cssTextNode;
  let timeString = '';
  let documentTitle = '';
  let animationFrameId;

  window.addEventListener('load', init, false);

  function init() {
    console.log('onDocumentLoad');

    window.removeEventListener('load', init);

    updateTitle();
    setInterval(updateTitle, 2000);

    body = document.querySelector('body');
    timeContainer = document.querySelector('#time');
    style = document.createElement('style');
    const head = document.querySelector('head');
    head.appendChild(style);

    window.addEventListener('visibilitychange', onVisibilityChange);

    loadColors();
    initializeBody();
    if (!document.hidden) {
      updateTime();
    }
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
    }
    animationFrameId = window.requestAnimationFrame(updateTime);
  }

  function updateTitle() {
    const date = new Date();
    const timeIndex = date.getHours() % 12;
    const newDocumentTitle = window.darkTime.common.TIME_EMOJIS[timeIndex];
    if (newDocumentTitle !== documentTitle) {
      documentTitle = newDocumentTitle;
      document.title = documentTitle;
    }
  }

  function onVisibilityChange() {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrameId);
    } else {
      updateTime();
    }
  }
})();
