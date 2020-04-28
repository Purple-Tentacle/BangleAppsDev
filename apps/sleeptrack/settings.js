// This file should contain exactly one function, which shows the app's settings
/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = 'sleeptrack.settings.json';

  // initialize with default settings...
  let s = {
    'stepThreshold' : 30,
    'intervalResetActive' : 30000,
    'stepSensitivity' : 80,
  };
  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage');
  const saved = storage.readJSON(SETTINGS_FILE, 1) || {};
  for (const key in saved) {
    s[key] = saved[key];
  }

  // creates a function to safe a specific setting, e.g.  save('color')(1)
  function save(key) {
    return function (value) {
      s[key] = value;
      storage.write(SETTINGS_FILE, s);
    };
  }

  const menu = {
    '': { 'title': 'Sleep Tracker' },
    '< Back': back,
    'Step threshold': {
      value: s.stepThreshold,
      min: 0,
      max: 100,
      step: 1,
      onchange: save('stepThreshold'),
    },
    'Act.Res. (ms)': {
      value: s.intervalResetActive,
      min: 100,
      max: 100000,
      step: 1000,
      onchange: save('intervalResetActive'),
    },
    'Step sens.': {
      value: s.stepSensitivity,
      min: 0,
      max: 1000,
      step: 10,
      onchange: save('stepSensitivity'),
    },
  };
  E.showMenu(menu);
});