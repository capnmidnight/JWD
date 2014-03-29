function getSetting(name, defValue){
    return (window.localStorage && window.localStorage.getItem(name)) || defValue;
}

function setSetting(name, value){
    if(window.localStorage)
        window.localStorage.setItem(name, value);
}

function addNewFile(txt){
    if(txt == undefined)
        txt = "";
    files.push({doc:txt, name:""});
    currentFile = files.length - 1;
    showFile();
    note(header, "new-file-note", "New file created.");
}

function showFile(){
    editor.setValue(files[currentFile].doc);
    filename.setValue(files[currentFile].name);
    fileCount.setValue(fmt("$1 of $2", currentFile + 1, files.length));
    countWords();
    showScroll();
}

function showScroll(){
    scrollbar.setValue(editor.getValue().sanitize());
}

function moveScroll(evt) {
    var sel = scrollbar.getSelection();
    editor.setSelection(sel);
}

function saveDesktopFile(doc){
    var size = doc.length * 2;
    if(window.webkitRequestFileSystem && false){
        print("Webkit FS");
        window.webkitStorageInfo.requestQuota(PERSISTENT, size, function(grantedBytes) {
            window.webkitRequestFileSystem(PERSISTENT, size, function(fs) {
                fs.root.getFile('log.txt', {create: true}, function(fileEntry) {
                    // Create a FileWriter object for our FileEntry (log.txt).
                    fileEntry.createWriter(function(fileWriter) {
                        fileWriter.onwriteend = function(e) {
                            print('Write completed.');
                        };
                        fileWriter.onerror = function(e) {
                            print('Write failed: ' + e.toString());
                        };
                    // Create a new Blob and write it to log.txt.
                    var blob = new Blob(['Lorem Ipsum'], {type: 'application/json'});
                    fileWriter.write(blob);
                    }, print);
                }, print);
            }, print);
        }, print);
    }
    else{
        print("Regular file");
        var link = a({download: "justwritedammit.json",
                      href: "data:application/octet-stream;filename=justwritedammit.json;base64," + utf8_to_b64(doc)},
                      "save");
        setStyle("display", "none", link);
        document.body.appendChild(link);
        print(link);
        link.click();
        document.body.removeChild(link);
    }
}

function saveFile(){
    stowFile();
    var doc = JSON.stringify(files);
    switch(storageType.getValue()){
        case "local":
            window.localStorage.setItem("files", doc);
        break;
        case "file":
            saveDesktopFile(doc);
        break;
        default:
            doc = null;
    }
    if(doc)
        note(header, "save-note", fmt("File \"$1\" saved.", files[currentFile].name));
}

function utf8_to_b64( str ) {
  return window.btoa(unescape(encodeURIComponent( str )));
}

function loadData() {
    var type = storageType.getValue();
    switch(type){
        case "local":
            parseFileData(window.localStorage.getItem("files"));
        break;
        case "file":
            storageFile.click();
        break;
        default:
            note(header, "load-failed-msg", fmt("Storage type \"$1\" is not yet supported", type));
    }
}

function parseFileData(fileData){
    if (fileData) {
        files = JSON.parse(fileData);
        // delete the word counts, so the word counter can pick up later.
        files.forEach(function (file) {
            if ("count" in file)
                delete file["count"];
        });
        currentFile = 0;
        showFile();
    }
    else {
        files = [];
        addNewFile();
        if (!window.fullScreen)
            note(header, "fullscreen-note", "Consider running in full-screen by hitting F11 on your keyboard.", 1000);
    }
}

function nextFile(){
    stowFile();
    currentFile = (currentFile + 1) % files.length;
    showFile();
}

function prevFile(){
    stowFile();
    currentFile = (currentFile + files.length - 1) % files.length;
    showFile();
}

function stowFile(){
    files[currentFile].doc = editor.getValue();
    files[currentFile].name = filename.getValue();
}

function loadFromFile(){
    Array.prototype.forEach.call(this.files, function(f){
        var reader = new FileReader();
        reader.addEventListener("load", function(evt){
            parseFileData(evt.target.result);
        });
        reader.readAsText(f);
    });
}

var commands = {
    78: addNewFile,
    83: saveFile,
    219: prevFile,
    221: nextFile,
};

function runCommands(evt){
    if(evt.ctrlKey){
        if(evt.keyCode in commands){
            commands[evt.keyCode]();
            evt.preventDefault();
        }
    }
}