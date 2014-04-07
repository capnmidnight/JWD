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

var fileSavers = {
    local: window.localStorage.setItem.bind(window.localStorage, "chapters"),
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
    dropbox: withDB.bind(this, dbLoad),
    "default": function(){
        chapters = [];
        addNewFile();
        if (!isMobile && !window.fullScreen)
            note(main, "fullscreen-note", "Consider running in full-screen by hitting F11 on your keyboard."
                 + "<button type=\"button\" onclick=\"toggleFullScreen()\">go fullscreen</button>", 1000);
    }
};

function loadData() {
  chapters = null;
  var types = [getSetting("storageType"), getSetting("lastStorageType")];
  types.push("default");

  print("loadData", types);
  for(var i = 0;
      i < types.length
      && !chapters; ++i){
    var type = types[i];
    if(type){
      print("loading data", type);
      if (fileLoaders[type])
          fileLoaders[type]();
      else
          note(header, "load-failed-msg", fmt("Storage type \"$1\" is not yet supported", type));
    }
  }
}

function parseFileData(fileData) {
  print("parseFileData", fileData);
    if(fileData) {
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
