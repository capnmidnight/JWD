var fs = require("fs"),
    path = require("path");

function minify(inputDir, outputDir, verbose){
    var output = verbose ? console.log.bind(console) : function(){};

    output("reading from: ", inputDir);
    output("writing to: ", outputDir);

    var wsPattern = /(\s){2,}/g;
    var commentPattern = /(\/\*.+?\*\/|\/\/[^\n]+\r?\n)/g;
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
                var minify = /^(html|js|css)$/.test(ext);
                if(minify){
                    opts.encoding = "utf8";
                }
            
                var data = fs.readFileSync(inputFile, opts);
                if(minify){
                    var start = data.length;
                    if(ext == "js"){
                        data = data.replace(/:\/\//g, "&HTTP_SLASHES;");
                        while(commentPattern.test(data)){
                            data = data.replace(commentPattern, "");
                        }
                        data = data.replace(/&HTTP_SLASHES;/g, "://");
                    }
                    while(wsPattern.test(data)){
                        data = data.replace(wsPattern, function(str, match, index){
                            return "\n";
                        });
                    }
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