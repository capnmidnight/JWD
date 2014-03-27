var forever = "forever";
var useNote = true;
function note(parent, id, msgTxt, delay){
    if(delay == undefined)
        delay = 0;

    if(useNote
        && "Notification" in window
        && Notification.permission == "default"
        && !this.once){
        Notification.requestPermission();
        this.once = true;
    }

    if(!useNote
        || !("Notification" in window)
        || Notification.permission != "granted")
        msg(parent, id, msgTxt, delay);
    else
        setTimeout(function(){
            new Notification("Just Write, Dammit!", {body: msgTxt, tag: id, icon: "jwd.png"});
        }, delay);
}

function msg(parent, id, msgTxt, delay, length){
    if(length == undefined){
        length = 5000;
        if(delay == undefined)
            delay = 0;
    }

    var box = aside(
        {id:id},
        button({
            id: id + "-dismiss-button",
            type: "button",
            onclick: function(){
                setStyle("display", "none", box);
            }
        }, "dismiss"),
        msgTxt);

    setTimeout(parent.appendChild.bind(parent, box), delay);

    if(length != forever)
        setTimeout(parent.removeChild.bind(parent, box), delay + length);
}