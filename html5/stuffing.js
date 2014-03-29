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

function spinner(txt, lbl, min, max){
    if(!max){
        max = Number.MAX_VALUE;
        if(!min)
            min = Number.MIN_VALUE;
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
    container.appendChild(button({type: "button",
            onclick: function(){
                var v = txt.getValue();
                if(v > min){
                    txt.setValue(v - 1);
                    txt.fire("change");
                }
            }
        }, "-"));
    container.appendChild(button({type: "button",
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


// hide a real input[type='file'] behind custom controls
// that can be styled more appropriately -sean t. mcbeth
/*
function fileupload(id){
        options: {
        },

        // JQuery UI-required function for being able to change options on the fly
        _setOption: function (key, value) {
            this.options[key] = value;
            this._refresh();
        },

        _refresh: function () {
        },

        _button: null,
        _fileList: null,
        _upload: null,

        // JQuery UI-required function for initial setup.
        _create: function () {

            this._button = $("<button type='button'/>")
                .text("Browse for files")
                .css({ width: "100%" })
                .button()
                .click(function () {
                    this.element.click();
                }.bind(this))
                .appendTo(this.element.parent());

            this._fileList = $("<div id='file-list'/>")
                .appendTo(this.element.parent());

            var fs = this._fileList;

            this._upload = $("<button type='button'/>")
                .text("Upload")
                .css({ width: "100%" })
                .button()
                .click(function () {
                    showLoading("Uploading files", true);
                    var formData = new FormData(document.forms[0]);
                    var once = true;
                    $.ajax({
                        type: "POST",
                        url: "UploadDataFile.aspx",
                        error: failDetail,
                        success: function (result) {
                            if (once) {
                                console.log(result);
                                var ids = result.match(/\d+/g);
                                console.log(ids);
                                var check = function (uploadJobIDs) {
                                    console.log(uploadJobIDs);
                                    RiekerPortal.MapWebService.GetUploadProgress(uploadJobIDs,
                                        function (percent) {
                                            percent *= 100;
                                            console.log("Completion: ", percent);
                                            fs.html(sigfig(percent, 2) + "%");
                                            if (percent > 99)
                                                clearInterval(interval);
                                        }.bind(this),
                                        function (fail) {
                                            clearInterval(interval);
                                            failDetail(fail);
                                        });
                                }.bind(this);
                                var interval = setInterval(check, 1000, ids);
                                showLoading("Files uploaded", false);
                                once = false;
                            }
                        }.bind(this),
                        data: formData,
                        processData: false,
                        contentType: false
                    });
                })
                .appendTo(this.element.parent());

            this._upload.button("disable");

            this.element
                .css({ display: "none" })
                .change(function () {
                    this._fileList.html(Array.prototype
                        .map.call(this.element.context.files, function (f) {
                            return "<div>" + f.name + "</div>";
                        })
                        .reduce(function (a, b) { return a + b; }));
                    this._upload.button("enable");
                }.bind(this));;
        },

        // JQuery UI-required function for cleaning up after the control
        destroy: function () {
            this.element.text("");
            $.Widget.prototype.destroy.call(this);
        }
    });

})(jQuery);
* */