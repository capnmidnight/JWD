function exportFile(){
    stowFile();
    var doc = JSON.stringify(data.chapters);
    saveDesktopFile(doc);
}

function saveDesktopFile(doc) {
    openLink("justwritedammit.jwd",
        "data:application/octet-stream;filename=justwritedammit.jwd;base64," + utf8_to_b64(doc));
}

function openLink(title, href) {
    var link = a({
        download: title,
        href: href
    },
                  "save");
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