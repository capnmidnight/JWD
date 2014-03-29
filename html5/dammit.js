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
    word1Frequency = null,
    word2Frequency = null,
    word3Frequency = null,
    word4Frequency = null,
    browserInfo = null,

    files = null,
    currentFile = null;

function getControls(){
    header = getDOM("header");
    menu = getDOM("menu");
    menuItems = getDOMAll("#menu>button");
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
    word1Frequency = getDOM("#word-1-frequency");
    word2Frequency = getDOM("#word-2-frequency");
    word3Frequency = getDOM("#word-3-frequency");
    word4Frequency = getDOM("#word-4-frequency");
    browserInfo = getDOM("#browser-info");

    menuItems.forEach(function (mnu) {
        var id1 = mnu.getValue();
        mnu.addEventListener("click", showTab.bind(window, id1), false);
    });
}

function showTab(id1){
    getDOM("#menu").style.display = "none";
    menuItems.forEach(function (mnu) {
        var id2 = mnu.getValue();
        var box = getDOM("#" + id2);
        box.style.display = "none";
        mnu.className = id1 == id2 ? "selected" : "";
    });
    getDOM("#" + id1).style.display = "block";
    resize();
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

    editor.addEventListener("keyup", interrobang, false);
    editor.addEventListener("keyup", countWords, false);
    menuItems[1].addEventListener("click", frequencyAnalysis, false);
    minFreqCount.addEventListener("change", frequencyAnalysis, false);
    excludeWords.addEventListener("change", frequencyAnalysis, false);
    editor.addEventListener("keyup", showScroll, false);
    scrollbar.addEventListener("mouseup", moveScroll, false);
    window.addEventListener("keyup", runCommands, false);
    window.addEventListener("resize", resize, false);

    countWords();
    clockTick();
    resize();
}