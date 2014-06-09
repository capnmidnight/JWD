var fs = require("fs"),
    path = require("path");
var strings = null, regexes = null;
var patterns = [
    [/"((\\"|[^"\n])*)"/g, function(match){
        var name = "&STRING" + strings.length + ";";
        strings.push(match);
        return name;
    }],
    [/http:\/\//g, "$HTTP;"],
    [/https:\/\//g, "$HTTPS;"],
    [/\/\/[^\n]+/g, " "], // strip comments
    [/\/((\\\/|[^\/\n])+)\//g, function(match){
        var name = "&REGEX" + regexes.length + ";";
        regexes.push(match);
        return name;
    }],
    [/(\n|\s)(\n|\s)+/g, "\n"],
    [/\s*([,{|<>()=\-+!%^&*:;?/])\s*/g, "$1"],
    [/\s+([}])/g, "$1"],
    [/&REGEX(\d+);/g, function(match, cap1){
        var index = parseInt(cap1, 10);
        return regexes[index];
    }],
    [/$HTTPS;/g, "https://"],
    [/$HTTP;/g, "http://"],
    [/&STRING(\d+);/g, function(match, cap1){
        var index = parseInt(cap1, 10);
        return strings[index];
    }],
];

function minify(inputDir, outputDir, tempDir, verbose, shrink){
    var output = verbose ? console.log.bind(console) : function(){};

    output("reading from: ", inputDir);
    output("writing to: ", outputDir);
    output("deploying from: ", tempDir);
    output((shrink ? "" : "not ") + "shrinking");

    output("cleaning up temp directory:");
    var files = fs.readdirSync(tempDir);
    if(files){
        files.forEach(function(file){
            output("deleting", file);
            fs.unlink(path.join(tempDir, file));
        });
    }
    output("done");

    fs.readdir(inputDir, function(err, files){
        if(err){
            console.error(err);
        }
        else{
            var total = 0;
            var shrunk = "";
            files.forEach(function(file){
                var ext = path.extname(file).substring(1);
                var inputFile = path.join(inputDir, file);
                var outputFile = path.join(outputDir, file);
                var tempFile = path.join(tempDir, file);
                var opts = {};
                var minify = shrink && ext == "js" && !/\.min\.\w+$/.test(file);
                if(minify || file == "index.html"){
                    opts.encoding = "utf8";
                }

                var data = fs.readFileSync(inputFile, opts);
                var data2 = fs.existsSync(outputFile) && fs.readFileSync(outputFile, opts);
                if(minify){
                    output("minifying file: ", file);
                    var start = data.length;
                    strings = [];
                    regexes = [];
                    patterns.forEach(function(pattern){
                        while(pattern[0].test(data)){
                            var old = data;
                            data = data.replace(pattern[0], pattern[1]);
                            if(old.length == data.length){
                                break;
                            }
                        }
                    });
                    var saved = (start - data.length);
                    total += saved;
                    output(file + " saved " + saved + " characters");
                }
                else if(file == "index.html" && shrink){
                    output("combining scripts");
                    var test = /<script id="setup">((.|\r\n|\n)+)<\/script>/;
                    var body = data.match(test);
                    if(body && body.length > 0){
                        body = body[0];
                        console.log(body);
                        var test2 = /var curAppVersion\s?=\s?(\d+);/;
                        body = data.match(test2);
                        if(body && body.length > 1){
                            var version = parseInt(body[1], 10);
                            shrunk += "\nvar curAppVersion=" + version + ";";
                            data = data.replace(test, "<script async src=\"jwd.min.js#v" + version + "\"></script>");
                        }
                    }
                }
                
                if(ext == "js" && shrink){
                    output("combo script: ", file);
                    shrunk += data + "\n";
                }

                var changed = !(data2 && Array.prototype.map.call(data, function(v, i){
                    return i < data2.length && v == data2[i];
                }).reduce(function(a, b){
                    return a && b;
                }));
                output(file, " changed? ", changed);
                if(changed){
                    fs.writeFile(outputFile, data, opts, function(err){
                        if(err){
                            console.error(err);
                        }
                    });
                }
                if(changed && (ext != "js" || !shrink)){
                    fs.writeFileSync(tempFile, data, opts);
                }
            });
            if(shrink){
                shrunk += "\npageLoad();";
                fs.writeFileSync(path.join(outputDir, "jwd.min.js"), shrunk, {encoding:"utf8"});
                fs.writeFileSync(path.join(tempDir, "jwd.min.js"), shrunk, {encoding:"utf8"});
            }
            output("Total saved: ", total);
            output("Deploying files: ", fs.readdirSync(tempDir));
        }
    });
}

module.exports = minify;