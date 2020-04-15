(() => {
    var settings = {};
    var height = 23;
    var width = 40;
    var counter = 0; //the actual timer
    const storage = require('Storage');
    var interval =  0; //used for the 1 second interval timer

    var hours = 0,
        minutes = 0,
        seconds = 0,
        ms = 0;

    /*
    function printDebug() {
        print ("Time: " + time);
        print ("Counter: " + counter);
        print ("Started: " + settings.started);
        print ("----");
    }
    */

    //counts down, calculates and displays
    function countDown() {
        //printDebug();
        if (counter > 0) { //time is not up
            if (settings.started) { //check if timer is on
                counter = counter - 1000; //substrct 1 second, because tinmer runs every second
                settings.counter = counter; 
                storage.write('chronowid.json', settings); //write timer progress to file
                time = msToTime(counter);
                reload();
            }
        } else { //time is up
            if (settings.started) { //check if timer is on
                Bangle.buzz(1500);
                time = msToTime(counter);
                clearInterval(interval); //stop timer, otherwiese this else poirtion will be called every second
                interval = 0;

                settings.started = false;
                storage.write('chronowid.json', settings); //write started to file
                reload();
            }
        }
    }

    //takes ms and converts to time display (00:00:00)
    function msToTime(duration) {
        var milliseconds = parseInt((duration % 1000) / 100),
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds;
    }

    //take values from settings file and convert to ms
    function calcCounter() {
        if (settings.counter == 0) {
            hours = settings.hours;
            minutes =settings.minutes;
            seconds = settings.seconds;
            ms = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000);
        }
        else  {
            ms = settings.counter;
        }
        return ms;
    }

    // draw your widget
    function draw() {
        if (!settings.started) return; //do not draw anything if timer is not started
        g.reset();
        g.clearRect(this.x,this.y,this.x+width,this.y+height);
        g.drawString(time, this.x+1, this.y+(height/2));
    }

    function reload() {
        settings = storage.readJSON("chronowid.json",1)||{};

        if (settings.started) {
            width = 40;
        } 
        else {
            width = 0; //if timer is not started
        }
        WIDGETS["chronowid"].draw();
    }

    settings = storage.readJSON("chronowid.json",1)||{}; //read settings from file
    counter = calcCounter(); //calulate ms from setting values
    time = msToTime(counter); //calculate time from ms

    if (settings.started) interval = setInterval(countDown, 1000); //start countdown each second

    // add the widget
    WIDGETS["chronowid"]={area:"tl",width:width,draw:draw,reload:function() {
        reload();
        Bangle.drawWidgets(); // relayout all widgets
    }};

    // load settings, set correct widget width
    reload();
})();