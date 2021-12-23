'use strict';

(() => {
  window.darkTime = window.darkTime || {};
  window.darkTime.common = {};

  const common = window.darkTime.common

  common.USES_24_HOUR_FORMAT_DEFAULT = false;
  common.INCLUDES_AM_PM_DEFAULT = false;
  common.INCLUDES_DIGITAL_TIME_IN_TITLE_DEFAULT = true;
  common.INCLUDES_EMOJI_IN_TITLE_DEFAULT = false;
  common.INTERPUNCT = '·';
  common.BACKGROUND_COLOR_DEFAULT = '#222222';
  common.TEXT_ACTIVE_COLOR_DEFAULT = '#777777';
  common.TEXT_INACTIVE_COLOR_DEFAULT = '#333333';
  common.ERROR_COLOR = '#DD2211';
  common.SUCCESS_COLOR = '#22BB44';
  common.HEX_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  common.COLOR_FORMAT_ERROR_MESSAGE = 'Invalid hex color code';
  common.TIME_EMOJIS = [
    '🕛',
    '🕐',
    '🕑',
    '🕒',
    '🕓',
    '🕔',
    '🕕',
    '🕖',
    '🕗',
    '🕘',
    '🕙',
    '🕚',
  ];
  common.CLOCK_ICON_PATH_PREFIX = '/images/clock_';
  common.ICON_SIZES = [
      16,
      32,
      48,
      64,
      128,
  ];

  common.backgroundColor = common.BACKGROUND_COLOR_DEFAULT;
  common.textActiveColor = common.TEXT_ACTIVE_COLOR_DEFAULT;
  common.textInactiveColor = common.TEXT_INACTIVE_COLOR_DEFAULT;

  common.uses24HourFormat = common.USES_24_HOUR_FORMAT_DEFAULT;
  common.includesAmPm = common.INCLUDES_AM_PM_DEFAULT;
  common.includesDigitalTimeInTitle = common.INCLUDES_DIGITAL_TIME_IN_TITLE_DEFAULT;

  common.getTimeString = getTimeString;
  common.getHourEmoji = getHourEmoji;
  common.getTitle = getTitle;

  function getTimeString() {
    const date = new Date();
    if (common.uses24HourFormat) {
      return date.toLocaleTimeString([], {timeStyle: 'short', hour12: false});
    } else {
      let bodyTimeString = date.toLocaleTimeString([], {timeStyle: 'short'});
      if (!common.includesAmPm) {
        bodyTimeString = bodyTimeString.replace(/ (am|pm)$/i, '');
      }
      return bodyTimeString;
    }
  }

  function getHourEmoji() {
    const date = new Date();
    const timeIndex = date.getHours() % 12;
    return common.TIME_EMOJIS[timeIndex];
  }

  function getTitle() {
    const bodyTimeString = getTimeString();
    if (common.INCLUDES_EMOJI_IN_TITLE_DEFAULT) {
      const emoji = getHourEmoji();
      if (common.includesDigitalTimeInTitle) {
        return `${emoji} ${bodyTimeString}`;
      } else {
        return emoji;
      }
    } else {
      if (common.includesDigitalTimeInTitle) {
        return bodyTimeString;
      } else {
        return common.INTERPUNCT;
      }
    }
  }
})();
