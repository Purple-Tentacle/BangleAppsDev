(() => {

const storage = require("Storage");
var history = 43200000; // 28800000=8h 43200000=12h //86400000=24h

//Convert ms to time
function getTime(t)  {
    date = new Date(t);
    offset = date.getTimezoneOffset() / 60;
    //var milliseconds = parseInt((t % 1000) / 100),
    seconds = Math.floor((t / 1000) % 60);
    minutes = Math.floor((t / (1000 * 60)) % 60);
    hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    hours = hours - offset;
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    return hours + ":" + minutes + ":" + seconds;
}

function getDate(t) {
    date = new Date(t*1);
    year = date.getFullYear();
    month = date.getMonth()+1; //month is zero-based
    day = date.getDate();
    month = (month < 10) ? "0" + month : month;
    day = (day < 10) ? "0" + day : day;
    return year + "-" + month + "-" + day;
}

//modes: history=show entries from last ms defined in history, day=show entries from current day
//columns: 0=time, 1=stepsCounted, 2=active, 3=stepsTooShort, 4=stepsTooLong, 5=stepsOutsideTime
function getArrayFromCSV(file, column, mode) { 
    i = 0;
    array = [];
    now = new Date();
    while ((nextLine = file.readLine())) { //as long as there is a next line
        if(nextLine) {
            dataSplitted = nextLine.split(','); //split line, 

            if (mode == "history") {
                diff = now - dataSplitted[0]; //calculate difference between now and stored time
                if (diff <= history) { //only entries from the last x ms
                        array.push(dataSplitted[column]);
                }
            }
            if (mode == "day") {
                date = new Date(dataSplitted[0]*1);
                if (now.getDate() == date.getDate()) { //same day
                        array.push(dataSplitted[column]);
                }
            }
        }
        i++;
    }
    return array;
}

var csvFile = storage.open("activepedom.data.json", "r");
times = getArrayFromCSV(csvFile, 0, "day");
start = getDate(times[0]) + " " + getTime(times[0]);
stop =  getDate (times[times.length-1]) + " " + getTime(times[times.length-1]);

var csvFile = storage.open("activepedom.data.json", "r");
steps = getArrayFromCSV(csvFile, 1, "day");
//define y-axis grid labels
stepsLastEntry = steps[steps.length-1];
if (stepsLastEntry < 1000) gridyValue = 100;
if (stepsLastEntry >= 1000 && stepsLastEntry < 10000) gridyValue = 500;
if (stepsLastEntry > 10000) gridyValue = 5000;

// actives = getArrayFromCSV(csvFile, 2);
// shorts = getArrayFromCSV(csvFile, 3);
// longs = getArrayFromCSV(csvFile, 4);
// outsides = getArrayFromCSV(csvFile, 5); //array.push(dataSplitted[5].slice(0,-1));

//draw graph
g.clear();
require("graph").drawLine(g, steps, {
    title: "Steps Counted",
    axes : true,
    gridy : gridyValue,
    y : 50, //offset on screen
    x : 5, //offset on screen
});

g.drawString("Start: " + start, 30, 10);
g.drawString(" Stop: " + stop, 30, 20); 

//free memory from big variables
allData = undefined;
allDataFile = undefined;
csvFile = undefined;
times = undefined;

})();