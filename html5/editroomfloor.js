var selectedWritingBlock = null;

function editScreenShow() {
    var doc = data.chapters[data.currentChapter].doc;

    doc = doc.replace(/\r\n/g, "\n"); // normalize newl ine cha racters
    doc = doc.split(/\n\n/g)
        .map(function (para) {
            para = para.replace(/([.…!?‽])(\s+)/g, "$1</span>$2<span class=\"sentence\">");
            return fmt("<p class=\"paragraph\"><span class=\"sentence\">$1</span></p>", para);
        })
        .join("\n");
    editor.setValue(doc);
    getDOMAll(".sentence ").forEach(function (s) {
        s.addEventListener(isMobile ? "touchstart" : "mousedown", pickupWriting);
        s.addEventListener(isMobile ? "touchend" : "mouseup", placeWriting);
        s.addEventListener(isMobile ? "touchmove" : "mousemove", moveWriting);
    });
    getDOMAll(".paragraph").forEach(function (s) {
        s.addEventListener(isMobile ? "touchstart" : "mousedown", pickupWriting);
        s.addEventListener(isMobile ? "touchend" : "mouseup", placeWriting);
        s.addEventListener(isMobile ? "touchmove" : "mousemove", moveWriting);
    });
}

function readScreenShow(chapterNumber){
    var elems = exportBody();
    reader.innerHTML = "";
    elems.forEach(function(elem){
        reader.appendChild(elem);
    });
    var links = arr(reader.getElementsByTagName("a"));
    links.forEach(function(lnk){
        if(lnk.href && lnk.href.indexOf("#") > -1){
            lnk.href = lnk.href.replace("#", "#main/read/");
        }
        else if(lnk.name == chapterNumber){
            lnk.scrollIntoView(true);
        }
    });
    if(!chapterNumber){
        reader.scrollTop = 0;
    }
}

function getLocation(box) {
    var loc = [0, 0];
    for (var i = box; !!i; i = i.parentElement) {
        loc[0] += i.offsetLeft;
        loc[1] += i.offsetTop;
    }
    return loc;
}

var delta = [0, 0];

function pickupWriting(evt) {
    if(isMobile)
        evt = evt.touches[0];
    if(this.className == "sentence"){
        selectedWritingBlock = this;
        var loc = [this.offsetLeft, this.offsetTop];
        this.style.position = "absolute";
        this.style.left = px(loc[0]);
        this.style.top = px(loc[1]);
        delta[0] = loc[0] - evt.pageX;
        delta[1] = loc[1] - evt.pageY;
        var parent = this.parentElement;
        if (parent != editor) {
            parent.removeChild(this);
            editor.appendChild(this);
            if (parent.children.length == 0)
                editor.removeChild(parent);
        }
        evt.preventDefault();
        evt.stopPropagation();
    }
}

function getInsertPosition() {
    if (selectedWritingBlock && over) {
        var dx1 = selectedWritingBlock.offsetLeft - over.offsetLeft;
        var dy1 = selectedWritingBlock.offsetTop - over.offsetTop;
        var dx2 = dx1 - over.offsetWidth;
        var dy2 = dy1 - over.offsetHeight;
        var d1 = dx1 * dx1 + dy1 * dy1;
        var d2 = dx2 * dx2 + dy2 * dy2;
        var position = d1 < d2 ? "beforebegin" : "afterend";
        return position;
    }
}

function stripHTML(doc){
    return doc
        .replace(/\r?\n/g, "")
        .replace(/<\/p>/g, "\n\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/  +/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/\n /g, "\n")
        .trim();
}

function placeWriting() {
    if (selectedWritingBlock && over) {
        selectedWritingBlock.style.position = "";
        selectedWritingBlock.style.left = "";
        selectedWritingBlock.style.top = "";
        editor.removeChild(selectedWritingBlock);
        if (selectedWritingBlock.className == over.className)
            over.insertAdjacentHTML(getInsertPosition(), selectedWritingBlock.outerHTML);
        else
            over.appendChild(selectedWritingBlock);
        selectedWritingBlock = null;
        over = null;

        var placeholder = getDOM("#editor-placeholder");
        if(placeholder)
            placeholder.parentElement.removeChild(placeholder);

        var doc = editor.innerHTML;
        doc = stripHTML(doc);

        data.chapters[data.currentChapter].doc = doc;
        autoSave();
        showFile();
    }
}

var over = null;
function moveWriting(evt) {
    if(isMobile)
        evt = evt.touches[0];

    if (selectedWritingBlock) {
        selectedWritingBlock.style.left = px(evt.pageX + delta[0]);
        selectedWritingBlock.style.top = px(evt.pageY + delta[1]);
        var newOver = document.elementFromPoint(selectedWritingBlock.offsetLeft - 2, selectedWritingBlock.offsetTop);
        if(newOver && newOver.id != "editor-placeholder")
            over = newOver;
        if(over){
            var placeholder = getDOM("#editor-placeholder");
            if(placeholder)
                placeholder.parentElement.removeChild(placeholder);

            placeholder = document.createElement(selectedWritingBlock.tagName);
            placeholder.className = selectedWritingBlock.className;
            placeholder.innerHTML = selectedWritingBlock.innerHTML;
            placeholder.id = "editor-placeholder";
            placeholder.style.visibility = "hidden";
        
            if (placeholder.className == over.className)
                over.insertAdjacentHTML(getInsertPosition(), placeholder.outerHTML);
            else
                over.appendChild(placeholder);
        }
    }
}