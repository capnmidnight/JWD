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

function deleteFiles(){
    if(window.localStorage){
        window.localStorage.removeItem("files");
        note(header, "delete-note", "Local storage deleted. Save before reloading page to avoid losing files.");
    }
}

function saveFile(){
    if(window.localStorage){
        stowFile();
        window.localStorage.setItem("files", JSON.stringify(files));
        note(header, "save-note", fmt("File \"$1\" saved.", files[currentFile].name));
    }
}

function parseFileData(filesData){
    if (filesData) {
        files = JSON.parse(filesData);
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

function loadData(postLoad) {
    var filesData = null;
    if (window.localStorage)
        filesData = window.localStorage.getItem("files");

    parseFileData(filesData);
    postLoad();
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

function loadFile(){
    Array.prototype.forEach.call(this.files, function(f){
        var reader = new FileReader();
        reader.addEventListener("load", function(evt){
            print(JSON.parse(evt.target.result));
        });
        reader.readAsText(f);
    });
}

var commands = {
    68: deleteFiles,
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