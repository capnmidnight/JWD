var header = null,
    menu = null,
    menuItems = null,
    fileControls = null,
    fileCount = null,
    main = null,
    unsavedFileIndicator = null,
    chapterName = null,
    writer = null,
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
    storageFile = null,
    themeStyle = null,
    notifications = null,
    toggleMenuButton = null;

function getControls(){
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
    notifications = getDOM("#notifications");
    storageFile = fileUpload(getDOM("#browse-storage-file"));
    toggleMenuButton = getDOM("#toggle-menu-button");

    menuItems = getDOMAll("#menu>.button");
    menuItems.forEach(function (mnu) {
        var id = mnu.getValue();
        setSetting("lastView", id);
        mnu.addEventListener("click", showTab.bind(window, "main", id, true), false);
        menuItems[id] = mnu;
    });
    menuItems["analyze"].addEventListener("click", frequencyAnalysis, false);
    menuItems["edit"].addEventListener("click", buildEditView, false);

    snippetsEditor = getDOM("#snippets-editor");
    snippetsEditor.addEventListener("keyup", saveSnippets, false);

    writer = getDOM("#writer");
    writer.addEventListener("keyup", interrobang, false);
    writer.addEventListener("keyup", countWords, false);
    writer.addEventListener("keyup", autoSave, false);

    editor = getDOM("#editor");
    editor.addEventListener("mousedrag", moveWriting, false);

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

    themeStyle = getDOM("#theme-block");
    getDOMAll("td").forEach(function(cell, i){
        cell.addEventListener("click", function(){
            setTheme(i);
            data.theme = i;
            saveFile();
        });
    });
}

function toggleMenu(){
    if(toggleMenuButton.innerHTML == "\u2192"){
        toggleMenuButton.innerHTML = "\u2190";
        header.style.left = 0;
        header.style.opacity = 1;
    }
    else{
        toggleMenuButton.innerHTML = "\u2192";
        header.style.left = px(-(header.clientWidth - toggleMenuButton.clientWidth));
        header.style.opacity = 0.5;
    }
}

function setTheme(i){
    themeStyle.href = fmt("color$1.css", i * 1 + 1);
    usrIt("theme", themeStyle.href);
}

function onStorageTypeChanged(){
    setSetting("lastStorageType", getSetting("storageType"));
    var type = storageType.getValue();
    setSetting("storageType", type);
    datIt("storage type", type);
    showTab("storage-details", "storage-" + type);
    if (type == "dropbox")
        dorpbox();
    else if(type == "gdrive")
        gdrive();
}

function showTab(parentID, id, saveState){
    var boxes = getDOMAll(fmt("#$1>*", parentID));
    var url = [parentID, id].join("/");
    navIt(url);
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
    if(!!saveState){
        if(url.length > 0)
            url = "#" + url;

        window.history.pushState(
            [parentID, id],
            fmt("Just Write, Dammit! > $1 > $2", parentID, id),
            url);
    }
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

    main.style.height = px(window.innerHeight);
    writer.style.height = "100%";
    writer.style.height = px(writer.clientHeight - chapterName.clientHeight * 2);
    snippetsEditor.style.height = "100%";
    snippetsEditor.style.height = px(snippetsEditor.clientHeight - snippetCounts.clientHeight);
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

function firstNavigation(){
    var parts;
    if(document.location.hash.length > 0){
        parts = document.location.hash.substring(1).split("/");
        if(parts.length == 1)
            parts.unshift("main");
    }

    if(parts && parts.length == 2)
        showTab(parts[0], parts[1]);
    else if(!getSetting("storageType")){
        showTab("main", "about");
        usrIt("firstTime");
    }
    else if(isMobile){
        showTab("main", "snippet");
        toggleMenu();
    }
    else
        showTab("main", "menu");

    if (!window.fullScreen)
        msg("fullscreen-note", "Consider running in full-screen by hitting F11 on your keyboard."
            + "<a class=\"button\" onclick=\"toggleFullScreen()\">go fullscreen</a>", 1000);
}

function pageLoad(){
    redirectCheck();
    getControls();
    clockTick();
    resize();
    loadData();
    firstNavigation();
}
