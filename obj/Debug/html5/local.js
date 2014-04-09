function localSave(fail, success, doc){
    if(window.localStorage){
        window.localStorage.setItem("data", doc);
        success();
    }
    else
        fail();
}

function localLoad(fail, success) {
    var data = window.localStorage.getItem("data")
      || window.localStorage.getItem("chapters"); // retain chapters for a while, someone might still have it from an old session
    parseFileData(data, fail, success);
}