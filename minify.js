var path = require("path"),
    options = require("./src/options"),
    minify = require("./src/minifier");

options.parse(process.argv);

minify(
    options.i || "html5",
    options.o || "obj",
    options.c || "cur",
    options.v != "false",
    options.s == "true");