var header = null,
    menu = null,
    menuItems = null,
    fileControls = null,
    fileCount = null,
    main = null,
    filename = null,
    editArea = null,
    editor = null,
    scrollbar = null,
    totalWordCount = null,
    addWordCount = null,
    clock = null,
    minFreqCount = null,
    excludeWords = null,
    wordFrequency = null,
    word2Frequency = null,
    word3Frequency = null,
    word4Frequency = null,
    browserInfo = null,

    files = null,
    currentFile = null;

function getControls(){
    header = getDOM("header");
    menu = getDOM("menu");
    menuItems = getDOMAll("nav>button");
    fileControls = getDOM("#file-controls");
    fileCount = getDOM("#file-count");
    main = getDOM("#main");
    filename = getDOM("#filename");
    editArea = getDOM("#editArea");
    editor = getDOM("#editor");
    scrollbar = getDOM("#scrollbar");
    totalWordCount = getDOM("#total-word-count");
    addWordCount = getDOM("#add-word-count");
    clock = getDOM("#clock");
    minFreqCount = spinner(getDOM("#minFreqHolder"), "min-frequency", "Minimum frequency:", 1, 1000);
    excludeWords = getDOM("#exclude-words");
    wordFrequency = getDOM("#word-frequency");
    word2Frequency = getDOM("#word-2-frequency");
    word3Frequency = getDOM("#word-3-frequency");
    word4Frequency = getDOM("#word-4-frequency");
    browserInfo = getDOM("#browser-info");

    menuItems.forEach(function (menuItem) {
        var id1 = menuItem.getValue();
        menuItem.addEventListener("click", function (evt) {
            menuItems.forEach(function (mnu) {
                var id2 = mnu.getValue();
                var box = getDOM("#" + id2);
                box.style.display = id1 == id2 ? "block" : "none";
                mnu.className = id1 == id2 ? "selected" : "";
            });
            resize();
        }, false);
    });
}

function resize(){
    if(window.fullScreen)
        hide("fullscreen-note");

    main.style.height = px(
        window.innerHeight
        - header.clientHeight);

    editArea.style.height = px(
        main.clientHeight
        - filename.clientHeight);

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

    var dataLoaded = loadData();

    menuItems[dataLoaded ? 0 : menuItems.length - 1].click();

    editor.addEventListener("keyup", interrobang, false);
    menuItems[1].addEventListener("click", countWords, false);
    minFreqCount.addEventListener("change", countWords, false);
    excludeWords.addEventListener("change", countWords, false);
    editor.addEventListener("keyup", showScroll, false);
    scrollbar.addEventListener("mouseup", moveScroll, false);
    window.addEventListener("keyup", runCommands, false);
    window.addEventListener("resize", resize, false);

    countWords();
    clockTick();
    resize();
}