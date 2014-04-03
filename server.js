var format = require("util").format,
    fs = require("fs"),
    core = require('./src/core.js'),
    http = require("http"),
    webServer = require("./src/webServer.js"),
    app = http.createServer(webServer("./html5/"));


app.listen(8080);