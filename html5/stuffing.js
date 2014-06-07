var forever = "forever";
var useNote = false;

function note(id, msgTxt, delay){
    if(delay == undefined){
        delay = 0;
    }

    if(useNote
        && "Notification" in window
        && Notification.permission == "default"
        && !this.once){
        Notification.requestPermission();
        this.once = true;
    }

    if(!useNote
        || !("Notification" in window)
        || Notification.permission != "granted"){
        return msg(id, msgTxt, delay);
    }
    else{
        setTimeout(function(){
            new Notification("Just Write, Dammit!", {body: msgTxt, tag: id, icon: "jwd128x128.png"});
        }, delay);
    }
}

function XXX_RESET_XXX(){
    if(confirm("Are you sure you want to reset everything? This can't be undone.")){
        deleteSetting("storageType");
        deleteSetting("lastStorageType");
        deleteSetting("lastView");
        window.localStorage.removeItem("chapters");
        window.localStorage.removeItem("data");
        dorpboxSignout();
        gdriveSignout();
        document.location = document.location.href;
        ga('send', 'event', 'user', "reset");
    }
}

function msg(id, msgTxt, delay, length){
    if(length == undefined){
        length = 4000;
        if(delay == undefined){
            delay = 0;
        }
    }

    var s = span();
    s.innerHTML = msgTxt;

    var box = div(
        {
            id:id,
            "class":"note"
        },
        linkButton({
            id: id + "-dismiss-button",
            onclick: function(){
                hide(box);
                resize();
            }
        }, "\u00D7"),
        s);

    setTimeout(function(){
        notifications.appendChild(box);
        resize();
    }, delay);

    if(length != forever){
        setTimeout(function(){
            notifications.removeChild(box);
            resize();
        }, delay + length);
    }
    return box;
}

function spinner(txt, lbl, min, max){
    if(!max){
        max = Number.MAX_VALUE;
        if(!min){
            min = Number.MIN_VALUE;
        }
        else{
            max = min - 1;
            min = 0;
        }
    }

    var container = span({ id: txt.id + "-spinner-container" },
        label({"for": txt.id}, lbl));

    txt.parentElement.replaceChild(container, txt);
    var oldGetValue = txt.getValue.bind(txt);
    txt.getValue = function(){
        return parseInt(oldGetValue(), 10);
    };

    setStyle("textAlign", "right", txt);
    container.appendChild(txt);
    container.appendChild(linkButton({
            onclick: function(){
                var v = txt.getValue();
                if(v > min){
                    txt.setValue(v - 1);
                    txt.fire("change");
                }
            }
        }, "-"));
    container.appendChild(linkButton({
            onclick: function(){
                var v = txt.getValue();
                if(v < max){
                    txt.setValue(v + 1);
                    txt.fire("change");
                }
            }
        }, "+"));
    txt.setValue(min);
    return txt;
}


function fileUpload(fup){
    var browse = linkButton({
            id: fup.id + "-button",
            onclick: function(){
                fup.click()
            }
        },
        "Browse for files");

    var container = span({}, browse);
    fup.parentElement.replaceChild(container, fup);
    container.appendChild(fup);

    hide(fup);

    fup.addEventListener("change", function (){
        browse.textContent = fup.files.length == 0
            ? "Browse for files"
            : Array.prototype.map
                    .call(fup.files, function(f){
                        return fmt("$1 ($2.00MB, $3)",
                            f.name,
                            f.size / (1024 * 1024),
                            f.type || "application/unkown");
                    })
                    .join(", ");
    });

    return fup;
}
