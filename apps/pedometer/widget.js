(() => {
  var stepThreshold = 10; //steps needed for threshold
  var activeSeconds = 10; //in how many seconds dou you have to reach 10 steps so that they are counted
  var intervalResetActive = 30000; //interval for timer to reset active, in ms
  var stepGoal = 10000; //TODO: defne in settings
  const stepSensitivity = 80; //set step sensitivity (80 is standard, 400 is much less sensitive)

  var stepStart = false; //toggles each step to start or stop time
  var startTimeStep = 0; //set start time
  var stopTimeStep = 0; //Time after one step
  var stepTimeDiff = 9999; //Time difference between two steps
  const cMaxTime = 800; // Max step duration (ms)
  const cMinTime = 240; // Min step duration (ms)

  var steps = 0; //steps taken
  var stepsCounted = 0; //active steps counted
  var startTime = new Date();//set start time
  var stopTime; //stop time
  var stopTimeResetActive; //stop time to check in resetActive function
  var diff = 9999; //difference between start and end time
  var diffResetActive = 9999; //difference between start and stop in resetActive function
  var active = 0; //x steps in y seconds achieved
  var x = 0; //x position on screen
  var y = 40; //y position on screen
  var stepGoalPercent = 0; //percentage of step goal
  var stepGoalBarLength = 0; //length og progress bar
  var timerResetActive = 0; //timer to reset active
  const PEDOMFILE = "steps.json";
  var lastUpdate = new Date();

  var stepsTooShort = 0;
  var stepsTooLong = 0;
  var stepsOutsideTime = 0;

  var debug = 1; //1=show debug information

  //print debug info
  function printDebug() {
    print ("Settings:" + stepThreshold + "/" + activeSeconds + "/" + intervalResetActive + "/" + stepSensitivity);
    print ("Active: " + active);
    print ("Steps: " + steps);
    print ("Steps counted: " + stepsCounted);
    print ("Timediff " + diff);
    print ("Timediff resetActive: " + diffResetActive);
    print ("Steptime diff: " + stepTimeDiff);
    print ("StepStart: " + stepStart);
    print ("----");
  }

  function setStepSensitivity(s) {
    function sqr(x) { return x*x; }
    var X=sqr(8192-s);
    var Y=sqr(8192+s);
    Bangle.setOptions({stepCounterThresholdLow:X,stepCounterThresholdHigh:Y});
  }

  //format number to make them shorter
  function kFormatter(num) {
    if (num <= 999) return num; //smaller 1.000, return 600 as 600
    if (num >= 1000 && num < 10000) { //between 1.000 and 10.000
      num = Math.floor(num/100)*100;
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'; //return 1600 as 1.6k
    }
    if (num >= 10000) { //greater 10.000
      num = Math.floor(num/1000)*1000;
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'; //return 10.600 as 10k
    }
  }

  function calcSteps() {
    if (debug == 1) print("Function calcStep"); //Debug info

    //Calculate time between first and second step
    if (stepStart == true) {
      startTimeStep = new Date(); //start time after fist step
    }
    else {
      stopTimeStep = new Date(); //stop time after second step
      stepTimeDiff = stopTimeStep - startTimeStep; //time between steps in milliseconds
    }

    //Remove step if time between first and second step is too long
    if (stepTimeDiff >= cMaxTime) { //milliseconds
      if (debug ==1 ) print ("------ Too long")
      stepsTooLong++; //count steps which are note counted, because time too long
      steps--;
    }

    //Remove step if time between first and second step is too short
    if (stepTimeDiff <= cMinTime) { //milliseconds
      if (debug ==1 ) print ("------ Too short")
      stepsTooShort++; //count steps which are note counted, because time too short
      steps--;
    }

    //Calculate step threshold
    stopTime = new Date(); //set end time
    if (steps >= stepThreshold) { //steps reached threshold
      
      diff = (stopTime.getTime() - startTime.getTime()) / 1000; //endtime - start time, in seconds

      if (diff >= activeSeconds) startTime = new Date(); //set new start time after activeSeconds have passed
      if (diff <= activeSeconds) { //less than activeSeconds have passed
        if (debug == 1) print("-----Active condition met");
        active = 1; //set active
        clearInterval(timerResetActive); //stop timer which resets active
      }
      else { //more than activeSeconds seconds have passed, start timer to reset active
        timerResetActive = setInterval(resetActive, intervalResetActive); //reset active after timer runs out
      }

      if (active == 1) {
        stepsCounted += steps; //count steps
        steps = 0; //reset steps
      }
      else {
        stepsOutsideTime += steps; //count steps which are note counted, because threshold time too long
        steps = 0; //do nout count steps, reset steps
        startTime = new Date(); //set start time
      }
    }
  }

  //Set Active to 0
  function resetActive() {
    stopTimeResetActive = new Date(); //set end time
    diffResetActive = (stopTimeResetActive.getTime() - startTime.getTime()) / 1000; //endtime - start time in seconds
    if (debug == 1) print("---------------Function resetActive");
    if (diffResetActive > activeSeconds) active=0; //reset active, but only if step treshold timer has not run out
    if (debug == 1) printDebug();
    WIDGETS["steps"].draw();
  }

  function draw() {
    var width = 45;
    var height = 23;
    var stepsDisplayLarge = kFormatter(stepsCounted);
    
    //Check if same day
    let date = new Date();
    if (lastUpdate.getDate() == date.getDate()){ //if same day
    }
    else {
      stepsCounted = 1; //set stepcount to 1
    }
    lastUpdate = date;
    
    g.reset();
    g.clearRect(this.x, this.y, this.x+width, this.y+height);
    //if (debug == 1) g.drawRect(this.x,this.y,this.x+width,this.y+height); //draw rectangle around widget area
    
    //draw numbers
    if (active == 1) g.setColor(0x07E0); //green
    else g.setColor(0xFFFF); //white
    g.setFont("6x8", 2);
    g.drawString(stepsDisplayLarge,this.x+1,this.y);  //first line, big number
    g.setFont("6x8", 1);
    g.setColor(0xFFFF); //white
    g.drawString(stepsCounted,this.x+1,this.y+14); //second line, small number
    
    //draw step goal bar
    stepGoalPercent = (stepsCounted / stepGoal) * 100;
    stepGoalBarLength = width / 100 * stepGoalPercent;
    if (stepGoalBarLength > width) stepGoalBarLength = width; //do not draw across width of widget
    g.setColor(0x7BEF);
    g.fillRect(this.x, this.y+height, this.x+width, this.y+height); // draw bar
    g.setColor(0xFFFF);
    g.fillRect(this.x, this.y+height, this.x+1, this.y+height-1); //draw start of bar
    g.fillRect(this.x+width, this.y+height, this.x+width-1, this.y+height-1); //draw end of bar
    g.fillRect(this.x, this.y+height, this.x+stepGoalBarLength, this.y+height); // draw progress bar
  }

  //This event is called just before the device shuts down for commands such as reset(), load(), save(), E.reboot() or Bangle.off()
  E.on('kill', () => {
    let d = { //define array to write to file
      lastUpdate : lastUpdate.toISOString(),
      stepsToday : stepsCounted,
      active : active
    };
    require("Storage").write(PEDOMFILE,d); //write array to file
  });

  //When Step is registered by firmware
  Bangle.on('step', (up) => {
    //let date = new Date();
    steps++; //increase step count
    stepStart = !stepStart;
    calcSteps();
    if (debug ==1) printDebug();
    if (Bangle.isLCDOn()) WIDGETS["steps"].draw();
  });

  // redraw when the LCD turns on
  Bangle.on('lcdPower', function(on) {
    if (on) WIDGETS["steps"].draw();
  });

  //Read data from file and set variables
  let pedomData = require("Storage").readJSON(PEDOMFILE,1);
  if (pedomData) {
    if (pedomData.lastUpdate) lastUpdate = new Date(pedomData.lastUpdate);
    stepsCounted = pedomData.stepsToday|0;
    active = pedomData.active;
    stepsTooShort = pedomData.stepsTooShort;
    stepsTooLong = pedomData.stepsTooLong;
    stepsOutsideTime = pedomData.stepsOutsideTime;
  }

  setStepSensitivity(stepSensitivity) //set step sensitivity (80 is standard, 400 is muss les sensitive)

  //Add widget
  WIDGETS["steps"]={area:"tl",width:40,draw:draw};

})();