var format = require("util").format,
    fs = require("fs"),
    core = require('./src/core'),
    http = require("http"),
    webServer = require("./src/webServer"),
    proc = require("child_process").spawn,
    options = require("./src/options"),
    minify = require("./src/minifier"),
    path = require("path");

options.parse(process.argv);

var srcDir = "html5";

if(options.m == "true"){
    minify(
        options.i || "html5",
        options.o || "obj",
        options.c || "cur",
        options.v != "false",
        options.s == "true");
    srcDir = "obj";
}

var app = http.createServer(webServer(srcDir));

app.listen(8080);
proc("explorer", ["http://localhost:8080"]);