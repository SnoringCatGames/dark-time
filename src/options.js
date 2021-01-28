'use strict';

(() => {
  let timeElement;
  let colorSwatchElement;
  let saveStatusElement;
  let resetButtonElement;

  let backgroundInputElement;
  let backgroundErrorElement;
  let textActiveInputElement;
  let textInactiveInputElement;
  let textActiveErrorElement;
  let textInactiveErrorElement;

  let isBackgroundInputValid;
  let isTextActiveInputValid;
  let isTextInactiveInputValid;

  let backgroundColor;
  let textActiveColor;
  let textInactiveColor;

  let isTextActiveColorShown;
  let toggleTextColorInterval;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    console.log('onDocumentLoad');

    document.removeEventListener('DOMContentLoaded', init);

    initializeElements();
    initializeColors();
    updateTime();
  }

  function initializeElements() {
    timeElement = document.querySelector('#time');
    colorSwatchElement = document.querySelector('#color-swatch');
    saveStatusElement = document.querySelector('#save-status');
    resetButtonElement = document.querySelector('#reset button');

    backgroundInputElement = document.querySelector('#background-color .color-input');
    backgroundErrorElement = document.querySelector('#background-color .color-error');
    textActiveInputElement = document.querySelector('#text-active-color .color-input');
    textActiveErrorElement = document.querySelector('#text-active-color .color-error');
    textInactiveInputElement = document.querySelector('#text-inactive-color .color-input');
    textInactiveErrorElement = document.querySelector('#text-inactive-color .color-error');

    backgroundInputElement.addEventListener('input', updateColors);
    textActiveInputElement.addEventListener('input', updateColors);
    textInactiveInputElement.addEventListener('input', updateColors);

    resetButtonElement.addEventListener('click', restoreDefaults);
  }

  function initializeColors() {
    updateColors(false);
    chrome.storage.sync.get({
      backgroundColor: window.darkTime.common.BACKGROUND_COLOR_DEFAULT,
      textActiveColor: window.darkTime.common.TEXT_ACTIVE_COLOR_DEFAULT,
      textInactiveColor: window.darkTime.common.TEXT_INACTIVE_COLOR_DEFAULT,
    }, items => {
      if (!!chrome.runtime.lastError) {
        saveStatusElement.textContent = 'Error loading!: ' + chrome.runtime.lastError;
        saveStatusElement.style.color = ERROR_COLOR;
      } else {
        backgroundInputElement.value = items.backgroundColor;
        textActiveInputElement.value = items.textActiveColor;
        textInactiveInputElement.value = items.textInactiveColor;
        updateColors(false);
      }
    });
  }

  function restoreDefaults() {
    backgroundInputElement.value = window.darkTime.common.BACKGROUND_COLOR_DEFAULT;
    textActiveInputElement.value = window.darkTime.common.TEXT_ACTIVE_COLOR_DEFAULT;
    textInactiveInputElement.value = window.darkTime.common.TEXT_INACTIVE_COLOR_DEFAULT;
    updateColors();
  }

  function updateColors(record = true) {
    validateColors();
    updateElementColors();
    if (record) {
      recordColors();
    }
  }

  function validateColors() {
    const backgroundString = backgroundInputElement.value;
    const textActiveString = textActiveInputElement.value;
    const textInactiveString = textInactiveInputElement.value;

    isBackgroundInputValid = window.darkTime.common.HEX_REGEX.test(backgroundString);
    isTextActiveInputValid = window.darkTime.common.HEX_REGEX.test(textActiveString);
    isTextInactiveInputValid = window.darkTime.common.HEX_REGEX.test(textActiveString);

    if (isBackgroundInputValid) {
      backgroundColor = backgroundString;
      backgroundErrorElement.style.display = 'none';
    } else {
      backgroundErrorElement.textContent = window.darkTime.common.COLOR_FORMAT_ERROR_MESSAGE;
      backgroundErrorElement.style.display = 'block';
    }
    if (isTextActiveInputValid) {
      textActiveColor = textActiveString;
      textActiveErrorElement.style.display = 'none';
    } else {
      textActiveErrorElement.textContent = window.darkTime.common.COLOR_FORMAT_ERROR_MESSAGE;
      textActiveErrorElement.style.display = 'block';
    }
    if (isTextInactiveInputValid) {
      textInactiveColor = textInactiveString;
      textInactiveErrorElement.style.display = 'none';
    } else {
      textInactiveErrorElement.textContent = window.darkTime.common.COLOR_FORMAT_ERROR_MESSAGE;
      textInactiveErrorElement.style.display = 'block';
    }
  }

  function updateElementColors() {
    colorSwatchElement.style.backgroundColor = backgroundColor;
    isTextActiveColorShown = true;
    toggleTextColor();
    clearInterval(toggleTextColorInterval);
    toggleTextColorInterval = setInterval(toggleTextColor, 1000);
  }

  function toggleTextColor() {
    const textColor = isTextActiveColorShown ? textActiveColor : textInactiveColor;
    colorSwatchElement.style.color = textColor;
    isTextActiveColorShown = !isTextActiveColorShown;
  }

  function recordColors() {
    if (!isBackgroundInputValid || !isTextActiveInputValid || !isTextInactiveInputValid) {
      return;
    }

    chrome.storage.sync.set({
      backgroundColor: backgroundColor,
      textActiveColor: textActiveColor,
      textInactiveColor: textInactiveColor,
    }, () => {
      if (!!chrome.runtime.lastError) {
        saveStatusElement.textContent = 'Error saving!: ' + chrome.runtime.lastError;
        saveStatusElement.style.color = window.darkTime.common.ERROR_COLOR;
      } else {
        saveStatusElement.textContent = 'Colors saved!';
        saveStatusElement.style.color = window.darkTime.common.SUCCESS_COLOR;
        setTimeout(() => saveStatusElement.textContent = '', 1000);
      }
    });
  }

  function updateTime() {
    // Update time
    const date = new Date();
    timeElement.textContent = date.toLocaleTimeString([], {timeStyle: 'short'});
    window.requestAnimationFrame(updateTime);
  }
})();
