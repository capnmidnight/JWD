var header = null,
    menu = null,
    menuItems = null,
    main = null,
    filename = null,
    editArea = null,
    editor = null,
    scrollbar = null,
    totalWordCount = null,
    addWordCount = null,
    clock = null,
    notes = null,

    files = null,
    currentFile = null;

function getControls(){
    header = getDOM("header");
    menu = getDOM("menu");
    menuItems = getDOMAll("nav>button");
    main = getDOM("#main");
    filename = getDOM("#filename");
    editArea = getDOM("#editArea");
    editor = getDOM("#editor");
    scrollbar = getDOM("#scrollbar");
    totalWordCount = getDOM("#total-word-count");
    addWordCount = getDOM("#add-word-count");
    clock = getDOM("#clock");
    notes = getDOM("#notes");
}

function resize(){
    if(window.fullScreen)
        hide("fullscreen-note");

    main.style.height = px(
        window.innerHeight
        - header.clientHeight);

    editArea.style.height = px(
        main.clientHeight
        - filename.clientHeight * 4);

    editor.style.width = px(
        editArea.clientWidth
        - scrollbar.clientWidth);
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

    totalWordCount.textContent = count;
    addWordCount.textContent = count - files[currentFile].count;

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
    clock.textContent = fmt("$01:$02:$03", hours, minutes, seconds);
    setTimeout(clockTick, 500);
}

var commands = {
    68: function(){
        if(window.localStorage){
            window.localStorage.removeItem("files");
            note(header, "delete-note", "Local storage deleted. Save before reloading page to avoid losing files.");
        }
    },
    78: function(){
        addNewFile();
        note(header, "new-file-note", "New file created.");
    },
    83: function(){
        if(window.localStorage){
            window.localStorage.setItem("files", JSON.stringify(files));
            note(header, "save-note", fmt("File \"$1\" saved.", files[currentFile].name));
        }
    },
    219: function(){
        currentFile = (currentFile + files.length - 1) % files.length;
        showFile();
        note(header, "view-file-note", fmt("Now viewing file \"$1\".", files[currentFile].name));
    },
    221: function(){
        currentFile = (currentFile + 1) % files.length;
        showFile();
        note(header, "view-file-note", fmt("Now viewing file \"$1\".", files[currentFile].name));
    },
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

function showFile(){
    editor.innerHTML = files[currentFile].doc;
    filename.value = files[currentFile].name;
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

function addNewFile(txt){
    if(txt == undefined)
        txt = "(type text here)";
    files.push({doc:txt, name:"(new file)"});
    currentFile = files.length - 1;
    showFile();
}

function pageLoad(){
    getControls();

    menuItems.forEach(function(menuItem){
        var id1 = menuItem.textContent;
        menuItem.addEventListener("click", function(evt){
            menuItems.forEach(function(mnu){
                var id2 = mnu.textContent;
                var box = getDOM("#" + id2);
                box.style.display = id1 == id2 ? "block" : "none";
                mnu.className = id1 == id2 ? "selected" : "";
            });
            resize();
        }, false);
    });


    var filesData = null;
    if(window.localStorage)
        window.localStorage.getItem("files");

    if(filesData){
        files = JSON.parse(filesData);
        // delete the word counts, so the word counter can pick up later.
        files.forEach(function(file){
            if("count" in file)
                delete file["count"];
        });
        currentFile = 0;
        showFile();
        menuItems[0].click();
    }
    else{
        files = [];
        addNewFile();
        menuItems[menuItems.length - 1].click();
        if(!window.fullScreen)
            note(header, "fullscreen-note", "Consider running in full-screen by hitting F11 on your keyboard.", 1000);
    }

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