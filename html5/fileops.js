function addNewFile(txt){
    if(txt == undefined)
        txt = "(type text here)";
    files.push({doc:txt, name:"(new file)"});
    currentFile = files.length - 1;
    showFile();
    note(header, "new-file-note", "New file created.");
}

function saveFile(){
    if(window.localStorage){
        window.localStorage.setItem("files", JSON.stringify(files));
        note(header, "save-note", fmt("File \"$1\" saved.", files[currentFile].name));
    }
}

function nextFile(){
    currentFile = (currentFile + 1) % files.length;
    showFile();
    note(header, "view-file-note", fmt("Now viewing file \"$1\".", files[currentFile].name));
}

function prevFile(){
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

var commands = {
    68: deleteFiles,
    78: addNewFile,
    83: saveFile,
    219: prevFile,
    221: nextFile,
};

function runCommands(evt){
    //print(evt.keyCode);
    if(evt.ctrlKey){
        files[currentFile].doc = editor.innerHTML;
        files[currentFile].name = filename.value;
        if(evt.keyCode in commands){
            commands[evt.keyCode]();
            evt.preventDefault();
        }
    }
}