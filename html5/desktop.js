function exportFile(){
    stowFile();
    var doc = JSON.stringify(data.chapters);
    saveDesktopFile(doc);
}

function saveDesktopFile(doc) {
    saveFileToDesktop("justwritedammit.jwd", "application/octet-stream", doc);
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


function loadFromFile() {
    Array.prototype.forEach.call(storageFile.files, function (f) {
        var reader = new FileReader();
        reader.addEventListener("load", function (evt) {
            parseFileData(evt.target.result);
        });
        reader.readAsText(f);
    });
}