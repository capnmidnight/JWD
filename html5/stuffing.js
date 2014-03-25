function msg(id, msg, showms, lenms){
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
    setTimeout(document.body.removeChild.bind(document.body), showms + lenms, box);
}