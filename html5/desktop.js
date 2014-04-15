function desktopSave(fail, success, doc){
    saveFileToDesktop("justwritedammit.jwd", "application/octet-stream", doc);
    success();
}

function saveFileToDesktop(filename, type, text){
    openLink(filename, fmt("data:$1;filename=$2;base64,$3", type, filename, utf8_to_b64(text)));
}

function openLink(title, href) {
    var link = a({
        download: title,
        href: href
    }, "save");
    setStyle("display", "none", link);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function desktopLoad(fail, success) {
    var load = function(){
        Array.prototype.forEach.call(storageFile.files, function (f) {
            var reader = new FileReader();
            reader.addEventListener("load", function (evt) {
                parseFileData(evt.target.result, fail, success);
            });
            reader.addEventListener("error", fail);
            reader.readAsText(f);
        });        
        storageFile.removeEventListener("change", load, false);
    };
    storageFile.addEventListener("change", load, false);
    storageFile.click();
}