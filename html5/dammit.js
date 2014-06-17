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
    infoBar = null,
    storageType = null,
    storageFile = null,
    themeStyle = null,
    notifications = null,
    toggleMenuButton = null,
    reader = null,
    pubTitle = null,
    pubAuthFirstName = null,
    pubAuthLastName = null,
    pubImage = null,
    pubImageThumb = null,
    theChain = null,
    writingMode = null,
    score = null;

function getControls(){
    window.addEventListener("resize", resize, false);
    window.addEventListener("popstate", moveHistory, false);

    menu = getDOM("menu");
    fileControls = getDOM("#file-controls");
    fileCount = getDOM("#file-count");
    main = getDOM("#main");
    unsavedFileIndicator = getDOM("#unsaved-file-indicator");
    chapterName = getDOM("#chapter-name");
    totalWordCount = getDOM("#total-word-count");
    addWordCount = getDOM("#add-word-count");
    clock = getDOM("#clock");
    notifications = getDOM("#notifications");
    storageFile = fileUpload(getDOM("#browse-storage-file"));
    toggleMenuButton = getDOM("#toggle-menu-button");
    reader = getDOM("#reader");
    infoBar= getDOM("#infobar");
    pubImageThumb = getDOM("#pub-image-thumb");
    theChain = getDOM("#the-chain");
    writingMode = getDOM("#writing-mode");
    score = getDOM("#score");

    header = getDOM("header");
    header.style.left = 0;
    header.style.opacity = 1;

    menuItems = getDOMAll("#menu>.button");
    menuItems.forEach(function (mnu){
        var id = mnu.getValue().toLowerCase();
        mnu.addEventListener("click", function(){
            setSetting("lastView", id);
            showTab(["main", id]);
        }, false);
        menuItems[id] = mnu;
    });

    writer = getDOM("#writer");
    writer.addEventListener("keydown", interceptor, false);
    writer.addEventListener("keyup", interrobang, false);
    writer.addEventListener("keyup", countWords, false);
    writer.addEventListener("keyup", autoSave, false);
    writer.addEventListener("keyup", scoreIt, false);

    editor = getDOM("#editor");
    editor.addEventListener("mousedrag", moveWriting, false);

    minFreqCount = spinner(getDOM("#min-frequency"), "Minimum frequency:", 1, 1000);
    minFreqCount.addEventListener("change", analyzeScreenShow, false);

    excludeWords = getDOM("#exclude-words");
    excludeWords.addEventListener("change", analyzeScreenShow, false);

    word1Frequency = getDOM("#word-1-frequency");
    word2Frequency = getDOM("#word-2-frequency");
    word3Frequency = getDOM("#word-3-frequency");
    word4Frequency = getDOM("#word-4-frequency");

    var keyTimeOut = null;
    var setDataProperty = function(key){
        if(keyTimeOut){
            clearTimeout(keyTimeOut);
        }
        data[key] = this.getValue();
        keyTimeOut = setTimeout(saveFile, 3000);
    };

    pubTitle = getDOM("#pub-title");
    pubAuthFirstName = getDOM("#pub-author-first-name");
    pubAuthLastName = getDOM("#pub-author-last-name");
    pubTitle.addEventListener("keyup", setDataProperty.bind(pubTitle, "title"));
    pubAuthFirstName.addEventListener("keyup", setDataProperty.bind(pubAuthFirstName, "authorFirstName"));
    pubAuthLastName.addEventListener("keyup", setDataProperty.bind(pubAuthLastName, "authorLastName"));
    pubImage = fileUpload(getDOM("#pub-image"));
    pubImage.addEventListener("change", loadCoverImage);

    browserInfo = getDOM("#browser-info");
    browserInfo.setValue(window.navigator.userAgent);

    var storeType = getSetting("storageType", "local");
    storageType = getDOM("#storage-type");
    storageType.addEventListener("change", onStorageTypeChanged, false);
    storageType.setValue(storeType);
    showTab(["storage-details", "storage-" + storeType], true);

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
    if(toggleMenuButton.innerHTML == "\u00BB"){
        toggleMenuButton.innerHTML = "\u00AB";
        header.style.left = 0;
        header.style.opacity = 1;
    }
    else{
        toggleMenuButton.innerHTML = "\u00BB";
        header.style.left = px(-(header.clientWidth - toggleMenuButton.clientWidth));
        header.style.opacity = 0.5;
    }
}

function setTheme(i){
    themeStyle.href = fmt("color$1.css#v$2", i * 1 + 1, curAppVersion);
    ga('send', 'event', 'user', "theme:" + themeStyle.href);
}

