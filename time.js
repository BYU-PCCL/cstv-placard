var x = setInterval(function () {
    countdown = false;
    var now = new Date();
    var date = new Date(); /* creating object of Date class */
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();
  
    // var n = date.toLocaleTimeString();
    // var n = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    var n = date.toLocaleTimeString([], {timeStyle: 'short'}).toLowerCase();
    var noSpace = n.split(" ");
    n = noSpace[0] + noSpace[1];

    var current_time = new Date().getTime()/1000;
    console.log("endTime: " + endTime)
    console.log("current_Time: " + current_time)
    console.log("endTime - current: " + (endTime - current_time))
    if((endTime - current_time) < 10 && (endTime - current_time) > 0){
        // console.log("endTime: " + endTime)
        // console.log("current_Time: " + current_time)
        if(endTime - current_time > 0){
            n = "00:0" + Math.floor(endTime - current_time) + "  ";
        } else {
            n = "00:00  ";
        }
    }

    // Output the result in an element with id="demo"
    // document.getElementById("demo").innerHTML = hour + "h " + min + "m " + sec + "s ";
    if(!(countdown)){
        document.getElementById("clock").innerHTML = n;
        // document.getElementById("clock").innerHTML = "00:00pm";
    }

    

    
    
}, 1000);