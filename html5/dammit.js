var header = null,
    menu = null,
    menuItems = null,
    fileControls = null,
    fileCount = null,
    main = null,
    unsavedFileIndicator = null,
    chapterName = null,
    editor = null,
    snippetsEditor = null,
    snippetControls = null,
    snippetCounts = null,
    totalWordCount = null,
    addWordCount = null,
    clock = null,
    minFreqCount = null,
    excludeWords = null,
    word1Frequency = null,
    word2Frequency = null,
    word3Frequency = null,
    word4Frequency = null,
    browserInfo = null,
    storageType = null,
    storageFile = null;

function getControls(){
    window.addEventListener("keyup", runCommands, false);
    window.addEventListener("resize", resize, false);
    window.addEventListener("popstate", moveHistory, false);

    header = getDOM("header");
    menu = getDOM("menu");
    fileControls = getDOM("#file-controls");
    fileCount = getDOM("#file-count");
    snippetControls = getDOM("#snippet-controls");
    snippetCounts = getDOM("#snippet-count");
    main = getDOM("#main");
    unsavedFileIndicator = getDOM("#unsaved-file-indicator");
    chapterName = getDOM("#chapter-name");
    totalWordCount = getDOM("#total-word-count");
    addWordCount = getDOM("#add-word-count");
    clock = getDOM("#clock");

    menuItems = getDOMAll("#menu>.button");
    menuItems.forEach(function (mnu) {
        var id = mnu.getValue();
        setSetting("lastView", id);
        mnu.addEventListener("click", showTab.bind(window, "main", id, true), false);
        menuItems[id] = mnu;
    });
    menuItems["analyze"].addEventListener("click", frequencyAnalysis, false);

    snippetsEditor = getDOM("#snippets-editor");
    snippetsEditor.addEventListener("keyup", saveSnippets, false);

    editor = getDOM("#editor");
    editor.addEventListener("keyup", interrobang, false);
    editor.addEventListener("keyup", countWords, false);
    editor.addEventListener("keyup", autoSave, false);

    minFreqCount = spinner(getDOM("#min-frequency"), "Minimum frequency:", 1, 1000);
    minFreqCount.addEventListener("change", frequencyAnalysis, false);

    excludeWords = getDOM("#exclude-words");
    excludeWords.addEventListener("change", frequencyAnalysis, false);

    word1Frequency = getDOM("#word-1-frequency");
    word2Frequency = getDOM("#word-2-frequency");
    word3Frequency = getDOM("#word-3-frequency");
    word4Frequency = getDOM("#word-4-frequency");

    browserInfo = getDOM("#browser-info");
    browserInfo.setValue(window.navigator.userAgent);

    var storeType = getSetting("storageType", "local");
    storageType = getDOM("#storage-type");
    storageType.addEventListener("change", onStorageTypeChanged, false);
    storageType.setValue(storeType);
    showTab("storage-details", "storage-" + storeType);

    storageFile = fileUpload(getDOM("#browse-storage-file"));
    storageFile.addEventListener("change", loadFromFile, false);
}

function onStorageTypeChanged(){
    setSetting("lastStorageType", getSetting("storageType"));
    var type = storageType.getValue();
    setSetting("storageType", type);
    showTab("storage-details", "storage-" + type);
    if(type == "dropbox")
        dbSetup();
}

function showTab(parentID, id, saveState){
    var boxes = getDOMAll(fmt("#$1>*", parentID));
    boxes.forEach(function (box) {
        box.style.display = id == box.id ? "block" : "none";
        box.className = id == box.id ? "selected" : "";
        if(parentID == "main" && id == box.id){
            var ds = box.dataset;
            header.style.display = ds.hideMenu ? "none" : "";
            fileControls.style.display = ds.showFileControls ? "" : "none";
            snippetControls.style.display = ds.showSnippetControls ? "" : "none";
        }
    });
    resize();
    if(!!saveState)
        window.history.pushState([parentID, id]);
}

function moveHistory(evt){
    if(evt.state)
        showTab(evt.state[0], evt.state[1]);
    else
        showTab("main", "menu");
}

function resize(){
    if(window.fullScreen)
        hide("fullscreen-note");

    main.style.height = px(window.innerHeight - header.clientHeight);
    editor.style.height = "100%";
    editor.style.height = px(editor.clientHeight - chapterName.clientHeight);
}

function clockTick(){
    if(!this.start)
        this.start = new Date().getTime();
    var next = new Date().getTime();
    var hours = next - this.start;
    hours = Math.floor(hours / 1000);
    var seconds = hours % 60;
    hours = Math.floor(hours / 60);
    var minutes = hours % 60;
    hours = Math.floor(hours / 60);
    clock.setValue(fmt("$01:$02:$03", hours, minutes, seconds));
    setTimeout(clockTick, 500);
}

function redirectCheck(){
    if(document.location.hostname != "localhost"
       && document.location.hostname != "127.0.0.1"
       && !document.location.hostname.match(/192\.168\.0\.\d+/)
       && document.location.protocol == "http:")
        document.location = document.location.href.replace("http://", "https://");
}

function pageLoad(){
    redirectCheck();
    getControls();
    clockTick();
    resize();
    loadData();
    if(isMobile)
        showTab("main", "snippet");
    else
        showTab("main", "menu");
}
