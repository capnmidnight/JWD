function getSetting(name, defValue) {
    return (window.localStorage && window.localStorage.getItem(name)) || defValue;
}

function setSetting(name, value) {
    if (window.localStorage)
        window.localStorage.setItem(name, value);
}

function addNewFile(txt) {
    if (txt == undefined)
        txt = "";
    chapters.push({ doc: txt, name: "" });
    currentChapter = chapters.length - 1;
    showFile();
    note(header, "new-file-note", "New file created.");
}

function showFile() {
    editor.setValue(chapters[currentChapter].doc);
    chapterName.setValue(chapters[currentChapter].name);
    fileCount.setValue(fmt("$1 of $2", currentChapter + 1, chapters.length));
    countWords();
    showScroll();
}

function showScroll() {
    scrollbar.setValue(editor.getValue().sanitize());
}

function moveScroll(evt) {
    var sel = scrollbar.getSelection();
    editor.setSelection(sel);
}

function saveDesktopFile(doc) {
    var link = a({
        download: "justwritedammit.json",
        href: "data:application/octet-stream;filename=justwritedammit.json;base64," + utf8_to_b64(doc)
    },
                  "save");
    setStyle("display", "none", link);
    document.body.appendChild(link);
    print(link);
    link.click();
    document.body.removeChild(link);
}

function withDB(thunk) {
    dbClient.authenticate();
    if (dbDataStoreMGR) {
        if (dbDataStore)
            thunk(dbDataStore);
        else
            dbDataStoreMGR.openDefaultDatastore(function (error, datastore) {
                if (error)
                    alert('Error opening default datastore: ' + error);
                else {
                    dbDataStore = datastore;
                    thunk(dbDataStore);
                }
            });
    }
}

var fileSavers = {
    local: window.localStorage.setItem.bind(window.localStorage, "chapters"),
    file: saveDesktopFile,
    dropbox: withDB.bind(this, dbSave)
};

function saveFile() {
    stowFile();
    var doc = JSON.stringify(chapters);
    var type = storageType.getValue();
    if (type in fileSavers) {
        fileSavers[type](doc);
        note(header, "save-note", fmt("File \"$1\" saved.", chapters[currentChapter].name));
    }
}

function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

var fileLoaders = {
    local: function () {
        parseFileData(window.localStorage.getItem("files")
        || window.localStorage.getItem("chapters"));
    },
    file: function () {
        storageFile.click();
    },
    dropbox: withDB.bind(this, dbLoad)
};

function dbLoad() {
    var booksTable = dbDataStore.getTable("books");
    var books = booksTable.query();
    print(books, books[0])
    parseFileData(books[0].get("chapters"));
}

function dbSave() {
    var doc = JSON.stringify(chapters);
    var booksTable = dbDataStore.getTable("books");
    var books = booksTable.query();
    print(chapters);
    if (books.length == 0)
        booksTable.insert({
            chapters: doc
        });
    else {
        books[0].set("chapters", doc);
        for (var i = 1; i < books.length; ++i)
            books[i].deleteRecord();
    }
    print("save file", books);
}

function loadData() {
    var type = getSetting("storageType");
    if (fileLoaders[type])
        fileLoaders[type]();
    else
        note(header, "load-failed-msg", fmt("Storage type \"$1\" is not yet supported", type));
}

function parseFileData(fileData) {
    print("file data", fileData);
    if (!fileData
        || (fileData instanceof Array && fileData.length == 0)) {
        var lastType = getSetting("lastStorageType");
        var curType = getSetting("storageType");
        print("no data yet, try last type", lastType);
        if (lastType) {
            setSetting("lastStorageType", null);
            setSetting("storageType", lastType);
            loadData();
            setSetting("storageType", curType);
            setSetting("lastStorageType", lastType);
        }
        else {
            chapters = [];
            addNewFile();
            if (!window.fullScreen)
                note(header, "fullscreen-note", "Consider running in full-screen by hitting F11 on your keyboard.", 1000);
        }
    }
    else {
        print("Some file data");
        if (typeof (fileData) == "string") {
            chapters = JSON.parse(fileData);
        }
        else {
            chapters = fileData;
        }
        // delete the word counts, so the word counter can pick up later.
        chapters.forEach(function (file) {
            if ("count" in file)
                delete file["count"];
        });
        currentChapter = 0;
        showFile();
    }
}

function nextFile() {
    stowFile();
    currentChapter = (currentChapter + 1) % chapters.length;
    showFile();
}

function prevFile() {
    stowFile();
    currentChapter = (currentChapter + chapters.length - 1) % chapters.length;
    showFile();
}

function stowFile() {
    chapters[currentChapter].doc = editor.getValue();
    chapters[currentChapter].name = chapterName.getValue();
}

function loadFromFile() {
    Array.prototype.forEach.call(this.chapters, function (f) {
        var reader = new FileReader();
        reader.addEventListener("load", function (evt) {
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

function runCommands(evt) {
    if (evt.ctrlKey) {
        if (evt.keyCode in commands) {
            commands[evt.keyCode]();
            evt.preventDefault();
        }
    }
}