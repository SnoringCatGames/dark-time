'use strict';

(() => {
  window.darkTime = window.darkTime || {};
  window.darkTime.time = {};

  const time = window.darkTime.time;
  let common;

  time.init = init;
  time.update = update;

  let body;
  let clockContainer;
  let analogTimeContainer;
  let digitalTimeContainer;
  let digitsContainer;
  let amPmContainer;
  let settingsButton;
  let style;
  let cssTextNode;
  let timeDigitsString = '';
  let timeAmPmString = '';
  let documentTitle = '';
  let faviconHour = 0;
  let animationFrameId;

  window.addEventListener('load', onDocumentLoad, false);

  function onDocumentLoad() {
    console.log('time.js > onDocumentLoad');

    window.removeEventListener('load', onDocumentLoad);

    common = window.darkTime.common;
    common.init(false);
  }

  function init() {
    common = window.darkTime.common;

    body = document.querySelector('body');
    clockContainer = document.querySelector('#clock');

    createClockElements();

    updateTitle();
    setInterval(updateTitle, 2000);

    updateFavicon();
    setInterval(updateFavicon, 2000);

    window.addEventListener('visibilitychange', onVisibilityChange);

    loadSettings();
    initializeBody();
    if (!document.hidden) {
      updateBodyTime();
    }
  }

  function createClockElements() {
    analogTimeContainer = document.createElement('canvas');
    analogTimeContainer.id = 'analog-time';
    clockContainer.appendChild(analogTimeContainer);

    digitalTimeContainer = document.createElement('div');
    digitalTimeContainer.id = 'digital-time';
    clockContainer.appendChild(digitalTimeContainer);

    digitsContainer = document.createElement('span');
    digitsContainer.id = 'digits';
    digitalTimeContainer.appendChild(digitsContainer);

    amPmContainer = document.createElement('span');
    amPmContainer.id = 'am-pm';
    digitalTimeContainer.appendChild(amPmContainer);

    settingsButton = document.createElement('button');
    settingsButton.id = 'settings-button';
    clockContainer.appendChild(settingsButton);

    style = document.createElement('style');
    const head = document.querySelector('head');
    head.appendChild(style);
  }

  function loadSettings() {
    chrome.storage.sync.get({
      backgroundColor: common.BACKGROUND_COLOR_DEFAULT,
      textActiveColor: common.TEXT_ACTIVE_COLOR_DEFAULT,
      textInactiveColor: common.TEXT_INACTIVE_COLOR_DEFAULT,
      showsAnalogDisplay: common.SHOWS_ANALOG_DISPLAY_DEFAULT,
      showsHourMarkers: common.SHOWS_HOUR_MARKERS_DEFAULT,
      showsSecondHand: common.SHOWS_SECOND_HAND_DEFAULT,
      showsDiscreteHandTicks: common.SHOWS_DISCRETE_HAND_TICKS_DEFAULT,
      showsShadows: common.SHOWS_SHADOWS_DEFAULT,
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
        common.showsAnalogDisplay = items.showsAnalogDisplay;
        common.showsHourMarkers = items.showsHourMarkers;
        common.showsSecondHand = items.showsSecondHand;
        common.showsDiscreteHandTicks = items.showsDiscreteHandTicks;
        common.showsShadows = items.showsShadows;
        common.uses24HourFormat = items.uses24HourFormat;
        common.includesAmPm = items.includesAmPm;
        common.includesDigitalTimeInTitle = items.includesDigitalTimeInTitle;
      }
      initializeBody();
    });
  }

  function initializeBody() {
    onInteraction();

    setTimeout(() => clockContainer.classList.add('loaded'), 50);

    clockContainer.addEventListener('mousemove', onInteraction);
    clockContainer.addEventListener('mousedown', onInteraction);
    clockContainer.addEventListener('mouseup', onInteraction);
    clockContainer.addEventListener('touchstart', onInteraction);
    clockContainer.addEventListener('touchend', onInteraction);
    clockContainer.addEventListener('touchmove', onInteraction);
    settingsButton.addEventListener('click', onSettingsButtonClick);
  }

  function onInteraction() {
    update();
  }

  function update() {
    if (!!cssTextNode) {
      style.removeChild(cssTextNode);
    }
    const textShadow = common.showsShadows ? '-3px 3px 2px #00000055' : 'none';
    const cssText = `
      html #clock, html #clock.loaded {
        background-color: ${common.backgroundColor};
        color: ${common.textInactiveColor};
        text-shadow: ${textShadow};
      }
      
      html #clock:hover, html #clock.loaded:hover {
        color: ${common.textActiveColor};
      }
    `;
    cssTextNode = document.createTextNode(cssText);
    style.appendChild(cssTextNode);

    analogTimeContainer.style.display = common.showsAnalogDisplay ? 'block' : 'none';
    digitalTimeContainer.style.display = common.showsAnalogDisplay ? 'none' : 'block';
  }

  function updateBodyTime() {
    // Update the digital time.
    if (!common.showsAnalogDisplay) {
      updateDigitalTime();
    }

    // Update the analog time.
    if (common.showsAnalogDisplay) {
      updateAnalogTime();
    }

    window.cancelAnimationFrame(animationFrameId);
    animationFrameId = window.requestAnimationFrame(updateBodyTime);
  }

  function updateDigitalTime() {
    const newTimeDigitsString = common.getTimeDigitsString();
    let newTimeAmPmString = common.getTimeAmPmString();
    if (newTimeDigitsString !== timeDigitsString || newTimeAmPmString !== timeAmPmString) {
      timeDigitsString = newTimeDigitsString;
      timeAmPmString = newTimeAmPmString;
      digitsContainer.textContent = timeDigitsString;
      amPmContainer.textContent = timeAmPmString;
    }
  }

  function updateAnalogTime() {
    const TAU = Math.PI * 2;
    const HALF_PI = Math.PI / 2;

    const scale = common.isInOptionsPage ? 0.3 : 1;

    const date = new Date();
    const hours = date.getHours() % 12;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();

    const hourHandLength = 80 * scale;
    const minuteHandLength = 155 * scale;
    const secondHandLength = 165 * scale;
    const hourMarkerDistance = 178 * scale;

    const centerGapLength = 15 * scale;

    const hourHandWidth = 10 * scale;
    const minuteHandWidth = 5 * scale;
    const secondHandWidth = 2 * scale;
    const hourDotRadius = 5 * scale;

    const shadowColor = '#00000055';
    const handShadowOffsetX = -2 * scale;
    const handShadowOffsetY = 2 * scale;
    const markerShadowOffsetX = -1 * scale;
    const markerShadowOffsetY = 1 * scale;

    const outlineWidth = 0.5 * scale;

    const hourHandProgress = (hours + minutes / 60) / 12;
    let minuteHandProgress = minutes / 60;
    let secondHandProgress = seconds / 60;

    if (!common.showsDiscreteHandTicks) {
      minuteHandProgress += seconds / 60 / 60;
      secondHandProgress += milliseconds / 1000 / 60;
    }

    const hourHandAngle = hourHandProgress * TAU;
    const minuteHandAngle = minuteHandProgress * TAU;
    const secondHandAngle = secondHandProgress * TAU;

    analogTimeContainer.width = clockContainer.clientWidth;
    analogTimeContainer.height = clockContainer.clientHeight;

    const centerX = analogTimeContainer.width / 2;
    const centerY = analogTimeContainer.height / 2;

    const hourHandStartPointX = centerX + centerGapLength * Math.cos(hourHandAngle - HALF_PI);
    const hourHandStartPointY = centerY + centerGapLength * Math.sin(hourHandAngle - HALF_PI);
    const minuteHandStartPointX = centerX + centerGapLength * Math.cos(minuteHandAngle - HALF_PI);
    const minuteHandStartPointY = centerY + centerGapLength * Math.sin(minuteHandAngle - HALF_PI);
    const secondHandStartPointX = centerX + centerGapLength * Math.cos(secondHandAngle - HALF_PI);
    const secondHandStartPointY = centerY + centerGapLength * Math.sin(secondHandAngle - HALF_PI);

    const hourHandEndPointX = centerX + hourHandLength * Math.cos(hourHandAngle - HALF_PI);
    const hourHandEndPointY = centerY + hourHandLength * Math.sin(hourHandAngle - HALF_PI);
    const minuteHandEndPointX = centerX + minuteHandLength * Math.cos(minuteHandAngle - HALF_PI);
    const minuteHandEndPointY = centerY + minuteHandLength * Math.sin(minuteHandAngle - HALF_PI);
    const secondHandEndPointX = centerX + secondHandLength * Math.cos(secondHandAngle - HALF_PI);
    const secondHandEndPointY = centerY + secondHandLength * Math.sin(secondHandAngle - HALF_PI);

    const context = analogTimeContainer.getContext("2d");

    context.clearRect(0, 0, analogTimeContainer.width, analogTimeContainer.height);
    context.lineCap = 'round';

    // Show dots to mark the hours.
    if (common.showsHourMarkers) {
      context.fillStyle = common.textInactiveColor;

      for (let i = 0; i < 12; i++) {
        const angle = (i * TAU) / 12;
        const x = centerX + hourMarkerDistance * Math.cos(angle - HALF_PI);
        const y = centerY + hourMarkerDistance * Math.sin(angle - HALF_PI);
        // Outline.
        context.fillStyle = common.backgroundColor;
        context.filter = 'none';
        context.beginPath();
        context.arc(x, y, hourDotRadius + outlineWidth * 2, 0, TAU);
        context.fill();
        // Shadow.
        if (common.showsShadows) {
          context.fillStyle = shadowColor;
          context.filter = 'blur(1px)';
          context.beginPath();
          context.arc(x + markerShadowOffsetX, y + markerShadowOffsetY, hourDotRadius, 0, TAU);
          context.fill();
        }
        // Dot.
        context.fillStyle = common.textInactiveColor;
        context.filter = 'none';
        context.beginPath();
        context.arc(x, y, hourDotRadius, 0, TAU);
        context.fill();
      }
    }

    context.strokeStyle = common.textActiveColor;

    // Draw the second hand.
    if (common.showsSecondHand) {
      // Outline.
      context.lineWidth = secondHandWidth + outlineWidth * 2;
      context.strokeStyle = common.backgroundColor;
      context.filter = 'none';
      context.beginPath();
      context.moveTo(secondHandStartPointX, secondHandStartPointY);
      context.lineTo(secondHandEndPointX, secondHandEndPointY);
      context.stroke();
      // Shadow.
      if (common.showsShadows) {
        context.lineWidth = secondHandWidth;
        context.strokeStyle = shadowColor;
        context.filter = 'blur(2px)';
        context.beginPath();
        context.moveTo(secondHandStartPointX + handShadowOffsetX, secondHandStartPointY + handShadowOffsetY);
        context.lineTo(secondHandEndPointX + handShadowOffsetX, secondHandEndPointY + handShadowOffsetY);
        context.stroke();
      }
      // Hand.
      context.lineWidth = secondHandWidth;
      context.strokeStyle = common.textActiveColor;
      context.filter = 'none';
      context.beginPath();
      context.moveTo(secondHandStartPointX, secondHandStartPointY);
      context.lineTo(secondHandEndPointX, secondHandEndPointY);
      context.stroke();
    }

    // Draw the minute hand.
    // Outline.
    context.lineWidth = minuteHandWidth + outlineWidth * 2;
    context.strokeStyle = common.backgroundColor;
    context.filter = 'none';
    context.beginPath();
    context.moveTo(minuteHandStartPointX, minuteHandStartPointY);
    context.lineTo(minuteHandEndPointX, minuteHandEndPointY);
    context.stroke();
    // Shadow.
    if (common.showsShadows) {
      context.lineWidth = minuteHandWidth;
      context.strokeStyle = shadowColor;
      context.filter = 'blur(2px)';
      context.beginPath();
      context.moveTo(minuteHandStartPointX + handShadowOffsetX, minuteHandStartPointY + handShadowOffsetY);
      context.lineTo(minuteHandEndPointX + handShadowOffsetX, minuteHandEndPointY + handShadowOffsetY);
      context.stroke();
    }
    // Hand.
    context.lineWidth = minuteHandWidth;
    context.strokeStyle = common.textActiveColor;
    context.filter = 'none';
    context.beginPath();
    context.moveTo(minuteHandStartPointX, minuteHandStartPointY);
    context.lineTo(minuteHandEndPointX, minuteHandEndPointY);
    context.stroke();

    // Draw the hour hand.
    // Outline.
    context.lineWidth = hourHandWidth + outlineWidth * 2;
    context.strokeStyle = common.backgroundColor;
    context.filter = 'none';
    context.beginPath();
    context.moveTo(hourHandStartPointX, hourHandStartPointY);
    context.lineTo(hourHandEndPointX, hourHandEndPointY);
    context.stroke();
    // Shadow.
    if (common.showsShadows) {
      context.lineWidth = hourHandWidth;
      context.strokeStyle = shadowColor;
      context.filter = 'blur(2px)';
      context.beginPath();
      context.moveTo(hourHandStartPointX + handShadowOffsetX, hourHandStartPointY + handShadowOffsetY);
      context.lineTo(hourHandEndPointX + handShadowOffsetX, hourHandEndPointY + handShadowOffsetY);
      context.stroke();
    }
    // Hand.
    context.lineWidth = hourHandWidth;
    context.strokeStyle = common.textActiveColor;
    context.filter = 'none';
    context.beginPath();
    context.moveTo(hourHandStartPointX, hourHandStartPointY);
    context.lineTo(hourHandEndPointX, hourHandEndPointY);
    context.stroke();
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

  function onSettingsButtonClick() {
    if (!common.isInOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
  }
})();
