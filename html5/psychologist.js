var getDOM = document.getElementById.bind(document);
var newDOM = function(tagName, attr){
    var children = Array.prototype.slice.call(arguments, 2);
    var tag = document.createElement(tagName);

    if(attr){
        function setATTR(t, vs){
            for(var key in vs){
                if(key.indexOf("on") == 0)
                    t.addEventListener(
                        key.substring(2),
                        attr[key], false);
                else if(vs[key] instanceof Object)
                    setATTR(t[key], vs[key]);
                else
                    t[key] = vs[key];
            }
        }
        setATTR(tag, attr);
    }

    children.forEach(function(c){
        var cs = [c];
        if (typeof(c) == "string" || c instanceof String){
            var temp = document.createElement("div");
            temp.innerHTML = c;
            cs = Array.prototype.slice.call(temp.childNodes);
        }
        while(cs.length > 0)
            tag.appendChild(cs.shift());
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
        var val = args[parseInt(index, 10) - 1];
        if(val != undefined){
            val = val.toString();
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
        }
        return "undefined";
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

// hand-scraped from https://developer.mozilla.org/en-US/docs/Web/HTML/Element
// document.getElementsByClassName("index widgeted")[0].textContent.match(/<\w+>/g).map(function(m){return "\""+m.substring(1, m.length - 1)+"\"";}).join(",")
["a","abbr","acronym","address","applet","area","article","aside","audio","b","base","basefont","bdi","bdo","bgsound","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dir","div","dl","dt","element","em","embed","fieldset","figcaption","figure","font","footer","form","frame","frameset","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe","img","input","ins","isindex","kbd","keygen","label","legend","li","link","listing","main","map","mark","marquee","menu","menuitem","meta","meter","nav","nobr","noframes","noscript","object","ol","optgroup","option","output","p","param","plaintext","pre","progress","q","rp","rt","ruby","s","samp","script","section","select","shadow","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","title","tr","track","tt","u","ul","var","video","wbr","xmp"].forEach(function(tag){
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