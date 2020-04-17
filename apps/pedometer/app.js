const storage = require("Storage");
const graph = require("graph");
const dataFile = storage.open("activepedom.data.json", "r");

// initialize with default settings...
var data = {
    'time' : [],
    'stepsCounted' : [],
    'active' : [],
    'stepsTooShort' : [],
    'stepsTooLong' : [],
    'stepsOutsideTime' : [],
};

function getData(file) {
    lines = [];
    i = 0;
    while ((nextLine = file.readLine())) {
        if(nextLine) {
            lines.push(nextLine);
            dataSplitted = nextLine.split(',');
            data.time[i] = dataSplitted[0];
            data.stepsCounted[i] = dataSplitted[1];
            data.active[i] = dataSplitted[2];
            data.stepsTooShort[i] = dataSplitted[3];
            data.stepsTooLong[i] = dataSplitted[4];
            data.stepsOutsideTime[i] = dataSplitted[5];
        }
        i++;
    }
    return data;
}
data = getData(dataFile);

print(data.stepsTooLong);

g.clear();
g.setColor(0x07E0); //green
graph.drawLine(g,data.stepsCounted, {
    axes: true,
    gridy : 1000,
});

g.setColor(0xFFFF); //white
graph.drawLine(g,data.stepsOutsideTime, {
    axes: true,
    gridy : 1000,
});

data = undefined;

  
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