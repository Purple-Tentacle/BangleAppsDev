(function() {
    var musicState = "stop";
    var musicInfo = {"artist":"","album":"","track":""};
    var scrollPos = 0;
    var x = 0;
    var y = 20;
    var timer = 0;

    var debug = 1;
  
    function gb(j) {
      Bluetooth.println(JSON.stringify(j));
    }
  
    global.GB = function(j) {
      if (debug ==1) print("global.GB");
      switch (j.t) {
        case "musicinfo":
          musicInfo = j;
          draw();
          break;
        case "musicstate":
          musicState = j.state;
          draw();
          break;
      }
    };
  
    function draw() {
      g.clear();
      g.reset();
      g.setFont("6x8", 2);
      g.drawString("State: " + musicState,x+20,y);
      if (musicInfo.artist) g.drawString(musicInfo.artist,x,y+20); else g.drawString("Unknown Artist",x,y+20);
      if (musicInfo.album) g.drawString(musicInfo.album,x,y+40); else g.drawString("Unknown Album",x,y+40);
      if (musicInfo.track) g.drawString(musicInfo.track,x,y+60); else g.drawString("Unknown Track",x,y+60);
      g.drawString("BTN1: Vol up",x,y+100);
      g.drawString("BTN2: Play/Pause",x,y+120);
      g.drawString("BTN3: Vol down",x,y+140);
      g.drawString("BTN4: Previous",x,y+160);
      g.drawString("BTN5: Next",x,y+180);
  }
  
    setWatch(function() { //BTN1
      Bluetooth.println(JSON.stringify({t:"music", n:"volumeup"}));
      draw();
    }, BTN1, {edge:"rising", debounce:50, repeat:true});
    
    setWatch(function() { //BTN2
        if (musicState == "play") {
            Bluetooth.println(JSON.stringify({t:"music", n:"pause"})); //send pause
            for (i=0; i<=10;i++) {
              if (musicState == "play") Bluetooth.println(JSON.stringify({t:"music", n:"pause"})); //send pause
            }
        }
        if (musicState == "pause" || musicState == "stop") {
            Bluetooth.println(JSON.stringify({t:"music", n:"play"})); //send play
            for (i=0; i<=10;i++) {
              if (musicState == "pause" || musicState == "stop") Bluetooth.println(JSON.stringify({t:"music", n:"play"})); //send play
            }
        }
        else {
          for (i=0; i<=10;i++) {
            Bluetooth.println(JSON.stringify({t:"music", n:"play"})); //send play
          }
          for (i=0; i<=10;i++) {
            Bluetooth.println(JSON.stringify({t:"music", n:"pause"})); //send pause
          }
        }
        draw();
    }, BTN2, {edge:"rising", debounce:50, repeat:true});
    
    setWatch(function() { //BTN3
        Bluetooth.println(JSON.stringify({t:"music", n:"volumedown"}));
        draw();
    }, BTN3, {edge:"rising", debounce:50, repeat:true});
    
    setWatch(function() { //BTN4
        Bluetooth.println(JSON.stringify({t:"music", n:"previous"}));
        draw();
    }, BTN4, {edge:"rising", debounce:50, repeat:true});
    
    setWatch(function() { //BTN5
        Bluetooth.println(JSON.stringify({t:"music", n:"next"}));
        musicState = "play";
        draw();
    }, BTN5, {edge:"rising", debounce:50, repeat:true});
  
    draw();
  })();