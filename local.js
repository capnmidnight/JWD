function localSave(fail, success, doc){
    if(window.localStorage){
        window.localStorage.setItem("data", doc);
        success();
    }
    else
        fail("Browser doesn't support local storage.");
}

function localLoad(fail, success){
    // retain chapters for a while, someone might still have it from an old session
    var data = window.localStorage.getItem("data")
      || window.localStorage.getItem("chapters"); 
    parseFileData(data, fail, success);
}