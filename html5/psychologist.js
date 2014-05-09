if (document.location.hostname != "localhost" 
    && document.location.hostname != "127.0.0.1" 
    && !document.location.hostname.match(/192\.168\.0\.\d+/) 
    && document.location.protocol == "http:"){
    document.location = document.location.replace("http://", "https://");
}

function getSetting(name, defValue){
    return (window.localStorage && window.localStorage.getItem(name)) || defValue;
}

function setSetting(name, value){
    if (window.localStorage){
        window.localStorage.setItem(name, value);
    }
}

function deleteSetting(name){
    if(window.localStorage){
        window.localStorage.removeItem(name);
    }
}

var getDOM = document.querySelector.bind(document);

// snagged and adapted from http://detectmobilebrowsers.com/
var isMobile = (function(a){return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substring(0, 4));})(navigator.userAgent||navigator.vendor||window.opera);

var isiOS = /Apple-iP(hone|od|ad)/.test(navigator.userAgent||"");

function arr(arg, a, b){
    return Array.prototype.slice.call(arg, a, b);
}

function getDOMAll(sel){
    var nodes = document.querySelectorAll(sel);
    return arr(nodes);
}

function setATTRs(t, vs){
    if(t && vs){
        for(var key in vs){
            if(key.indexOf("on") == 0){
                t.addEventListener(
                    key.substring(2),
                    vs[key], false);
            }
            else if(vs[key] instanceof Object){
                setATTRs(t[key], vs[key]);
            }
            else{
                t.setAttribute(key, vs[key]);
            }
        }
    }
}

function flatten(arr){
    var output = [];
    var todo = [arr];
    while(todo.length > 0){
        var cur = todo.shift();
        if(cur instanceof Array){
            while(cur.length > 0){
                todo.push(cur.shift());
            }
        }
        else{
            output.push(cur);
        }
    }
    return output;
}

var newDOM = function(){
    var children = arr(arguments);
    var tagName = children.shift();
    var attr, children;
    var tag = document.createElement(tagName);

    children = flatten(children).map(function(c){
        if(typeof(c) == "string"
            || typeof(c) == "number"
            || c instanceof Date){
            c = document.createTextNode(c);
        }
        return c;
    });
    
    if(children.length > 0
        && !(children[0] instanceof Node)
        && !(children[0] instanceof Element)){
        attr = children.shift();
    }

    setATTRs(tag, attr);

    children.forEach(function(c){
        tag.appendChild(c);
    });

    return tag;
}

var print = console.log.bind(console);

function sigfig(x, y){
    var p = Math.pow(10, y);
    var v = (Math.round(x * p) / p).toString();
    if (y > 0){
        var i = v.indexOf(".");
        if (i == -1){
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
        index = parseInt(index, 10) - 1;
        if(0 <= index && index < args.length){
          var val = args[index];
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
        }
        return undefined;
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
function setDisplay(shown, box){
    var value = shown ? "" : "none";
    if(box.style.display != value){
        box.style.display = value;
    }
}
var hide = setDisplay.bind(window, false);
var show = setDisplay.bind(window, true);

// hand-scraped from https://developer.mozilla.org/en-US/docs/Web/HTML/Element
// document.getElementsByClassName("index widgeted")[0].textContent.match(/<\w+>/g).map(function(m){return "\""+m.substring(1, m.length - 1)+"\"";}).join(",")
["a","abbr","acronym","address","applet","area","article","aside","audio","b","base","basefont","bdi","bdo","bgsound","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dir","div","dl","dt","element","em","embed","fieldset","figcaption","figure","font","footer","form","frame","frameset","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe","img","input","ins","isindex","kbd","keygen","label","legend","li","link","listing","main","map","mark","marquee","menu","menuitem","meta","meter","nav","nobr","noframes","noscript","object","ol","optgroup","option","output","p","param","plaintext","pre","progress","q","rp","rt","ruby","s","samp","script","section","select","shadow","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","title","tr","track","tt","u","ul","var","video","wbr","xmp"].forEach(function(tag){
    window[tag] = newDOM.bind(window, tag);
});

function linkButton(){
    var btn = a.apply(this, arguments);
    if(btn.className.indexOf("button") < 0){
        if(btn.className.length > 0){
            btn.className += " ";
        }
        btn.className += "button";
    }
    return btn;
}

var px = fmt.bind(this, "$1px");

function move(elem, left, top, width, height){
    setStyle("left", px(left), elem);
    setStyle("top", px(top), elem);
    if(width != undefined){
        setStyle("width", px(width), elem);
        if(height != undefined){
            setStyle("height", px(height), elem);
        }
    }
}

function group(arr, getKey, getValue){
    var groups = [];
    var clone = arr.concat();
    clone.sort(function(a, b){
        var ka = getKey ? getKey(a) : a;
        var kb = getKey ? getKey(b) : b;
        if(ka < kb){
            return -1;
        }
        else if(ka > kb){
            return 1;
        }
        return 0;
    });
    clone.forEach(function(obj){
        var key = getKey ? getKey(obj) : obj;
        var val = getValue ? getValue(obj) : obj;
        if(groups.length == 0
            || groups[groups.length - 1][0] != key){
            groups.push([key, []]);
        }
        groups[groups.length - 1][1].push(val);
    });
    return groups;
};


String.prototype.sanitize = function(){
    return this.replace(/(<|>|&| |\n)/g, function(match, capture){
       switch(capture){
           case "<": return "&lt;";
           case ">": return "&gt;";
           case "&": return "&amp;";
           case " ": return "&nbsp;";
           case "\n": return "<br>";
       }
   });
}

Element.prototype.fire = function(event){
    if (document.createEventObject){
        // dispatch for IE
        var evt = document.createEventObject();
        return this.fireEvent('on'+event,evt)
    }
    else{
        // dispatch for firefox + others
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true ); // event type,bubbling,cancelable
        return !this.dispatchEvent(evt);
    }
}

// full-screen-ism polyfill
if (!document.documentElement.requestFullscreen){
    if (document.documentElement.msRequestFullscreen){
        document.documentElement.requestFullscreen = document.documentElement.msRequestFullscreen;
        document.exitFullscreen = document.msExitFullscreen;
    }
    else if (document.documentElement.mozRequestFullScreen){
        document.documentElement.requestFullscreen = document.documentElement.mozRequestFullScreen;
        document.exitFullscreen = document.mozCancelFullScreen;
    }
    else if (document.documentElement.webkitRequestFullscreen){
        document.documentElement.requestFullscreen = function(){
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
        };
        document.exitFullscreen = document.webkitExitFullscreen;
    }
}

function toggleFullScreen(){
    if(document.documentElement.requestFullscreen){
        if (!(document.fullscreenElement 
            || document.mozFullScreenElement 
            || document.webkitFullscreenElement 
            || document.msFullscreenElement)){  // current working methods
            usrIt("fullscreen", "on");
            document.documentElement.requestFullscreen();
        }
        else{
            usrIt("fullscreen", "off");
            document.exitFullscreen();
        }
    }
}