var fs = require("fs"),
    path = require("path");
var strings = null, regexes = null;
var patterns = [
    [/\\"/g, "&QUOT;"],
    [/\\\//g, "&SLASH;"],
    [/"[^"]*"/g, function(match){
        var name = "&STRING" + strings.length + ";";
        strings.push(match);
        return name;
    }],
    [/\/\/[^\n]+/g, " "],
    [/\/[^\/]+\//g, function(match){
        var name = "&REGEX" + regexes.length + ";";
        regexes.push(match);
        return name;
    }],
    [/\s{2,}/g, "\n"],
    [/\s*([,{|<>()=\-+!%^&*:;?/])\s*/g, "$1"],
    [/\s+([}])/g, "$1"],
    [/&REGEX(\d+);/g, function(match, cap1){
        var index = parseInt(cap1, 10);
        return regexes[index];
    }],
    [/&STRING(\d+);/g, function(match, cap1){
        var index = parseInt(cap1, 10);
        return strings[index];
    }],
    [/&SLASH;/g, "\\/"],
    [/&QUOT;/g, "\\\""]
];

function minify(inputDir, outputDir, verbose){
    var output = verbose ? console.log.bind(console) : function(){};

    output("reading from: ", inputDir);
    output("writing to: ", outputDir);

    fs.readdir(inputDir, function(err, files){
        if(err){
            console.error(err);
        }
        else{
            var total = 0;
            files.forEach(function(file){
                var ext = path.extname(file).substring(1);
                var inputFile = path.join(inputDir, file);
                var outputFile = path.join(outputDir, file);
                var opts = {};
                var minify = ext == "js" && !/\.min/.test(file);
                if(minify){
                    opts.encoding = "utf8";
                }
            
                var data = fs.readFileSync(inputFile, opts);
                if(minify){
                    var start = data.length;
                    strings = [];
                    regexes = [];
                    patterns.forEach(function(pattern){
                        while(pattern[0].test(data)){
                            data = data.replace(pattern[0], pattern[1]);
                        }
                    });
                    var saved = (start - data.length);
                    total += saved;
                    output(file + " saved " + saved + " characters");
                }
                fs.writeFile(outputFile, data, opts, function(err){
                    if(err){
                        console.error(err);
                    }
                });
            });

            output("Total saved: ", total);
        }
    });
}

module.exports = minify;