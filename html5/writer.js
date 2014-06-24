var header = null,
    unsavedFileIndicator = null,
    chapterName = null,
    editor = null,
    totalWordCount = null,
    addWordCount = null,
    clock = null,
    writer = null,
    writingMode = null
    multiplier = null,
    toggleMenuButton = null,
    lastWordCount = null,
    lastText = null;

function writeScreenInit(){
    header = getDOM("header");
    header.style.left = 0;
    header.style.opacity = 1;

    writer = getDOM("#writer");
    writer.addEventListener("keyup", interrobang, false);
    writer.addEventListener("keyup", countWords, false);
    writer.addEventListener("keyup", autoSave, false);
    writer.addEventListener("keyup", scoreIt, false);

    writer.addEventListener("blur", menuDisplay, false);
    writer.parentElement.addEventListener("mousemove", menuDisplay, false);
    window.addEventListener("touchdown", menuDisplay, false);

    unsavedFileIndicator = getDOM("#unsaved-file-indicator");
    chapterName = getDOM("#chapter-name");
    totalWordCount = getDOM("#total-word-count");
    addWordCount = getDOM("#add-word-count");
    clock = getDOM("#clock");        
    writingMode = getDOM("#writing-mode");
    score = getDOM("#score");
    toggleMenuButton = getDOM("#toggle-menu-button");
}

function writeScreenShow(){
    menuDisplay(true);
}

function showMenu(){
    toggleMenuButton.innerHTML = "\u00AB";
    header.style.left = 0;
    header.style.opacity = 1;
}

function hideMenu(){
    toggleMenuButton.innerHTML = "\u00BB";
    header.style.left = px(-(header.clientWidth - toggleMenuButton.clientWidth));
    header.style.opacity = 0.5;
}

function toggleMenu(){
    if(toggleMenuButton.innerHTML == "\u00BB"){
        menuDisplay(false);
    }
    else{
        menuDisplay(true);
    }
}

function menuDisplay(hide){
    if(typeof(hide) == "object"){
        hide = false;
    }
    if(!this.timeout && hide){
        var self = this;
        this.timeout = window.setTimeout(function(){
            hideMenu();
            delete self.timeout;
        }, 3000);
    }
    else if(!hide){
        if(this.timeout){
            window.clearTimeout(this.timeout);
            delete this.timeout;
        }
        else{
            showMenu();
        }
    }
    if(!hide){
        menuDisplay(true);
    }
}

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

function scoreIt(evt){
    if(data.writingMode == "charge"){
        writer.edit(function(currentText){    
            if(!lastText){
                lastText = data.chapters[data.currentChapter].doc;
            }
            var currentCount = data.chapters[data.currentChapter].currentCount;
            if(currentText.length < lastText.length){
                multiplier = 1;
                data.score -= 100;
                score.setValue(fmt("| score: $1 DOH! You tried to go backwards. Never give up, never surrender!", data.score));
                    return lastText;
                currentText = lastText;
            }
            else if(currentCount > lastWordCount){
                var lastScore = data.score;
                data.score += multiplier;
                ++multiplier;
                score.setValue(fmt("| score: $1 + $2 = $3", lastScore, multiplier, data.score));
            }
            lastWordCount = currentCount;
            lastText = currentText;
            return currentText;
        });
    }
}