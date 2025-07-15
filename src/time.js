'use strict';

(() => {
  const common = window.darkTime.common;

  let body;
  let analogTimeContainer;
  let digitalTimeContainer;
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
    analogTimeContainer = document.querySelector('#analog-time');
    digitalTimeContainer = document.querySelector('#digital-time');
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
    const textShadow = common.showsShadows ? '-3px 3px 2px #00000055' : 'none';
    const cssText = `
      html>body, html>body.loaded {
        background-color: ${common.backgroundColor};
        color: ${common.textInactiveColor};
        text-shadow: ${textShadow};
      }
      
      html>body:hover, html>body.loaded:hover {
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
    const newTimeString = common.getTimeString();
    if (newTimeString !== bodyTimeString) {
      bodyTimeString = newTimeString;
      digitalTimeContainer.textContent = bodyTimeString;
    }
  }

  function updateAnalogTime() {
    const TAU = Math.PI * 2;
    const HALF_PI = Math.PI / 2;

    const date = new Date();
    const hours = date.getHours() % 12;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();

    const hourHandLength = 80;
    const minuteHandLength = 138;
    const secondHandLength = 150;
    const hourMarkerDistance = 163;

    const hourHandWidth = 7;
    const minuteHandWidth = 3;
    const secondHandWidth = 1.5;

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

    analogTimeContainer.width = window.innerWidth;
    analogTimeContainer.height = window.innerHeight;

    const centerX = analogTimeContainer.width / 2;
    const centerY = analogTimeContainer.height / 2;

    const hourHandEndPointX = centerX + hourHandLength * Math.cos(hourHandAngle - HALF_PI);
    const hourHandEndPointY = centerY + hourHandLength * Math.sin(hourHandAngle - HALF_PI);
    const minuteHandEndPointX = centerX + minuteHandLength * Math.cos(minuteHandAngle - HALF_PI);
    const minuteHandEndPointY = centerY + minuteHandLength * Math.sin(minuteHandAngle - HALF_PI);
    const secondHandEndPointX = centerX + secondHandLength * Math.cos(secondHandAngle - HALF_PI);
    const secondHandEndPointY = centerY + secondHandLength * Math.sin(secondHandAngle - HALF_PI);

    const shadowColor = '#00000055';
    const handShadowOffsetX = -4;
    const handShadowOffsetY = 4;
    const markerShadowOffsetX = -2;
    const markerShadowOffsetY = 2;

    const context = analogTimeContainer.getContext("2d");

    context.clearRect(0, 0, analogTimeContainer.width, analogTimeContainer.height);
    context.lineCap = 'round';

    // Show dots to mark the hours.
    if (common.showsHourMarkers) {
      context.fillStyle = common.textInactiveColor;

      const hourDotRadius = 5;
      for (let i = 0; i < 12; i++) {
        const angle = (i * TAU) / 12;
        const x = centerX + hourMarkerDistance * Math.cos(angle - HALF_PI);
        const y = centerY + hourMarkerDistance * Math.sin(angle - HALF_PI);
        if (common.showsShadows) {
          context.fillStyle = shadowColor;
          context.filter = 'blur(1px)';
          context.beginPath();
          context.arc(x + markerShadowOffsetX, y + markerShadowOffsetY, hourDotRadius, 0, TAU);
          context.fill();
        }
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
      if (common.showsShadows) {
        context.lineWidth = secondHandWidth;
        context.strokeStyle = shadowColor;
        context.filter = 'blur(2px)';
        context.beginPath();
        context.moveTo(centerX + handShadowOffsetX, centerY + handShadowOffsetY);
        context.lineTo(secondHandEndPointX + handShadowOffsetX, secondHandEndPointY + handShadowOffsetY);
        context.stroke();
      }
      context.lineWidth = secondHandWidth;
      context.strokeStyle = common.textActiveColor;
      context.filter = 'none';
      context.beginPath();
      context.moveTo(centerX, centerY);
      context.lineTo(secondHandEndPointX, secondHandEndPointY);
      context.stroke();
    }

    // Draw the minute hand.
    if (common.showsShadows) {
      context.lineWidth = minuteHandWidth;
      context.strokeStyle = shadowColor;
      context.filter = 'blur(2px)';
      context.beginPath();
      context.moveTo(centerX + handShadowOffsetX, centerY + handShadowOffsetY);
      context.lineTo(minuteHandEndPointX + handShadowOffsetX, minuteHandEndPointY + handShadowOffsetY);
      context.stroke();
    }
    context.lineWidth = minuteHandWidth;
    context.strokeStyle = common.textActiveColor;
    context.filter = 'none';
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(minuteHandEndPointX, minuteHandEndPointY);
    context.stroke();

    // Draw the hour hand.
    if (common.showsShadows) {
      context.lineWidth = hourHandWidth;
      context.strokeStyle = shadowColor;
      context.filter = 'blur(2px)';
      context.beginPath();
      context.moveTo(centerX + handShadowOffsetX, centerY + handShadowOffsetY);
      context.lineTo(hourHandEndPointX + handShadowOffsetX, hourHandEndPointY + handShadowOffsetY);
      context.stroke();
    }
    context.lineWidth = hourHandWidth;
    context.strokeStyle = common.textActiveColor;
    context.filter = 'none';
    context.beginPath();
    context.moveTo(centerX, centerY);
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
})();
