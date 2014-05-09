module.exports.parse = function(arr){
    arr.forEach(function(val){
        var matches = val.match(/^-(\w+)=("?)([^"]+)\2$/);
        if(matches){
            module.exports[matches[1]] = matches[3];
        }
    });
}