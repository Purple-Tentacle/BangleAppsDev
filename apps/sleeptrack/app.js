(() => {

//Graph module, as long as modules are not added by the app loader
Modules.addCached("graph",function(){exports.drawAxes=function(b,c,a){function h(a){return e+m*(a-t)/x}function l(a){return f+g-g*(a-n)/u}var k=a.padx||0,d=a.pady||0,t=-k,w=c.length+k-1,n=(void 0!==a.miny?a.miny:a.miny=c.reduce(function(a,b){return Math.min(a,b)},c[0]))-d;c=(void 0!==a.maxy?a.maxy:a.maxy=c.reduce(function(a,b){return Math.max(a,b)},c[0]))+d;a.gridy&&(d=a.gridy,n=d*Math.floor(n/d),c=d*Math.ceil(c/d));var e=a.x||0,f=a.y||0,m=a.width||b.getWidth()-(e+1),g=a.height||b.getHeight()-(f+1);a.axes&&(null!==a.ylabel&&
    (e+=6,m-=6),null!==a.xlabel&&(g-=6));a.title&&(f+=6,g-=6);a.axes&&(b.drawLine(e,f,e,f+g),b.drawLine(e,f+g,e+m,f+g));a.title&&(b.setFontAlign(0,-1),b.drawString(a.title,e+m/2,f-6));var x=w-t,u=c-n;u||(u=1);if(a.gridx){b.setFontAlign(0,-1,0);var v=a.gridx;for(d=Math.ceil((t+k)/v)*v;d<=w-k;d+=v){var r=h(d),p=a.xlabel?a.xlabel(d):d;b.setPixel(r,f+g-1);var q=b.stringWidth(p)/2;null!==a.xlabel&&r>q&&b.getWidth()>r+q&&b.drawString(p,r,f+g+2)}}if(a.gridy)for(b.setFontAlign(0,0,1),d=n;d<=c;d+=a.gridy)k=l(d),
    p=a.ylabel?a.ylabel(d):d,b.setPixel(e+1,k),q=b.stringWidth(p)/2,null!==a.ylabel&&k>q&&b.getHeight()>k+q&&b.drawString(p,e-5,k+1);b.setFontAlign(-1,-1,0);return{x:e,y:f,w:m,h:g,getx:h,gety:l}};exports.drawLine=function(b,c,a){a=a||{};a=exports.drawAxes(b,c,a);var h=!0,l;for(l in c)h?b.moveTo(a.getx(l),a.gety(c[l])):b.lineTo(a.getx(l),a.gety(c[l])),h=!1;return a};exports.drawBar=function(b,c,a){a=a||{};a.padx=1;a=exports.drawAxes(b,c,a);for(var h in c)b.fillRect(a.getx(h-.5)+1,a.gety(c[h]),a.getx(h+
    .5)-1,a.gety(0));return a}});

const storage = require("Storage");
const SETTINGS_FILE = 'sleeptrack.settings.json';
const DATA_FILE = "sleeptrack3.data";

//return setting
function setting(key) {
//define default settings
const DEFAULTS = {
    'stepThreshold' : 30,
    'intervalResetActive' : 30000,
    'stepSensitivity' : 80,
};
if (!settings) { loadSettings(); }
return (key in settings) ? settings[key] : DEFAULTS[key];
}

//Convert ms to time
function getTime(t, tz)  {
    date = new Date(t);
    offset = date.getTimezoneOffset() / 60;
    seconds = Math.floor((t / 1000) % 60);
    minutes = Math.floor((t / (1000 * 60)) % 60);
    hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    if (tz == 1) hours = hours - offset;
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

//columns: 0=time, 1=stepsCounted, 2=active, 3=stepsTooShort, 4=stepsTooLong, 5=stepsOutsideTime
function getArrayFromCSV(file, column) { 
    i = 0;
    array = [];
    now = new Date();
    while ((nextLine = file.readLine())) { //as long as there is a next line
        if(nextLine) {
            dataSplitted = nextLine.split(','); //split line
            if (dataSplitted[1] == 1) array.push(dataSplitted[column]);
        }
        i++;
    }
    return array;
}

function drawGraph() {
    now = new Date();
    month = now.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var csvFile = storage.open(DATA_FILE, "r");
    times = getArrayFromCSV(csvFile, 0);
    print("times");
    first = times[0]; //first entry in datafile
    last =  times[times.length-1]; //last entry in datafile
    length = getTime(last-first, 0);
    first = getDate(first) + " " + getTime(first, 1)
    last = getDate(last) + " " + getTime(last, 1);
    //free memory
    csvFile = undefined;
    times = undefined;

    //steps
    var csvFile = storage.open(DATA_FILE, "r");
    active = getArrayFromCSV(csvFile, 1);
    print("active");

    //draw
    drawMenu();
    g.drawString(" Start: " + first, 10, 20);
    g.drawString("  Stop: " + last, 10, 30);
    g.drawString("Length: " + length, 10, 40);
    g.drawString("Length: " + length, 10, 40);
    // require("graph").drawBar(g, active, {
    //     axes : true,
    //     //gridy : 1,
    //     y : 60, //offset on screen
    //     x : 5, //offset on screen
    // });
    //free memory from big variables
    allData = undefined;
    allDataFile = undefined;
    csvFile = undefined;
    times = undefined;
    active = undefined;
}

function drawMenu () {
    g.clear();
    g.setFont("6x8", 1);
    g.drawString("BTN2:Draw", 20, 10);
}

setWatch(function() { //BTN2
    g.setFont("6x8", 2);
    g.drawString ("Drawing...",30,60);
    drawGraph();
}, BTN2, {edge:"rising", debounce:50, repeat:true});

//load settings
let settings;
function loadSettings() {
settings = storage.readJSON(SETTINGS_FILE, 1) || {};
}

drawMenu();

})();