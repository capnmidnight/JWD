var editor = null,
    notes = null,
    wordCount = null,
    clock = null;

function msg(id, msg, showms, lenms){
    var box = aside(
        {id:id},
        a({href:"javascript:hide(\"" + id + "\")"}, "[X]"),
        msg);
    setTimeout(document.body.appendChild.bind(document.body), showms, box);
    setTimeout(document.body.removeChild.bind(document.body), showms + lenms, box);
}

function resize(){
    if(window.fullScreen)
        hide("fullscreen-note");
    var w1 = window.innerWidth;
    var h = window.innerHeight;
    var l1 = w1 * 0.05;
    w1 -= l1 * 2;
    var w2 = 200;
    w1 -= w2;
    var l2 = l1 + w1;
    var t = h * 0.15;
    h -= t * 2;
    move(editor, l1, t, w1, h);
    move(notes, l2, t, w2, h);
    move(wordCount, l1, t + h);
    move(clock, l1, t + h + 24);
}

function countWords(){
    var count = editor.textContent.match(/\w+/g).length;
    var msg = fmt("TOTAL WORDS: $1, ADD'L WORDS: $1", count);
    wordCount.textContent = msg;
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

function pageLoad(){
    editor = getDOM("editor");
    notes = getDOM("notes");
    wordCount = getDOM("word-count");
    clock = getDOM("clock");

    editor.addEventListener("keyup", interrobang, false);
    editor.addEventListener("keyup", countWords, false);
    window.addEventListener("resize", resize, false);
    setInterval(clockTick, 500);

    resize();
    countWords();
    clockTick();

    msg("welcome-note", "Welcome to Just Write, Dammit! The Zen-writing program.", 1000, 3000);
    if(!window.fullScreen)
        msg("fullscreen-note", "Consider running in full-screen by hitting F11 on your keyboard.", 2000, 3000);
}