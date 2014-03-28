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
    notes = null,
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
    notes = getDOM("#notes");
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
        - 5);
}

function countWords(){
    var words = editor.getValue()
        .replace(/<\/?(br|p)>/g, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .match(/[\w']+/g),
        count = 0, counts = [];

    if(words != null){
        words = words.map(function(word){
            return word.toLowerCase();
        });

        count = words.length;

        counts = words
            .group()
            .map(function(word){ return [word[0], word[1].length]; })
            .group(function(word){ return word[1]; }, function(word){ return word[0]; })
            .map(function(count){
                count[1].sort();
                return [count[0], count[1].join(", ")];
            });

        counts.sort(function(a, b){
            return b[0] - a[0];
        });
    }

    if(!files[currentFile].count)
        files[currentFile].count = count;

    totalWordCount.setValue(count);
    addWordCount.setValue(count - files[currentFile].count);

    notes.setValue(counts.map(function(word){
        return fmt("$1: $2", word[0], word[1]);
    }).join("\n<br>"));
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
    //menuItems[5].click();

    editor.addEventListener("keyup", interrobang, false);
    editor.addEventListener("keyup", countWords, false);
    editor.addEventListener("keyup", showScroll, false);
    scrollbar.addEventListener("mouseup", moveScroll, false);
    window.addEventListener("keyup", runCommands, false);
    window.addEventListener("resize", resize, false);

    countWords();
    clockTick();
    resize();
}