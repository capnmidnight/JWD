var getDOM = document.getElementById.bind(document);
var newDOM = function(tagName, attr){
    var children = Array.prototype.slice.call(arguments, 2);
    var tag = document.createElement(tagName);

    if(attr){
        for(var key in attr)
            tag[key] = attr[key];
    }

    children.forEach(function(c){
        if (c instanceof HTMLElement)
            tag.appendChild(c);
        else
            tag.innerHTML += c;
    });

    return tag;
}

var print = console.log.bind(console);

function sigfig(x, y) {
    var p = Math.pow(10, y);
    var v = (Math.round(x * p) / p).toString();
    if (y > 0) {
        var i = v.indexOf(".");
        if (i == -1) {
            v += ".";
            i = v.length - 1;
        }
        while (v.length - i - 1 < y)
            v += "0";
    }
    return v;
}

function fmt(template){
    var args = Array.prototype.slice.call(arguments, 1);
    var regex = /\$(0*)(\d+)(\.(0+))?/g;
    return template.replace(regex, function(m, pad, index, _, precision){
        var val = args[parseInt(index, 10) - 1].toString();
        var regex2;
        if(precision && precision.length > 0){
            val = sigfig(parseFloat(val, 10), precision.length);
        }
        if(pad && pad.length > 0){
            regex2 = new RegExp("^\\d{" + (pad.length + 1) + "}(\\.\\d+)?");
            while(!val.match(regex2))
                val = "0" + val;
        }
        return val;
    });
}

function setStyle(prop, val, box){
    if(typeof(box) == "string"){
        setStyle(prop, val, getDOM(box));
    }
    else if(box && box.style){
        box.style[prop] = val;
    }
}

var hide = setStyle.bind(window, "display", "none");
var show = setStyle.bind(window, "display", "block");

["a", "aside", "span"].forEach(function(tag){
    window[tag] = newDOM.bind(window, tag);
});

var px = fmt.bind(this, "$1px");

function move(elem, left, top, width, height){

    setStyle("left", px(left), elem);
    setStyle("top", px(top), elem);
    if(width != undefined){
        setStyle("width", px(width), elem);
        if(height != undefined)
            setStyle("height", px(height), elem);
    }
}