const storage = require("Storage");
const graph = require("graph");
var dataFile = storage.open("activepedom.data.json", "r");

// initialize with default settings...
var data = {
    'entries' : [{
        'time' : 0,
        'stepsCounted' : 0,
        'active' : 0,
        'stepsTooShort' : 0,
        'stepsTooLong' : 0,
        'stepsOutsideTime' : 0,
    }]
};

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

function getData(file) {
    lines = [];
    i = 0;
    while ((nextLine = file.readLine())) {
        if(nextLine) {
            lines.push(nextLine);
            dataSplitted = nextLine.split(',');

            data.entries.push({
                "time" : dataSplitted[0], 
                "stepsCounted" : dataSplitted[1],
                "active" : dataSplitted[2],
                "stepsTooShort" : dataSplitted[3],
                "stepsTooLong" : dataSplitted[4],
                "stepsOutsideTime" : dataSplitted[5]
            });
        }
        i++;
    }
    return data;
}
data = getData(dataFile);

print(data.entries[1]);

data = undefined;
dataFile = undefined;

// now = new Date();
// data.time.forEach(function(entry) {
//     diff = now - entry;
//     print (entry + " " + getTime(diff));
//     print(getTime(entry));
// });


// g.clear();
// g.setColor(0x07E0); //green
// graph.drawLine(g,data.stepsCounted, {
//     axes: true,
//     gridy : 1000,
// });

// g.setColor(0xFFFF); //white
// graph.drawLine(g,data.stepsOutsideTime, {
//     axes: true,
//     gridy : 1000,
// });


  
  //Get all entries for a given date
  //Currently unused
  function getCSVContent(date,arrCSV){
    var dd = String(date.getDate());
    if(dd<10)dd='0'+dd;
    var mm = String(date.getMonth() + 1);
    if(mm<10)mm='0'+mm;
    var yyyy = date.getFullYear();
    dateStr = (yyyy + "-" + mm + "-" + dd);
  
    //Go through lines and get pressure for date given at call of function
    var arrPressureData = [];
    for (var line=0; line<arrCSV.length; line++) {
        if (arrCSV[line][0] == dateStr){
          arrPressureData.push(arrCSV[line][2]);
          //print ("pressure at " + arrCSV[line][1] + ": " + arrCSV[line][2]);
      }
    }
    return (arrPressureData);
  }