var forever = "forever";

function msg(id, msg, showms, lenms){
    if(lenms == undefined){
        lenms = 5000;
        if(showms == undefined)
            showms = 0;
    }
    var box = aside(
        {id:id},
        button({
            id:id + "-dismiss-button",
            type: "button",
            onclick: function(){
                hide(id);
            },
        }, "dismiss"),
        msg);

    setTimeout(document.body.appendChild.bind(document.body), showms, box);
    if(lenms != forever)
        setTimeout(document.body.removeChild.bind(document.body), showms + lenms, box);
}