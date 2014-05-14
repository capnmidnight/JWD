function include(src, success, fail) {
    if(!/http(s):\/\//.test(src)){
        src = src + "#v" + curAppVersion;
    }
    var t = src.indexOf(".css") > -1;
    var s = document.createElement(t ? "link" : "script");
    s.type = t ? "text/css" : "text/javascript";
    s.async = true;
    s.addEventListener("error", fail);
    s.addEventListener("abort", fail);
    s.addEventListener("load", success);
    document.head.appendChild(s);
    if (t) {
        s.rel = "stylesheet";
    }
    s[t ? "href" : "src"] = src;
}

var require = (function () {
    var G = document.createElement("div");
    var Gs = G.style;
    Gs.position = "absolute";
    Gs.height = "100%";
    Gs.right = 0;
    Gs.padding = 0;
    Gs.margin = 0;
    Gs.border = 0;
    Gs.backgroundColor = "rgba(96, 96, 112, 0.5)";

    var toLoad = {};
    function set(i, m) {
        if (m.indexOf("#") == m.length - 1) {
            m = m.substring(0, m.length - 1);
        }
        toLoad[m] = i;
        var c, g;
        c = g = 0;
        for (var k in toLoad) {
            c++;
            if (toLoad[k] == 1) {
                g++;
            }
        }
        var v = (g * 100 / c);
        Gs.left = v + "%";
        if (c > 2 && c == g + 2) {
            pageLoad(
                set.bind(window, 1, "init"),
                set.bind(window, 1, "loadData"));
        }
        if (c == g) {
            document.body.removeChild(G);
            resize();
        }
    }

    function tryAppend(success) {
        if (!document.body) {
            setTimeout(tryAppend.bind(this, success), 10);
        }
        else if (G.parentElement != document.body) {
            document.body.appendChild(G);
            success();
        }
    }

    function loadLibs(libs) {
        var thunk = function (m, l) {
            set(1, m);
            loadLibs(l);
        };
        if (libs.length > 0) {
            var m = libs.shift();
            var t = thunk.bind(this, m, libs);
            include(m, t, t);
        }
    }

    function require() {
        var libs = Array.prototype.slice.call(arguments);
        libs.forEach(set.bind(this, 0));
        set(0, "init");
        set(0, "loadData");
        tryAppend(loadLibs.bind(this, libs));
    }

    return require;
})();