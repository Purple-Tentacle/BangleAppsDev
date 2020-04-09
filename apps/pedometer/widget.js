(() => {
  var steps = 0; //steps taken
  var stepsCounted = 0; //active steps counted
  var startTime = new Date();//set start time
  var stepThreshold = 20; //steps needed for threshold
  var stopTime; //stop time
  var stopTimeResetActive; //stop time to check in resetActive function
  var diff = 9999; //difference between start and end time
  var diffResetActive = 9999; //difference between start and stop in resetActive function
  var active = 0; //x steps in y seconds achieved
  var activeSeconds = 20; //in how many seconds dou you have to reach 10 steps so that they are counted
  var x = 0; //x position on screen
  var y = 40; //y position on screen
  var stepGoal = 10000; //TODO: defne in settings
  var stepGoalPercent = 0; //percentage of step goal
  var stepGoalBarLength = 0; //length og progress bar
  //var timerCalc = 0; //used to periodically start step calculation
  //var intervalCalc = 30000; //how often should step calculation be done (is always done after a step), in ms
  var timerResetActive = 0; //timer to reset active
  var intervalResetActive = 30000; //interval for timer to reset active, in ms
  const PEDOMFILE = "steps.json";
  var lastUpdate = new Date();

  var debug = 1; //1=show debug information

  //print debug info
  function printDebug() {
    print ("Settings:" + stepThreshold + "/" + activeSeconds + "/" + intervalResetActive);
    print ("Active: " + active);
    print ("Steps: " + steps);
    print ("Steps counted: " + stepsCounted);
    print ("Timediff " + diff);
    print ("Timediff resetActive: " + diffResetActive);
    print ("----");
  }

  //format number > 999 as 1k, 10k etc. to make them shorter
  function kFormatter(num) {
    if (num > 999) {
      num = Math.floor(num/1000)*1000;
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    else return num;
  }

  function calcSteps() {
    if (debug == 1) print("Function calcStep"); //Debug info
    if (steps >= stepThreshold) { //steps reached threshold
      stopTime = new Date(); //set end time
      diff = (stopTime.getTime() - startTime.getTime()) / 1000; //endtime - start time in seconds
      if (diff >= activeSeconds) startTime = new Date(); //set new start time after activeSeconds have passed
      if (diff <= activeSeconds || active == 1) { //less than activeSeconds have passed OR active is 1: increase step count
        if (debug == 1) print("--------Active condition met");
        active = 1; //set active
        clearInterval(timerResetActive); //stop timer which resets active
        timerResetActive = setInterval(resetActive, intervalResetActive); //reset active after timer runs out
        
        stepsCounted += steps; //count steps
        steps = 0; //reset steps
      }
      else { //more than 10 seconds have passed OR active is 0: increase step count
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
    //active = 0;
    calcSteps();
    if (debug == 1) printDebug();
    WIDGETS["steps"].draw();
  }

  function draw() {
    var width = 35;
    var height = 23;
    var stepsDisplayLarge = kFormatter(stepsCounted);
    
    //Check if same day
    let date = new Date();
    //if (debug == 1) print("---" + lastUpdate.getDate());
    if (lastUpdate.getDate() == date.getDate()){ //if same day
      //if (debug == 1) print("---same day");
    }
    else {
      stepsCounted = 1; //set stepcount to 1
      //if (debug == 1) print("---different day");
    }
    lastUpdate = date;
    
    g.reset();
    g.clearRect(this.x, this.y, this.x+width, this.y+height);
    //if (debug == 1) g.drawRect(this.x,this.y,this.x+width,this.y+height); //draw rectangle around widget area
    
    //draw numbers
    if (active == 1) g.setColor(0x07E0); //green
    else g.setColor(0xFFE0); //yellow
    g.setFont("6x8", 2);
    g.drawString(stepsDisplayLarge,this.x+1,this.y);  //first line, big number
    g.setFont("6x8", 1);
    g.setColor(0xFFFF);
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
    calcSteps();
    if (debug ==1) printDebug();
    if (Bangle.isLCDOn()) WIDGETS["steps"].draw();
  });

  // redraw when the LCD turns on
  Bangle.on('lcdPower', function(on) {
    if (on) WIDGETS["steps"].draw();
  });

  //set timers
  //timerCalc = setInterval(calcSteps, intervalCalc); //calculate steps periodically
  timerResetActive = setInterval(resetActive, intervalResetActive); //reset active after timer runs out

  let pedomData = require("Storage").readJSON(PEDOMFILE,1);
  if (pedomData) {
    if (pedomData.lastUpdate) lastUpdate = new Date(pedomData.lastUpdate);
    stepsCounted = pedomData.stepsToday|0;
    active = pedomData.active;
  }

  //Add widget
  WIDGETS["steps"]={area:"tl",width:40,draw:draw};

})();