var data = null;

function autoSave(){
    var prev = data.chapters[data.currentChapter].doc;
    var cur = writer.getValue();
    if(prev != cur){
        unsavedFileIndicator.style.display = "";
        if(autoSave.timeout)
            clearTimeout(autoSave.timeout);
        autoSave.timeout = setTimeout(saveFile, 3000);
    }
}

function addNewFile(txt) {
    if (txt == undefined)
        txt = "";
    data.chapters.push({ doc: txt, name: "" });
    data.currentChapter = data.chapters.length - 1;
    showFile();
    note(header, "new-file-note", "New file created.");
}

function showFile() {
    writer.setValue(data.chapters[data.currentChapter].doc);
    chapterName.setValue(data.chapters[data.currentChapter].name);
    fileCount.setValue(fmt("$1 of $2", data.currentChapter + 1, data.chapters.length));
    countWords();
}

function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

var fileSavers = {
    local: localSave,
    dropbox: dorpboxSave,
    gdrive: gdriveSave,
};

function onSuccessfulSave(){
    unsavedFileIndicator.style.display = "none";
    goog_report_conversion("save");
}

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
            fileSavers[type](function(err){
                note(main,
                    fmt("save-$1-failed", type),
                    fmt("Couldn't save file to $1. Reason: $2", type, err));
                setTimeout(saveFile, 1, types);
            }, onSuccessfulSave, doc);
    }
}

var fileLoaders = {
    local: localLoad,
    dropbox: dorpboxLoad,
    gdrive: gdriveLoad,
    "default": defaultLoad
};

function deEff(val){
    try{ return decodeURIComponent(escape(val)); }
    catch(exp){ return val; }
}

function onSuccessfulLoad(){
    for(var i = 0; i < data.snippets.length; ++i)
        data.snippets[i] = deEff(data.snippets[i]);
    for(var i = 0; i < data.chapters.length; ++i)
        data.chapters[i].doc = deEff(data.chapters[i].doc);

    data.chapters.forEach(function(chapter){
        if ("count" in chapter)
            delete chapter["count"];
    });
    data.currentChapter = data.currentChapter || 0;
    showFile();
    unsavedFileIndicator.style.display = "none";

    currentSnippet = data.snippets.length;
    updateSnippetCount();
    showSnippet();
    note(main, "data-loaded-message", "Data loaded!");
    data.theme = data.theme || 0;
    setTheme(data.theme);
    goog_report_conversion("load");
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
            else
                fail(fmt("Storage type \"$1\" is not yet supported", type));
        }
    }
}

function defaultLoad(fail, success){
    data = {
        chapters: [],
        snippets: []
    };
    addNewFile();
    setSetting("storageType", "local");
    if (!isMobile && !window.fullScreen)
      note(main, "fullscreen-note", "Consider running in full-screen by hitting F11 on your keyboard."
           + "<a class=\"button\" href=\"javascript:toggleFullScreen()\">go fullscreen</a>", 1000);
    success();
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
        fail("Couldn't parse file data: " + JSON.stringify(fileData));
}

function nextFile() {
    stowFile();
    data.currentChapter = (data.currentChapter + 1) % data.chapters.length;
    showFile();
}

function prevFile() {
    stowFile();
    data.currentChapter = (data.currentChapter + data.chapters.length - 1) % data.chapters.length;
    showFile();
}

function stowFile() {
    data.chapters[data.currentChapter].doc = writer.getValue();
    data.chapters[data.currentChapter].name = chapterName.getValue();
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
        evt.stopPropagation();
    }
}
