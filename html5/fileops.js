var data = null;

function autoSave(){
    var prev = data.chapters[data.currentChapter].doc;
    var cur = writer.getValue();
    if (prev != cur){
        show(unsavedFileIndicator);
        if (getSetting("storageType") != "desktop"){
            if (autoSave.timeout){
                clearTimeout(autoSave.timeout);
            }
            autoSave.timeout = setTimeout(saveFile, 3000);
        }
    }
}

function addNewFile(txt){
    if (txt == undefined){
        txt = "";
    }
    data.chapters.push({ doc: txt, name: "" });
    data.currentChapter = data.chapters.length - 1;
    showFile();
    note("new-file-note", "New file created.");
}

function showFile(){
    writer.setValue(data.chapters[data.currentChapter].doc);
    chapterName.setValue(data.chapters[data.currentChapter].name);
    fileCount.setValue(fmt("$1 of $2", data.currentChapter + 1, data.chapters.length));
    countWords();
}

function utf8_to_b64(str){
    return window.btoa(unescape(encodeURIComponent(str)));
}

var fileSavers = {
    local: localSave,
    dropbox: dorpboxSave,
    gdrive: gdriveSave,
    desktop: desktopSave,
};

function onSuccessfulSave(type){
    hide(unsavedFileIndicator);
    savIt(type);
}

function saveFile(types){
    if (autoSave.timeout){
        clearTimeout(autoSave.timeout);
    }
    if (types == undefined){
        stowFile();
        types = [getSetting("storageType"), getSetting("lastStorageType")];
        if (types.indexOf("local") == -1){
            types.push("local");
        }
    }
    if (types.length > 0){
        var doc = JSON.stringify(data);
        var type = types.shift();
        if (type && fileSavers[type]){
            fileSavers[type](function (err){
                note(fmt("save-$1-failed", type),
                    fmt("Couldn't save file to $1. Reason: $2", type, err));
                setTimeout(saveFile, 1, types);
            }, onSuccessfulSave.bind(window, type), doc);
        }
    }
}

var fileLoaders = {
    local: localLoad,
    dropbox: dorpboxLoad,
    gdrive: gdriveLoad,
    desktop: desktopLoad,
    "default": defaultLoad
};

function deEff(val){
    try { return decodeURIComponent(escape(val)); }
    catch (exp){ return val; }
}

function onSuccessfulLoad(type, loadDataDone){
    for (var i = 0; i < data.chapters.length; ++i)
        data.chapters[i].doc = deEff(data.chapters[i].doc);

    data.chapters.forEach(function (chapter){
        if (chapter.count){
            delete chapter.count;
        }
    });

    if(data.snippets && data.snippets.length > 0){
        data.chapters.push({
            name: "snippets",
            doc: data.snippets
                .map(function(s){return deEff(s.trim());})
                .filter(function(s){return s.length > 0;})
                .join("\n\n")
        });
        delete data.snippets;
    }

    data.currentChapter = data.currentChapter || 0;
    showFile();
    hide(unsavedFileIndicator);
    note("data-loaded-message", "Data loaded!");
    data.theme = data.theme || 0;
    setTheme(data.theme);
    lodIt(type);
    if(loadDataDone){
        loadDataDone();
    }
}

function loadData(loadDataDone, types, res){
    print("loading error?", !!res, res);
    if (types == undefined){
        data = null;
        types = [getSetting("storageType"), getSetting("lastStorageType")];
        types = types.filter(function (t){ return t; });
        if (types.indexOf("local") == -1){
            types.push("local");
        }
        types.push("default");
    }
    if (types && types.length > 0){
        var type = types.shift();
        if (type){
            var fail = setTimeout.bind(window, loadData.bind(window, loadDataDone, types), 1);
            if (fileLoaders[type]){
                fileLoaders[type](fail, onSuccessfulLoad.bind(window, type, loadDataDone));
            }
            else{
                fail(fmt("Storage type \"$1\" is not yet supported", type));
                if(types.length == 0 && loadDataDone){
                    loadDataDone();
                }
            }
        }
    }
}

function defaultLoad(fail, success){
    data = {
        chapters: []
    };
    addNewFile();
    setSetting("storageType", "local");
    success();
}

function parseFileData(fileData, fail, success){
    data = null;
    if (fileData){
        if (typeof (fileData) == "string"){
            if(fileData.indexOf("<html>") >= 0){
                var ed = []
                fileData = fileData.replace(/<h(1|2)>([^<]+)<\/h\1>((\s*<p>.+<\/p>)+)/gi,
                    function(match, headerSize, title, article){
                        ed.push({
                            name:title,
                            doc:stripHTML(article)
                        });
                        return "";
                    });
                fileData = ed;
            }
            else{
                fileData = JSON.parse(fileData);
            }
        }

        if (fileData.length){
            fileData = {
                chapters: fileData
            };
        }

        data = fileData;
    }
    if (data){
        success();
    }
    else{
        fail("Couldn't parse file data: " + JSON.stringify(fileData));
    }
}

function nextFile(){
    stowFile();
    data.currentChapter = (data.currentChapter + 1) % data.chapters.length;
    showFile();
    if (getSetting("storageType") != "desktop"){
        saveFile();
    }
}

function prevFile(){
    stowFile();
    data.currentChapter = (data.currentChapter + data.chapters.length - 1) % data.chapters.length;
    showFile();
    if (getSetting("storageType") != "desktop"){
        saveFile();
    }
}

function stowFile(){
    data.chapters[data.currentChapter].doc = writer.getValue();
    data.chapters[data.currentChapter].name = chapterName.getValue();
}
