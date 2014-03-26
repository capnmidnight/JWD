var editor = null,
    notes = null,
    wordCount = null,
    clock = null,
    files = null,
    currentFile = null,
    filename = null,
    scrollbar = null;

function resize(){
    if(window.fullScreen)
        hide("fullscreen-note");
    var w1 = window.innerWidth;
    var h = window.innerHeight;
    var l1 = w1 * 0.05;
    var w2 = 50;
    var w3 = 150;
    w1 -= l1 * 2 + w2 + w3;
    var l2 = l1 + w1;
    var l3 = l2 + w2;
    var t = h * 0.15;
    h -= t * 2;
    move(editor,    l1, t, w1, h);
    move(scrollbar, l2, t, w2, h);
    move(notes,     l3, t, w3, h);
    move(wordCount, l2 - 100, t - 24);
    move(clock,     l2 - 100, t - 48);
    move(filename,  l1, t - 24);
    editor.style.fontSize = px(Math.floor(h / 15));
}

function countWords(){
    var words = editor.innerHTML
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

        words.sort();
        words.forEach(function(word){
            if(counts.length == 0
            || counts[counts.length - 1][0] != word)
                counts.push([word, 0]);
            ++counts[counts.length - 1][1];
        });

        counts.sort(function(a, b){
            return b[1] - a[1]; // most to least
        });
    }

    if(!files[currentFile].count)
        files[currentFile].count = count;

    var msg = fmt("TOTAL WORDS: $1, ADD'L WORDS: $2", count, count - files[currentFile].count);
    wordCount.textContent = msg;

    notes.innerHTML = counts.map(function(word){
        return fmt("$1: $2", word[0], word[1]);
    }).join("\n<br>");
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
    clock.textContent = fmt("ELAPSED: $01:$02:$03", hours, minutes, seconds);
}

var commands = {
    68: function(){
        window.localStorage.removeItem("files");
        note("delete-note", "Local storage deleted. Save before reloading page to avoid losing files.");
    },
    78: function(){
        addNewFile();
        note("new-file-note", "New file created.");
    },
    83: function(){
        window.localStorage.setItem("files", JSON.stringify(files));
        note("save-note", fmt("File \"$1\" saved.", files[currentFile].name));
    },
    191: function(){
        msg("help-note-1", "<h2>Help</h2>You can save your writing with CTRL+ALT+S.<br>The \"(new file)\" text is editable. Use it to set a name for your document.<br>Create new documents with CTRL+ALT+N.<br>Change between documents with CTRL+[ and CTRL+].<br>Delete all of your saved files with CTRL+ALT+D. Press CTRL+ALT+S before reloading the page to undo delete.", 0, forever);
    },
    219: function(){
        currentFile = (currentFile + files.length - 1) % files.length;
        showFile();
        note("view-file-note", fmt("Now viewing file \"$1\".", files[currentFile].name));
    },
    221: function(){
        currentFile = (currentFile + 1) % files.length;
        showFile();
        note("view-file-note", fmt("Now viewing file \"$1\".", files[currentFile].name));
    },
};

function runCommands(evt){
    print(evt.keyCode);
    if(evt.ctrlKey){
        files[currentFile].doc = editor.innerHTML;
        files[currentFile].name = filename.textContent;
        if(evt.keyCode in commands){
            commands[evt.keyCode]();
            evt.preventDefault();
        }
    }
}

function showFile(){
    editor.innerHTML = files[currentFile].doc;
    filename.textContent = files[currentFile].name;
    countWords();
    showScroll();
}

function showScroll(){
    scrollbar.innerHTML = editor.innerHTML;
}

function moveScroll(evt){
    var sel = scrollbar.getSelection();
    editor.setSelection(sel);
}

function addNewFile(){
    files.push({doc:"<p>&nbsp;</p>", name:"(new file)"});
    currentFile = files.length - 1;
    showFile();
}

function pageLoad(){
    editor = getDOM("editor");
    notes = getDOM("notes");
    wordCount = getDOM("word-count");
    clock = getDOM("clock");
    filename = getDOM("filename");
    scrollbar = getDOM("scrollbar");

    var filesData = window.localStorage.getItem("files");
    if(filesData){
        files = JSON.parse(filesData);
        // delete the word counts, so the word counter can pick up later.
        files.forEach(function(file){
            if("count" in file)
                delete file["count"];
        });
        currentFile = 0;
        showFile();
    }
    else{
        files = [];
        addNewFile();
    }

    editor.addEventListener("keyup", interrobang, false);
    editor.addEventListener("keyup", countWords, false);
    editor.addEventListener("keyup", showScroll, false);
    scrollbar.addEventListener("mouseup", moveScroll, false);
    window.addEventListener("keyup", runCommands, false);
    window.addEventListener("resize", resize, false);
    setInterval(clockTick, 500);

    resize();
    countWords();
    clockTick();
    /*
    note("welcome-note", "Welcome to Just Write, Dammit! The Zen-writing program.");
    if(!window.fullScreen)
        note("fullscreen-note", "Consider running in full-screen by hitting F11 on your keyboard.", 1000);

    */
}