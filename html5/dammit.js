var header = null,
    menu = null,
    menuItems = null,
    fileControls = null,
    fileCount = null,
    main = null,
    chapterName = null,
    editArea = null,
    editor = null,
    scrollbar = null,
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
    storageFile = null,

    chapters = null,
    currentChapter = null,
    dbClient = null,
    dbDataStoreMGR = null,
    dbDataStore = null;

function getControls(){
    window.addEventListener("keyup", runCommands, false);
    window.addEventListener("resize", resize, false);

    header = getDOM("header");
    menu = getDOM("menu");
    fileControls = getDOM("#file-controls");
    fileCount = getDOM("#file-count");
    main = getDOM("#main");
    chapterName = getDOM("#chapter-name");
    editArea = getDOM("#editArea");
    totalWordCount = getDOM("#total-word-count");
    addWordCount = getDOM("#add-word-count");
    clock = getDOM("#clock");

    menuItems = getDOMAll("#menu>button");
    menuItems.forEach(function (mnu) {
        var id = mnu.getValue();
        setSetting("lastView", id);
        mnu.addEventListener("click", showTab.bind(window, "main", id), false);
        menuItems[id] = mnu;
    });
    menuItems["analyze"].addEventListener("click", frequencyAnalysis, false);

    editor = getDOM("#editor");
    editor.addEventListener("keyup", interrobang, false);
    editor.addEventListener("keyup", countWords, false);
    editor.addEventListener("keyup", showScroll, false);

    scrollbar = getDOM("#scrollbar");
    scrollbar.addEventListener("mouseup", moveScroll, false);

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
    if(storeType == "dropbox")
        dbSetup();
    storageType = getDOM("#storage-type");
    storageType.setValue(storeType);
    storageType.addEventListener("change", function (evt) {
        setSetting("lastStorageType", getSetting("storageType"));
        var type = storageType.getValue();
        setSetting("storageType", type);
        showTab("storage-details", "storage-" + type);
        if(type == "dropbox" && !dbClient)
            dbSetup();
    });
    showTab("storage-details", "storage-" + storeType);

    storageFile = fileUpload(getDOM("#browse-storage-file"));
    storageFile.addEventListener("change", loadFromFile, false);

    showTab("main", getSetting("lastView", "menu"));
}

function dbSetup(){
    dbClient = new Dropbox.Client({key: "g2rnjvo102estt0"});
    
    dbClient.authenticate({interactive: false}, function (error) {
        if (error)
            alert('Authentication error: ' + error);
    });
    
    if (dbClient.isAuthenticated())
        dbDataStoreMGR = dbClient.getDatastoreManager();
}

function showTab(parentID, id){
    var boxes = getDOMAll(fmt("#$1>*", parentID));
    boxes.forEach(function (box) {
        box.style.display = id == box.id ? "block" : "none";
        box.className = id == box.id ? "selected" : "";
        if(parentID == "main" && id == box.id){
            var ds = box.dataset;
            header.style.display = ds.hideMenu ? "none" : "";
            fileControls.style.display = ds.showFileControls ? "" : "none";
        }
    });
    resize();
}

function resize(){
    if(window.fullScreen)
        hide("fullscreen-note");

    main.style.height = px(window.innerHeight - header.clientHeight);
    editArea.style.height = px(main.clientHeight - chapterName.clientHeight);
    editor.style.width = px(
        editArea.clientWidth
        - scrollbar.clientWidth
        - 30);
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

function pageLoad(){
    getControls();
    clockTick();
    resize();
    showTab("main", "menu");
    loadData();
}