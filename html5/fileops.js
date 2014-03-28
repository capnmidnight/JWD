function addNewFile(txt){
    if(txt == undefined)
        txt = "(type text here)";
    files.push({doc:txt, name:"(new file)"});
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

function saveFile(){
    if(window.localStorage){
        stowFile();
        window.localStorage.setItem("files", JSON.stringify(files));
        note(header, "save-note", fmt("File \"$1\" saved.", files[currentFile].name));
    }
}

function nextFile(){
    stowFile();
    currentFile = (currentFile + 1) % files.length;
    showFile();
    note(header, "view-file-note", fmt("Now viewing file \"$1\".", files[currentFile].name));
}

function prevFile(){
    stowFile();
    currentFile = (currentFile + files.length - 1) % files.length;
    showFile();
    note(header, "view-file-note", fmt("Now viewing file \"$1\".", files[currentFile].name));
}

function deleteFiles(){
    if(window.localStorage){
        window.localStorage.removeItem("files");
        note(header, "delete-note", "Local storage deleted. Save before reloading page to avoid losing files.");
    }
}

function stowFile(){
    files[currentFile].doc = editor.getValue();
    files[currentFile].name = filename.getValue();
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