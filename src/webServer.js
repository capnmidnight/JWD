var fs = require("fs"),
    mime = require("mime"),
    core = require("./core.js"),
    filePattern = /([^?]+)(\?([^?]+))?/;

function sendStaticFile(res, url, path){
    fs.readFile(path, function (err, data){
        if (err){
            serverError(res, url);
        }
        else{
            res.writeHead(200, { "Content-Type": mime.lookup(path) });
            res.end(data);
        }
    });
}

module.exports = function(dirName){
    return function(req, res){
        if (req.method === "GET" && req.url[0] === "/"){
            if (req.url.length == 1){
                req.url += "index.html";
            }

            var path = dirName + req.url,
                parts = path.match(filePattern),
                file = parts[1],
                queryString = parts[3];
            
            fs.exists(file, function(yes){
                if(yes){
                    sendStaticFile(res, req.url, file);
                }
                else{
                    serverError(res, req.url);
                }
            });
        }
        else{
            serverError(res);
        }
    }
};

function serverError(res, path){
    if (path){
        res.writeHead(404);
        res.end("error loading " + path.substring(1));
    }
    else{
        res.writeHead(500);
        res.end("error");
    }
}
