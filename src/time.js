'use strict';

(() => {
  const common = window.darkTime.common;

  let body;
  let timeContainer;
  let style;
  let cssTextNode;
  let bodyTimeString = '';
  let documentTitle = '';
  let faviconHour = 0;
  let animationFrameId;

  window.addEventListener('load', init, false);

  function init() {
    console.log('onDocumentLoad');

    window.removeEventListener('load', init);

    updateTitle();
    setInterval(updateTitle, 2000);

    updateFavicon();
    setInterval(updateFavicon, 2000);

    body = document.querySelector('body');
    timeContainer = document.querySelector('#time');
    style = document.createElement('style');
    const head = document.querySelector('head');
    head.appendChild(style);

    window.addEventListener('visibilitychange', onVisibilityChange);

    loadSettings();
    initializeBody();
    if (!document.hidden) {
      updateBodyTime();
    }
  }

  function loadSettings() {
    chrome.storage.sync.get({
      backgroundColor: common.BACKGROUND_COLOR_DEFAULT,
      textActiveColor: common.TEXT_ACTIVE_COLOR_DEFAULT,
      textInactiveColor: common.TEXT_INACTIVE_COLOR_DEFAULT,
      uses24HourFormat: common.USES_24_HOUR_FORMAT_DEFAULT,
      includesAmPm: common.INCLUDES_AM_PM_DEFAULT,
      includesDigitalTimeInTitle: common.INCLUDES_DIGITAL_TIME_IN_TITLE_DEFAULT,
    }, items => {
      if (!!chrome.runtime.lastError) {
        console.error('Error loading!: ' + chrome.runtime.lastError);
      } else {
        common.backgroundColor = items.backgroundColor;
        common.textActiveColor = items.textActiveColor;
        common.textInactiveColor = items.textInactiveColor;
        common.uses24HourFormat = items.uses24HourFormat;
        common.includesAmPm = items.includesAmPm;
        common.includesDigitalTimeInTitle = items.includesDigitalTimeInTitle;
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
        background-color: ${common.backgroundColor};
        color: ${common.textInactiveColor};
      }
      
      html>body:hover, html>body.loaded:hover {
        color: ${common.textActiveColor};
      }
    `;
    cssTextNode = document.createTextNode(cssText);
    style.appendChild(cssTextNode);
  }

  function updateBodyTime() {
    const newTimeString = common.getTimeString();
    if (newTimeString !== bodyTimeString) {
      bodyTimeString = newTimeString;
      timeContainer.textContent = bodyTimeString;
    }
    animationFrameId = window.requestAnimationFrame(updateBodyTime);
  }

  function updateTitle() {
    const newDocumentTitle = common.getTitle();
    if (newDocumentTitle !== documentTitle) {
      documentTitle = newDocumentTitle;
      document.title = documentTitle;
    }
  }

  function updateFavicon() {
    const date = new Date();
    const newFaviconHour = date.getHours() % 12;
    if (newFaviconHour !== faviconHour) {
      faviconHour = newFaviconHour;
      for (const size of common.ICON_SIZES) {
        const link = document.querySelector(`link[rel~="icon"][sizes~="${size}x${size}"]`);
        link.href = `${common.CLOCK_ICON_PATH_PREFIX}${size}_${faviconHour}.png`;
      }
    }
  }

  function onVisibilityChange() {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrameId);
    } else {
      updateBodyTime();
    }
  }
})();
