'use strict';

(() => {
  window.darkTime = window.darkTime || {};
  window.darkTime.common = {};

  window.darkTime.common.BACKGROUND_COLOR_DEFAULT = '#222222';
  window.darkTime.common.TEXT_ACTIVE_COLOR_DEFAULT = '#777777';
  window.darkTime.common.TEXT_INACTIVE_COLOR_DEFAULT = '#333333';
  window.darkTime.common.ERROR_COLOR = '#DD2211';
  window.darkTime.common.SUCCESS_COLOR = '#22BB44';
  window.darkTime.common.HEX_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  window.darkTime.common.COLOR_FORMAT_ERROR_MESSAGE = 'Invalid hex color code';
})();