function onStorageTypeChanged(){
    setSetting("lastStorageType", getSetting("storageType"));
    var type = storageType.getValue();
    setSetting("storageType", type);
    ga("send", "event", "storage type", type);
    showTab(["storage-details", "storage-" + type], true);
    if (type == "dropbox"){
        dorpbox();
    }
    else if(type == "gdrive"){
        gdrive();
    }
}

function waitForData(obj){
    if(obj && obj.thunk){
        if(!data){
            setTimeout(waitForData, 1000, obj);
        }
        else{
            obj.thunk.apply(window, obj.params);
        }
    }
}

function menuScreenShow(){
    checkProgress();
}

function showTab(parts, skipState){
    var url = parts.join("/");
    var parentID = parts[0];
    var id = parts[1];
    var boxes = getDOMAll(fmt("#$1>*", parentID));
    if(parentID == "main"){
        ga("send", "pageview", url);
    }
    boxes.forEach(function (box, i){
        setDisplay(id == box.id, box);
        box.style.display = id == box.id ? "" : "none";
        if(parentID == "main" && id == box.id){
            var ds = box.dataset;
            setDisplay(!ds.hideMenu, header);
            fileControls.style.display = ds.showFileControls ? "" : "none";
            waitForData({thunk:window[id + "ScreenShow"], params:parts.slice(2, parts.length)});
        }
    });
    resize();
    if(!skipState){
        if(url.length > 0){
            url = "#" + url;
        }

        window.history.pushState(
            parts,
            fmt("Just Write, Dammit! > $1", parts.join(" > ")),
            url);
    }
}

function moveHistory(evt){
    if(document.location.hash.length > 0){
        showTab(document.location.hash.substring(1).split("/"), true);
    }
}

function resize(){
    var windowHeight = Math.min(window.innerHeight, screen.availHeight);
    // the extra 2 pixels is to avoid a small scroll overlap with the window edge
    main.style.height = px(windowHeight - notifications.clientHeight - header.clientHeight - 2);
    main.style.top = px(header.clientHeight + notifications.clientHeight);
    writer.style.height = "100%";
    writer.style.height = px(writer.clientHeight - chapterName.clientHeight - infobar.clientHeight);
    chapterName.style.width = "100%";
    chapterName.style.width = px(chapterName.clientWidth - writingMode.clientWidth - 5);
    window.scrollX = window.scrollY = 0;
}

function clockTick(){
    if(!this.start){
        this.start = new Date().getTime();
    }
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

function firstNavigation(){
    var parts;
    if(document.location.hash.length > 0){
        parts = document.location.hash.substring(1).split("/");
        if(parts.length == 1){
            parts.unshift("main");
        }
    }

    if(parts && parts.length >= 2){
        showTab(parts);
    }
    else if(!getSetting("storageType")){
        showTab(["main", "about"]);
        ga('send', 'event', 'user', "firstTime");
    }
    else{
        showTab(["main", "menu"]);
    }
}

function pageLoad(loadDataDone, initDone){
    var doneDone = function(){
        if(loadDataDone){
            loadDataDone();
        }
        firstNavigation();
        if(initDone){
            initDone();
        }
    };
    try{
        getControls();
        clockTick();
        resize();
        loadData(doneDone);
    }
    catch(exp){
        doneDone();
    }
}

var multiplier, lastWordCount;

function setWritingMode(mode, dontSave){
    if(dontSave){
        writingMode.setValue(mode);
    }
    else{
        data.writingMode = mode;
        saveFile();
    }
    writer.spellcheck = (mode == "spell");
    if(mode == "charge"){
        if(data.score){
            if(!data.scoreList){
                data.scoreList = [];
            }
            data.scoreList.push(data.score);
        }
        data.score = 0;
        multiplier = 1;
        lastWordCount = 0;
        score.setValue(fmt("| score: $1 Keep typing and don't hit backspace or delete.", data.score));
    }
    else{
        score.setValue("");
    }
}

function interceptor(evt){
    if(data.writingMode == "charge" 
        && (evt.keyCode == 8 || evt.keyCode == 46)){
        evt.preventDefault();
        multiplier = 1;
        score.setValue(fmt("| score: $1 DOH! You tried to go backwards. Never give up, never surrender!", data.score));
    }
}

function scoreIt(evt){
    if(data.writingMode == "charge"){
        var currentCount = data.chapters[data.currentChapter].currentCount;
        if(currentCount > lastWordCount){
            var lastScore = data.score;
            data.score += multiplier;
            ++multiplier;
            score.setValue(fmt("| score: $1 + $2 = $3", lastScore, multiplier, data.score));
        }
        lastWordCount = currentCount;
    }
}