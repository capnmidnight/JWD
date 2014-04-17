var currentSnippet = 0;

function saveSnippets(){
    if(saveSnippets.timeout)
        clearTimeout(saveSnippets.timeout);
    saveSnippets.timeout = setTimeout(function(){
        data.snippets.push(snippetsEditor.getValue());
        msg("snippet-note", "snippet saved!", 0, 1000);
        saveFile();
        currentSnippet = data.snippets.length;
        updateSnippetCount();
        showSnippet();
        savIt("snip", data.snippets.length);
    }, 2000);
}

function updateSnippetCount(){
    var val = "(new snippet)";
    if(0 <= currentSnippet && currentSnippet < data.snippets.length)
        val = currentSnippet + 1;
    snippetCounts.setValue(fmt("$1 of $2", val, data.snippets.length));
}

function nextSnippet(){
    currentSnippet = (currentSnippet + 1) % (data.snippets.length + 1);
    showSnippet();
}

function prevSnippet(){
    currentSnippet = (currentSnippet + data.snippets.length) % (data.snippets.length + 1);
    showSnippet();
}

function showSnippet(){
    var val = "";
    if(0 <= currentSnippet && currentSnippet < data.snippets.length)
        val = data.snippets[currentSnippet];
    snippetsEditor.setValue(val);
    navIt("snippet");
    updateSnippetCount();
}