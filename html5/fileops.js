var data = null,
    currentChapter = null;

function autoSave(){
    if(autoSave.timeout)
        clearTimeout(autoSave.timeout);
    autoSave.timeout = setTimeout(saveFile, 3000);
    unsavedFileIndicator.style.display = "";
}

function addNewFile(txt) {
    if (txt == undefined)
        txt = "";
    data.chapters.push({ doc: txt, name: "" });
    currentChapter = data.chapters.length - 1;
    showFile();
    note(header, "new-file-note", "New file created.");
}

function showFile() {
    editor.setValue(data.chapters[currentChapter].doc);
    chapterName.setValue(data.chapters[currentChapter].name);
    fileCount.setValue(fmt("$1 of $2", currentChapter + 1, data.chapters.length));
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

function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

var fileSavers = {
    local: function(fail, success, doc){
        if(window.localStorage){
            window.localStorage.setItem("data", doc);
            success();
        }
        else
            fail();
    },
    dropbox: withDB.bind(this, dbSave)
};

var fileLoaders = {
    local: function (fail, success) {
        var data = window.localStorage.getItem("data")
          || window.localStorage.getItem("chapters");
        parseFileData(data, fail, success);
    },
    dropbox: withDB.bind(this, dbLoad),
    "default": function(fail, success){
        data = {
            chapters: [],
            snippets: []
        };
        addNewFile();
        setSetting("storageType", "local");
        if (!isMobile && !window.fullScreen)
          note(main, "fullscreen-note", "Consider running in full-screen by hitting F11 on your keyboard."
               + "<button type=\"button\" onclick=\"toggleFullScreen()\">go fullscreen</button>", 1000);
        success();
    }
};

function saveFile(types) {
    if(autoSave.timeout)
        clearTimeout(autoSave.timeout);
    if(saveSnippets.timeout)
        clearTimeout(saveSnippets.timeout);
    if(types == undefined){
        stowFile();
        types = [getSetting("storageType"), getSetting("lastStorageType")];
        if(types.indexOf("local") == -1)
            types.push("local");
    }
    if(types.length > 0){
        var doc = JSON.stringify(data);
        var type = types.shift();
        if(type && fileSavers[type])
            fileSavers[type](function(){
                setTimeout(saveFile, 1, types);
            }, onSuccessfulSave, doc);
    }
}

function onSuccessfulLoad(){
    // delete the word counts, so the word counter can pick up later.
    data.chapters.forEach(function (file) {
        if ("count" in file)
            delete file["count"];
    });
    currentChapter = 0;
    showFile();
    unsavedFileIndicator.style.display = "none";

    currentSnippet = data.snippets.length;
    updateSnippetCount();
    showSnippet();
}

function onSuccessfulSave(){
    unsavedFileIndicator.style.display = "none";
}

function loadData(types) {
    if(types == undefined){
        data = null;
        types = [getSetting("storageType"), getSetting("lastStorageType")];
        types = types.filter(function(t){return t;});
        if(types.indexOf("local") == -1)
            types.push("local");
        types.push("default");
    }
    if(types.length > 0){
        var type = types.shift();
        if(type){
            var fail = setTimeout.bind(window, loadData, 1, types);
            if (fileLoaders[type])
                fileLoaders[type](fail, onSuccessfulLoad);
            else{
                note(header, "load-failed-msg", fmt("Storage type \"$1\" is not yet supported", type));
                fail();
            }
        }
    }
}

function parseFileData(fileData, fail, success) {
    if(fileData) {
        if (typeof(fileData) == "string")
            fileData = JSON.parse(fileData);

        if(fileData.length)
            fileData = {
              chapters: fileData,
              snippets:[]
            };

        data = fileData;
    }
    if(data)
        success();
    else
        fail();
}

function nextFile() {
    stowFile();
    currentChapter = (currentChapter + 1) % data.chapters.length;
    showFile();
}

function prevFile() {
    stowFile();
    currentChapter = (currentChapter + data.chapters.length - 1) % data.chapters.length;
    showFile();
}

function stowFile() {
    data.chapters[currentChapter].doc = editor.getValue();
    data.chapters[currentChapter].name = chapterName.getValue();
}

var commands = {
    78: addNewFile,
    83: saveFile,
    219: prevFile,
    221: nextFile,
};

function runCommands(evt) {
    if (evt.ctrlKey && evt.keyCode in commands) {
        commands[evt.keyCode]();
        evt.preventDefault();
    }
}
