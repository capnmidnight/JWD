function loadData() {
    browserInfo.setValue(window.navigator.userAgent);

    var filesData = null;
    if (window.localStorage)
        filesData = window.localStorage.getItem("files");

    if (filesData) {
        files = JSON.parse(filesData);
        // delete the word counts, so the word counter can pick up later.
        files.forEach(function (file) {
            if ("count" in file)
                delete file["count"];
        });
        currentFile = 0;
        showFile();
        return true;
    }
    else {
        files = [];
        addNewFile();
        if (!window.fullScreen)
            note(header, "fullscreen-note", "Consider running in full-screen by hitting F11 on your keyboard.", 1000);
        return false;
    }
}