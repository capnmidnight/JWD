var path = require("path"),
    options = require("./src/options"),
    minify = require("./src/minifier");

options.parse(process.argv);

minify(
    options.i || path.join(process.cwd(), "html5"),
    options.o || path.join(process.cwd(), "obj"),
    options.v != "false");