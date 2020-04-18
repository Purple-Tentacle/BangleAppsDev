(() => {

const storage = require("Storage");
var csvFile = storage.open("activepedom.data.json", "r");
const history = 28800000; // 28800000=8h 43200000=12h //86400000=24h
var times = [];
var steps = [];
var actives = [];
var shorts = [];
var longs = [];
var outsides = [];

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

//Get JSON from CSV
function getArrayFromCSV(file, index) {
    i = 0;
    array = [];
    now = new Date();
    while ((nextLine = file.readLine())) { //as long as there is a next line
        if(nextLine) {
            dataSplitted = nextLine.split(','); //split line, 0= time, 1=stepsCounted, 2=active, 3=stepsTooShort, 4=stepsTooLong, 5=stepsOutsideTime

            diff = now - dataSplitted[0]; //calculate difference between now and stored time
            if (diff <= history) { //only entries from the last x ms
                switch(index) {
                    case 0:
                        array.push(dataSplitted[0]);
                        break;
                    case 1:
                        array.push(dataSplitted[1]);
                        break;
                    case 2:
                        array.push(dataSplitted[2]);
                        break;
                    case 3:
                        array.push(dataSplitted[3]);
                        break;
                    case 4:
                        array.push(dataSplitted[4]);
                        break;
                    case 5:
                        dataSplitted[5].slice(0,-1);
                        break;
                }
            }
        }
        i++;
    }
    return array;
}
times = getArrayFromCSV(csvFile, 0);
steps = getArrayFromCSV(csvFile, 0);
actives = getArrayFromCSV(csvFile, 0);
shorts = getArrayFromCSV(csvFile, 0);
longs = getArrayFromCSV(csvFile, 0);
outsides = getArrayFromCSV(csvFile, 0);

//free memory from big variables
allData = undefined;
allDataFile = undefined;
csvFile = undefined;
times = undefined;

})();