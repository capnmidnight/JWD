var forever = "forever";
var useNote = false;
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
        return msg(parent, id, msgTxt, delay);
    else
        setTimeout(function(){
            new Notification("Just Write, Dammit!", {body: msgTxt, tag: id, icon: "jwd.png"});
        }, delay);
}

function msg(parent, id, msgTxt, delay, length){
    if(length == undefined){
        length = 4000;
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
    return box;
}

function spinner(parent, id, lbl, min, max){
    if(!max){
        max = Number.MAX_VALUE;
        if(!min)
            min = Number.MIN_VALUE;
        else{
            max = min - 1;
            min = 0;
        }
    }

    var spin = input({
            id: id,
            type: "text",
            size: Math.ceil(Math.log(max) / Math.log(10)) + 1,
            value: min
        });

    setStyle("textAlign", "right", spin);

    parent.appendChild(span({ id: id + "-spinner-container" },
        label({"for": id}, lbl),
        spin,
        button({type: "button",
                onclick: function(){
                    var v = parseInt(spin.getValue(), 10);
                    if(v > min){
                        spin.setValue(v - 1);
                        spin.fire("change");
                    }
                }
            }, "&nbsp;-&nbsp;"),
        button({type: "button",
                onclick: function(){
                    var v = parseInt(spin.getValue(), 10);
                    if(v < max){
                        spin.setValue(v + 1);
                        spin.fire("change");
                    }
                }
            }, "&nbsp;+&nbsp;")));

    return spin;
}