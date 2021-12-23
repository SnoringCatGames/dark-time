'use strict';

(() => {
  const common = window.darkTime.common;
  
  let timeElement;
  let colorSwatchElement;
  let saveStatusElement;
  let resetButtonElement;

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

  let isTextActiveColorShown;
  let toggleTextColorInterval;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    console.log('onDocumentLoad');

    document.removeEventListener('DOMContentLoaded', init);

    initializeElements();
    initializeSettings();
    updateTime();
  }

  function initializeElements() {
    timeElement = document.querySelector('#time');
    colorSwatchElement = document.querySelector('#color-swatch');
    saveStatusElement = document.querySelector('#save-status');
    resetButtonElement = document.querySelector('#reset button');

    uses24HourFormatInputElement = document.querySelector('#uses-24-hour-format input');
    includesAmPmInputElement = document.querySelector('#includes-am-pm input');
    includesDigitalTimeInTitleInputElement = document.querySelector('#includes-digital-time-in-title input');

    backgroundInputElement = document.querySelector('#background-color input');
    backgroundErrorElement = document.querySelector('#background-color .color-error');
    textActiveInputElement = document.querySelector('#text-active-color input');
    textActiveErrorElement = document.querySelector('#text-active-color .color-error');
    textInactiveInputElement = document.querySelector('#text-inactive-color input');
    textInactiveErrorElement = document.querySelector('#text-inactive-color .color-error');

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
    uses24HourFormatInputElement.checked = common.USES_24_HOUR_FORMAT_DEFAULT;
    includesAmPmInputElement.checked = common.INCLUDES_AM_PM_DEFAULT;
    includesDigitalTimeInTitleInputElement.checked = common.INCLUDES_DIGITAL_TIME_IN_TITLE_DEFAULT;
    backgroundInputElement.value = common.BACKGROUND_COLOR_DEFAULT;
    textActiveInputElement.value = common.TEXT_ACTIVE_COLOR_DEFAULT;
    textInactiveInputElement.value = common.TEXT_INACTIVE_COLOR_DEFAULT;
    updateSettings();
  }

  function updateSettings(record = true) {
    common.uses24HourFormat = uses24HourFormatInputElement.checked;
    common.includesAmPm = includesAmPmInputElement.checked;
    common.includesDigitalTimeInTitle = includesDigitalTimeInTitleInputElement.checked;
    validateColors();
    updateElementColors();
    if (record) {
      recordSettings();
    }
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

  function updateElementColors() {
    colorSwatchElement.style.backgroundColor = common.backgroundColor;
    isTextActiveColorShown = true;
    toggleTextColor();
    clearInterval(toggleTextColorInterval);
    toggleTextColorInterval = setInterval(toggleTextColor, 1000);
  }

  function toggleTextColor() {
    const textColor = isTextActiveColorShown ? common.textActiveColor : common.textInactiveColor;
    colorSwatchElement.style.color = textColor;
    isTextActiveColorShown = !isTextActiveColorShown;
  }

  function recordSettings() {
    if (!isBackgroundInputValid || !isTextActiveInputValid || !isTextInactiveInputValid) {
      return;
    }

    chrome.storage.sync.set({
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

  function updateTime() {
    timeElement.textContent = common.getTimeString();
    window.requestAnimationFrame(updateTime);
  }
})();
