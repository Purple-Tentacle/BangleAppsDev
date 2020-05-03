(() => {
  var startTimeStep = new Date();
  var stopTimeStep = 0;
  // var timerResetActive = 0;
  // var timerStoreData = 0;
  var width = 23;
  var steps = 0;

  const s = require('Storage');
  const SETTINGS_FILE = 'sleeptrack.settings.json';
  const DATA_FILE = "sleeptrack3.data";
  var dataFile;
  // var storeDataInterval = 60*1000;
  
  let settings;
  function loadSettings() {
    settings = s.readJSON(SETTINGS_FILE, 1) || {};
  }

  function storeData()  {
    now = new Date();
    dataFile = s.open(DATA_FILE,"a");
    if (dataFile) {
      dataFile.write([
        now.getTime(),
        "1",
      ].join(",")+"\n");
    }
    dataFile = undefined;
  }

  function setting(key) {
    const DEFAULTS = {
      'stepThreshold' : 10,
      'intervalResetActive' : 30000,
      'stepSensitivity' : 80,
    };
  if (!settings) { loadSettings(); }
  return (key in settings) ? settings[key] : DEFAULTS[key];
  }

  function setStepSensitivity(s) {
    function sqr(x) { return x*x; }
    var X=sqr(8192-s);
    var Y=sqr(8192+s);
    Bangle.setOptions({stepCounterThresholdLow:X,stepCounterThresholdHigh:Y});
  }

  function resetActive() {
    active = 0;
  }

  function calcSteps() {
    stopTimeStep = new Date();
    stepTimeDiff = stopTimeStep - startTimeStep;
    startTimeStep = new Date();
    steps++;
    if (steps >= setting('stepThreshold')) {
      steps = 0;
      storeData();
    }
    print(steps);
  }

  function draw() {
    var height = 23;
    g.reset();
    g.drawRect(this.x, this.y, this.x+width, this.y+height);
  }

  Bangle.on('step', (up) => {
    print("step");
    calcSteps();
  });

  setStepSensitivity(setting('stepSensitivity'));
  // timerStoreData = setInterval(storeData, storeDataInterval);
  WIDGETS["sleeptrack"]={area:"br",width:width,draw:draw};
})();