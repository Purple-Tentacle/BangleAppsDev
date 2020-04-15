(() => {
    const storage = require('Storage');
    settingsChronowid = storage.readJSON("chronowid.json",1)||{}; //read settingsChronowid from file
    var height = 23;
    var width = 40;
    var interval =  0; //used for the 1 second interval timer
    var now = new Date();

    var time = 0;
    var diff = settingsChronowid.goal - now;
    
    //Convert ms to time
    function getTime(t)  {
        var milliseconds = parseInt((t % 1000) / 100),
        seconds = Math.floor((t / 1000) % 60),
        minutes = Math.floor((t / (1000 * 60)) % 60),
        hours = Math.floor((t / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
      
        return hours + ":" + minutes + ":" + seconds;
    }

    function printDebug() {
        print ("Nowtime: " + getTime(now));
        print ("Now: " + now);
        print ("Goaltime: " + getTime(settingsChronowid.goal));
        print ("Goal: " + settingsChronowid.goal);
        print("Difftime: " + getTime(diff));
        print("Diff: " + diff);
        print ("Started: " + settingsChronowid.started);
        print ("----");
    }

    //counts down, calculates and displays
    function countDown() {
        printDebug();
        now = new Date();
        diff = settingsChronowid.goal - now; //calculate difference
        WIDGETS["chronowid"].draw();
        //time is up
        if (settingsChronowid.started && diff <= 0) {
            Bangle.buzz(1500);
            print ("Time is up");
            //write timer off to file
            settingsChronowid.started = false;
            storage.writeJSON('chronowid.json', settingsChronowid);
            clearInterval(interval); //stop interval
            printDebug();
        }
    }

    // draw your widget
    function draw() {
        if (!settingsChronowid.started) return; //do not draw anything if timer is not started
        g.reset();
        g.clearRect(this.x,this.y,this.x+width,this.y+height);
        if (diff >= 0) g.drawString(getTime(diff), this.x+1, this.y+(height/2));
        else g.drawString("END", this.x+1, this.y+(height/2));
    }

    //This event is called just before the device shuts down for commands such as reset(), load(), save(), E.reboot() or Bangle.off()
    E.on('kill', () => {
        print("-KILL-");
    });

    if (settingsChronowid.started) interval = setInterval(countDown, 1000); //start countdown each second

    // add the widget
    WIDGETS["chronowid"]={area:"bl",width:width,draw:draw,reload:function() {
        reload();
        Bangle.drawWidgets(); // relayout all widgets
    }};

    printDebug();
    countDown();
})();