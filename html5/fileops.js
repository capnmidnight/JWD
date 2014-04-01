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
    chapters.push({doc:txt, name:""});
    currentChapter = chapters.length - 1;
    showFile();
    note(header, "new-file-note", "New file created.");
}

function showFile(){
    editor.setValue(chapters[currentChapter].doc);
    filename.setValue(chapters[currentChapter].name);
    fileCount.setValue(fmt("$1 of $2", currentChapter + 1, chapters.length));
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

var fileSavers = {
    local: window.localStorage.setItem.bind(window.localStorage, "chapters"),
    file: saveDesktop,
    dropbox: saveDropbox,
};

function saveDropbox(doc){
    var dbClient = new Dropbox.Client({key: "g2rnjvo102estt0"});

    dbClient.authenticate({interactive: false}, function (error) {
        if (error)
            alert('Authentication error: ' + error);
    });

    if (dbClient.isAuthenticated()) {
        var datastoreManager = client.getDatastoreManager();
        datastoreManager.openDefaultDatastore(function (error, datastore) {
            if (error)
                alert('Error opening default datastore: ' + error);

            var booksTable = datastore.getTable("books");
            var books = booksTable.query({
                name: "Just Wirte, Dammit",
            });
            if(books.length > 0)
                books[0].set("text", doc);
            else
                booksTable.insert({
                    name: "Just Wirte, Dammit",
                    created: new Date(),
                    text: document
                });
        });
    }
}

function saveFile(){
    stowFile();
    var doc = JSON.stringify(chapters);
    var type = storageType.getValue();
    if(type in fileSavers){
        fileSavers[type](doc);
        note(header, "save-note", fmt("File \"$1\" saved.", chapters[currentChapter].name));
    }
}

function utf8_to_b64( str ) {
  return window.btoa(unescape(encodeURIComponent( str )));
}

var fileLoaders = {
    local: function(){
        parseFileData(window.localStorage.getItem("files")
        || window.localStorage.getItem("chapters"));
    },
    file: storageFile.click.bind(storageFile),
};

function loadData() {
    var type = storageType.getValue();
    if(type in fileLoaders)
        fileLoaders[type]();
    else
        note(header, "load-failed-msg", fmt("Storage type \"$1\" is not yet supported", type));
}

function parseFileData(fileData){
    if (fileData) {
        chapters = JSON.parse(fileData);
        // delete the word counts, so the word counter can pick up later.
        chapters.forEach(function (file) {
            if ("count" in file)
                delete file["count"];
        });
        currentChapter = 0;
        showFile();
    }
    else {
        chapters = [];
        addNewFile();
        if (!window.fullScreen)
            note(header, "fullscreen-note", "Consider running in full-screen by hitting F11 on your keyboard.", 1000);
    }
}

function nextFile(){
    stowFile();
    currentChapter = (currentChapter + 1) % chapters.length;
    showFile();
}

function prevFile(){
    stowFile();
    currentChapter = (currentChapter + chapters.length - 1) % chapters.length;
    showFile();
}

function stowFile(){
    chapters[currentChapter].doc = editor.getValue();
    chapters[currentChapter].name = filename.getValue();
}

function loadFromFile(){
    Array.prototype.forEach.call(this.chapters, function(f){
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