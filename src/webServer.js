var fs = require("fs");
var mime = require("mime");
var core = require("./core.js");

module.exports = function(dirName){
    return function(req, res) {
        if (req.method === "GET" && req.url[0] === "/") {
            if (req.url.length == 1)
                req.url += "index.html";
            var path = dirName + req.url;
            fs.readFile(path,
            function (err, data) {
                if (err) {
                    serverError(res, req.url);
                }
                else {
                    res.writeHead(200, { "Content-Type": mime.lookup(path) });
                    res.end(data);
                }
            });
        }
        else {
            serverError(res);
        }
    }
};

function serverError(res, path) {
    if (path) {
        res.writeHead(404);
        res.end("error loading " + path.substring(1));
    }
    else {
        res.writeHead(500);
        res.end("error");
    }
}
