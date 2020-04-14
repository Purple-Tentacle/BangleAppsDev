g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

const storage = require('Storage');
const boolFormat = v => v ? "On" : "Off";
let settings;

function updateSettings() {
  storage.write('chronowid.json', settings);
}

function resetSettings() {
  settings = {
    hours : 0,
    minutes : 0,
    seconds : 0,
    started : false,
    counter : 0,
  };
  updateSettings();
}

settings = storage.readJSON('chronowid.json',1);
if (!settings) resetSettings();

function showMenu() {
  const timerMenu = {
    '': {
      'title': 'Set timer',
      'predraw': function() {
        timerMenu.hours.value = settings.hours;
        timerMenu.minutes.value = settings.minutes;
        timerMenu.seconds.value = settings.seconds;
        timerMenu.started.value = settings.started;
      }
    },
    'Hours': {
      value: settings.hours,
      min: 0,
      max: 24,
      step: 1,
      onchange: v => {
        settings.hours = v;
        updateSettings();
      }
    },
    'Minutes': {
      value: settings.minutes,
      min: 0,
      max: 59,
      step: 1,
      onchange: v => {
        settings.minutes = v;
        updateSettings();
      }
    },
    'Seconds': {
      value: settings.seconds,
      min: 0,
      max: 59,
      step: 1,
      onchange: v => {
        settings.seconds = v;
        updateSettings();
      }
    },
    'Timer on': {
      value: settings.started,
      format: boolFormat,
      onchange: v => {
        settings.started = v;
        updateSettings();
      }
      },
    };
  timerMenu['-Exit-'] =  ()=>{load();};
  return E.showMenu(timerMenu);
}

showMenu();