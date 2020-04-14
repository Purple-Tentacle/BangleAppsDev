(() => {
    var settings = {};
    var height = 23;
    var width = 40;
    var counter = 0;
    const storage = require('Storage');
    var interval =  0;

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

    function countDown() {
        //printDebug();
        if (counter > 0) {
            if (settings.started) {
                counter = counter - 1000;
                settings.counter = counter;
                storage.write('chronowid.json', settings);
                time = msToTime(counter);
                reload();
            }
        } else {
            if (settings.started) {
                Bangle.buzz(1500);
                time = msToTime(counter);
                clearInterval(interval);
                interval = 0;

                settings.started = false;
                storage.write('chronowid.json', settings);
                reload();
            }
        }
    }

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
        if (!settings.started) return;
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
            width = 0;
        }
        WIDGETS["chronowid"].draw();
    }

    settings = storage.readJSON("chronowid.json",1)||{};
    counter = calcCounter();
    time = msToTime(counter);

    
    if (settings.started) interval = setInterval(countDown, 1000);

    // add the widget
    WIDGETS["chronowid"]={area:"tl",width:width,draw:draw,reload:function() {
        reload();
        Bangle.drawWidgets(); // relayout all widgets
    }};

    // load settings, set correct widget width
    reload();
})();