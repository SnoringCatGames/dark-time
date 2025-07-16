'use strict';

(() => {
  window.darkTime = window.darkTime || {};
  window.darkTime.options = {};

  const options = window.darkTime.options;
  let common;
  let time;

  let clockContainer;
  let saveStatusElement;
  let resetButtonElement;

  let analogOptionsContainerElement;
  let digitalOptionsContainerElement;

  let showsAnalogDisplayInputElement;
  let showsHourMarkersInputElement;
  let showsSecondHandInputElement;
  let showsDiscreteHandTicksInputElement;
  let showsShadowsInputElement;
  let uses24HourFormatInputElement;
  let includesAmPmInputElement;
  let includesDigitalTimeInTitleInputElement;

  let backgroundInputElement;
  let backgroundErrorElement;
  let textActiveInputElement;
  let textInactiveInputElement;
  let textActiveErrorElement;
  let textInactiveErrorElement;

  let isBackgroundInputValid;
  let isTextActiveInputValid;
  let isTextInactiveInputValid;

  document.addEventListener('DOMContentLoaded', onDocumentLoad);

  function onDocumentLoad() {
    console.log('options.js > onDocumentLoad');

    document.removeEventListener('DOMContentLoaded', onDocumentLoad);

    common = window.darkTime.common;
    time = window.darkTime.time;
    common.init(true);

    initializeElements();
    initializeSettings();
  }

  function initializeElements() {
    clockContainer = document.querySelector('#clock');
    saveStatusElement = document.querySelector('#save-status');
    resetButtonElement = document.querySelector('#reset button');

    analogOptionsContainerElement = document.querySelector('#analog-options');
    digitalOptionsContainerElement = document.querySelector('#digital-options');

    showsAnalogDisplayInputElement = document.querySelector('#uses-analog-display input');
    showsHourMarkersInputElement = document.querySelector('#uses-hour-markers input');
    showsSecondHandInputElement = document.querySelector('#uses-second-hand input');
    showsDiscreteHandTicksInputElement = document.querySelector('#uses-discrete-hand-ticks input');
    showsShadowsInputElement = document.querySelector('#uses-shadows input');
    uses24HourFormatInputElement = document.querySelector('#uses-24-hour-format input');
    includesAmPmInputElement = document.querySelector('#includes-am-pm input');
    includesDigitalTimeInTitleInputElement = document.querySelector('#includes-digital-time-in-title input');

    backgroundInputElement = document.querySelector('#background-color input');
    backgroundErrorElement = document.querySelector('#background-color .color-error');
    textActiveInputElement = document.querySelector('#text-active-color input');
    textActiveErrorElement = document.querySelector('#text-active-color .color-error');
    textInactiveInputElement = document.querySelector('#text-inactive-color input');
    textInactiveErrorElement = document.querySelector('#text-inactive-color .color-error');

    showsAnalogDisplayInputElement.addEventListener('change', updateSettings);
    showsHourMarkersInputElement.addEventListener('change', updateSettings);
    showsSecondHandInputElement.addEventListener('change', updateSettings);
    showsDiscreteHandTicksInputElement.addEventListener('change', updateSettings);
    showsShadowsInputElement.addEventListener('change', updateSettings);
    uses24HourFormatInputElement.addEventListener('change', updateSettings);
    includesAmPmInputElement.addEventListener('change', updateSettings);
    includesDigitalTimeInTitleInputElement.addEventListener('change', updateSettings);

    backgroundInputElement.addEventListener('change', updateSettings);
    textActiveInputElement.addEventListener('change', updateSettings);
    textInactiveInputElement.addEventListener('change', updateSettings);

    resetButtonElement.addEventListener('click', restoreDefaults);
  }

  function initializeSettings() {
    updateSettings(false);
    chrome.storage.sync.get({
      showsAnalogDisplay: common.SHOWS_ANALOG_DISPLAY_DEFAULT,
      showsHourMarkers: common.SHOWS_HOUR_MARKERS_DEFAULT,
      showsSecondHand: common.SHOWS_SECOND_HAND_DEFAULT,
      showsDiscreteHandTicks: common.SHOWS_DISCRETE_HAND_TICKS_DEFAULT,
      showsShadows: common.SHOWS_SHADOWS_DEFAULT,
      uses24HourFormat: common.USES_24_HOUR_FORMAT_DEFAULT,
      includesAmPm: common.INCLUDES_AM_PM_DEFAULT,
      includesDigitalTimeInTitle: common.INCLUDES_DIGITAL_TIME_IN_TITLE_DEFAULT,
      backgroundColor: common.BACKGROUND_COLOR_DEFAULT,
      textActiveColor: common.TEXT_ACTIVE_COLOR_DEFAULT,
      textInactiveColor: common.TEXT_INACTIVE_COLOR_DEFAULT,
    }, items => {
      if (!!chrome.runtime.lastError) {
        saveStatusElement.textContent = 'Error loading!: ' + chrome.runtime.lastError;
        saveStatusElement.style.color = common.ERROR_COLOR;
      } else {
        showsAnalogDisplayInputElement.checked = items.showsAnalogDisplay;
        showsHourMarkersInputElement.checked = items.showsHourMarkers;
        showsSecondHandInputElement.checked = items.showsSecondHand;
        showsDiscreteHandTicksInputElement.checked = items.showsDiscreteHandTicks;
        showsShadowsInputElement.checked = items.showsShadows;
        uses24HourFormatInputElement.checked = items.uses24HourFormat;
        includesAmPmInputElement.checked = items.includesAmPm;
        includesDigitalTimeInTitleInputElement.checked = items.includesDigitalTimeInTitle;
        backgroundInputElement.value = items.backgroundColor;
        textActiveInputElement.value = items.textActiveColor;
        textInactiveInputElement.value = items.textInactiveColor;
        updateSettings(false);
      }
    });
  }

  function restoreDefaults() {
    showsAnalogDisplayInputElement.checked = common.SHOWS_ANALOG_DISPLAY_DEFAULT;
    showsHourMarkersInputElement.checked = common.SHOWS_HOUR_MARKERS_DEFAULT;
    showsSecondHandInputElement.checked = common.SHOWS_SECOND_HAND_DEFAULT;
    showsDiscreteHandTicksInputElement.checked = common.SHOWS_DISCRETE_HAND_TICKS_DEFAULT;
    showsShadowsInputElement.checked = common.SHOWS_SHADOWS_DEFAULT;
    uses24HourFormatInputElement.checked = common.USES_24_HOUR_FORMAT_DEFAULT;
    includesAmPmInputElement.checked = common.INCLUDES_AM_PM_DEFAULT;
    includesDigitalTimeInTitleInputElement.checked = common.INCLUDES_DIGITAL_TIME_IN_TITLE_DEFAULT;
    backgroundInputElement.value = common.BACKGROUND_COLOR_DEFAULT;
    textActiveInputElement.value = common.TEXT_ACTIVE_COLOR_DEFAULT;
    textInactiveInputElement.value = common.TEXT_INACTIVE_COLOR_DEFAULT;
    updateSettings();
  }

  function updateSettings(record = true) {
    common.showsAnalogDisplay = showsAnalogDisplayInputElement.checked;
    common.showsHourMarkers = showsHourMarkersInputElement.checked;
    common.showsSecondHand = showsSecondHandInputElement.checked;
    common.showsDiscreteHandTicks = showsDiscreteHandTicksInputElement.checked;
    common.showsShadows = showsShadowsInputElement.checked;
    common.uses24HourFormat = uses24HourFormatInputElement.checked;
    common.includesAmPm = includesAmPmInputElement.checked;
    common.includesDigitalTimeInTitle = includesDigitalTimeInTitleInputElement.checked;
    validateColors();
    if (record) {
      recordSettings();
    }
    analogOptionsContainerElement.style.display = common.showsAnalogDisplay ? 'flex' : 'none';
    digitalOptionsContainerElement.style.display = common.showsAnalogDisplay ? 'none' : 'flex';
    time.update();
  }

  function validateColors() {
    const backgroundString = backgroundInputElement.value;
    const textActiveString = textActiveInputElement.value;
    const textInactiveString = textInactiveInputElement.value;

    isBackgroundInputValid = common.HEX_REGEX.test(backgroundString);
    isTextActiveInputValid = common.HEX_REGEX.test(textActiveString);
    isTextInactiveInputValid = common.HEX_REGEX.test(textActiveString);

    if (isBackgroundInputValid) {
      common.backgroundColor = backgroundString;
      backgroundErrorElement.style.display = 'none';
    } else {
      backgroundErrorElement.textContent = common.COLOR_FORMAT_ERROR_MESSAGE;
      backgroundErrorElement.style.display = 'block';
    }
    if (isTextActiveInputValid) {
      common.textActiveColor = textActiveString;
      textActiveErrorElement.style.display = 'none';
    } else {
      textActiveErrorElement.textContent = common.COLOR_FORMAT_ERROR_MESSAGE;
      textActiveErrorElement.style.display = 'block';
    }
    if (isTextInactiveInputValid) {
      common.textInactiveColor = textInactiveString;
      textInactiveErrorElement.style.display = 'none';
    } else {
      textInactiveErrorElement.textContent = common.COLOR_FORMAT_ERROR_MESSAGE;
      textInactiveErrorElement.style.display = 'block';
    }
  }

  function recordSettings() {
    if (!isBackgroundInputValid || !isTextActiveInputValid || !isTextInactiveInputValid) {
      return;
    }

    chrome.storage.sync.set({
      showsAnalogDisplay: common.showsAnalogDisplay,
      showsHourMarkers: common.showsHourMarkers,
      showsSecondHand: common.showsSecondHand,
      showsDiscreteHandTicks: common.showsDiscreteHandTicks,
      showsShadows: common.showsShadows,
      uses24HourFormat: common.uses24HourFormat,
      includesAmPm: common.includesAmPm,
      includesDigitalTimeInTitle: common.includesDigitalTimeInTitle,
      backgroundColor: common.backgroundColor,
      textActiveColor: common.textActiveColor,
      textInactiveColor: common.textInactiveColor,
    }, () => {
      if (!!chrome.runtime.lastError) {
        saveStatusElement.textContent = 'Error saving!: ' + chrome.runtime.lastError;
        saveStatusElement.style.color = common.ERROR_COLOR;
      } else {
        saveStatusElement.textContent = 'Settings saved!';
        saveStatusElement.style.color = common.SUCCESS_COLOR;
        setTimeout(() => saveStatusElement.textContent = '', 1000);
      }
    });
  }
})();
