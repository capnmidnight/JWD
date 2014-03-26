var forever = "forever";

function note(id, msgTxt, delay){
    if(delay == undefined)
        delay = 0;

    if("Notification" in window
        && Notification.permission == "default")
        Notification.requestPermission();

    if(!("Notification" in window)
        || Notification.permission != "granted")
        msg(id, msgTxt, delay);
    else
        setTimeout(function(){
            new Notification("Just Write, Dammit!", {body: msgTxt, tag: id});
        }, delay);
}

function msg(id, msgTxt, delay, length){
    if(length == undefined){
        length = 5000;
        if(delay == undefined)
            delay = 0;
    }

    var box = aside(
        {id:id},
        button({
            id:id + "-dismiss-button",
            type: "button",
            onclick: function(){
                hide(id);
            },
        }, "dismiss"),
        msgTxt);

    setTimeout(document.body.appendChild.bind(document.body), delay, box);
    if(length != forever)
        setTimeout(document.body.removeChild.bind(document.body), delay + length, box);
}