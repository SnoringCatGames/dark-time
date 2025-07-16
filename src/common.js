'use strict';

(() => {
  window.darkTime = window.darkTime || {};
  window.darkTime.common = {};

  const common = window.darkTime.common
  let options;
  let time;

  common.SHOWS_ANALOG_DISPLAY_DEFAULT = true;
  common.SHOWS_HOUR_MARKERS_DEFAULT = true;
  common.SHOWS_SECOND_HAND_DEFAULT = false;
  common.SHOWS_DISCRETE_HAND_TICKS_DEFAULT = false;
  common.SHOWS_SHADOWS_DEFAULT = true;
  common.USES_24_HOUR_FORMAT_DEFAULT = false;
  common.INCLUDES_AM_PM_DEFAULT = false;
  common.INCLUDES_DIGITAL_TIME_IN_TITLE_DEFAULT = false;
  common.INCLUDES_EMOJI_IN_TITLE_DEFAULT = false;

  common.INTERPUNCT = '·';

  // common.BACKGROUND_COLOR_DEFAULT = '#222222';
  // common.TEXT_ACTIVE_COLOR_DEFAULT = '#777777';
  // common.TEXT_INACTIVE_COLOR_DEFAULT = '#333333';

  // common.BACKGROUND_COLOR_DEFAULT = '#1D1F2F';
  // common.TEXT_ACTIVE_COLOR_DEFAULT = '#585751';
  // common.TEXT_INACTIVE_COLOR_DEFAULT = '#363635';

  common.BACKGROUND_COLOR_DEFAULT = '#1D1F2F';
  common.TEXT_ACTIVE_COLOR_DEFAULT = '#94924C';
  common.TEXT_INACTIVE_COLOR_DEFAULT = '#30385A';

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

  common.showsAnalogDisplay = common.SHOWS_ANALOG_DISPLAY_DEFAULT;
  common.showsHourMarkers = common.SHOWS_HOUR_MARKERS_DEFAULT;
  common.showsSecondHand = common.SHOWS_SECOND_HAND_DEFAULT;
  common.showsDiscreteHandTicks = common.SHOWS_DISCRETE_HAND_TICKS_DEFAULT;
  common.showsShadows = common.SHOWS_SHADOWS_DEFAULT;
  common.uses24HourFormat = common.USES_24_HOUR_FORMAT_DEFAULT;
  common.includesAmPm = common.INCLUDES_AM_PM_DEFAULT;
  common.includesDigitalTimeInTitle = common.INCLUDES_DIGITAL_TIME_IN_TITLE_DEFAULT;

  common.isInOptionsPage = false;
  common.isInitialized = false;

  common.getTimeCombinedString = getTimeCombinedString;
  common.getTimeDigitsString = getTimeDigitsString;
  common.getTimeAmPmString = getTimeAmPmString;
  common.getHourEmoji = getHourEmoji;
  common.getTitle = getTitle;
  common.init = init;

  function getTimeCombinedString() {
    const date = new Date();
    if (common.uses24HourFormat) {
      return date.toLocaleTimeString([], { timeStyle: 'short', hour12: false });
    } else {
      let bodyTimeString = date.toLocaleTimeString([], { timeStyle: 'short' });
      if (!common.includesAmPm) {
        bodyTimeString = bodyTimeString.replace(/ (am|pm)$/i, '');
      }
      return bodyTimeString;
    }
  }

  function getTimeDigitsString() {
    const date = new Date();
    if (common.uses24HourFormat) {
      return date.toLocaleTimeString([], { timeStyle: 'short', hour12: false });
    } else {
      let bodyTimeString = date.toLocaleTimeString([], { timeStyle: 'short' });
      bodyTimeString = bodyTimeString.replace(/ (am|pm)$/i, '');
      return bodyTimeString;
    }
  }

  function getTimeAmPmString() {
    if (common.uses24HourFormat) {
      return '';
    } else {
      const date = new Date();
      return date.getHours() >= 12 ? 'PM' : 'AM';
    }
  }

  function getHourEmoji() {
    const date = new Date();
    const timeIndex = date.getHours() % 12;
    return common.TIME_EMOJIS[timeIndex];
  }

  function getTitle() {
    const bodyTimeString = getTimeCombinedString();
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

  function init(isInOptionsPage) {
    common.isInOptionsPage = common.isInOptionsPage || isInOptionsPage;

    if (common.isInitialized) {
      return;
    }

    time = window.darkTime.time;
    options = window.darkTime.options;

    common.isInitialized = true;
    time.init();
  }
})();
