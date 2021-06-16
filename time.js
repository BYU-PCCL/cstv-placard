var x = setInterval(function () {
    countdown = false;
    var now = new Date();
    var date = new Date(); /* creating object of Date class */
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();
  
    var n = date.toLocaleTimeString([], {timeStyle: 'short'}).toLowerCase();
    var noSpace = n.split(" ");
    n = noSpace[0] + noSpace[1];

    var current_time = new Date().getTime()/1000;
    if((endTime - current_time) < 11 && (endTime - current_time) > 0){
        if(endTime - current_time > 0){
            n = "00:" + (Math.floor(endTime - current_time).toString().padStart(2,'0')) + "  ";
        } else {
            n = "00:00  ";
        }
    }

    document.getElementById("clock").innerHTML = n;
    
    
}, 1000);