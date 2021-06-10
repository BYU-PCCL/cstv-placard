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
    
    // Output the result in an element with id="demo"
    // document.getElementById("demo").innerHTML = hour + "h " + min + "m " + sec + "s ";
    if(!(countdown)){
        document.getElementById("clock").innerHTML = n;
    }
    
    
}, 1000);