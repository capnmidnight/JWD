var dbClient = null,
    dbDataStoreMGR = null,
    dbDataStore = null;

function dorpbox(thunk, fail, success, doc){
    if(!thunk) thunk = function(){};
    if(!fail) fail = function(){};
    if(!success) success = function(){};
    if(!window.Dropbox) fail();
    else{
        if(!dbClient) dbClient = new Dropbox.Client({key: "g2rnjvo102estt0"});
        dbClient.authenticate({interactive: true},
        function (error) {
            if (error) fail();
            else       thunk(fail, success, doc);
        });
    }
}

function dorpboxLoad(fail, success) {
    dorpbox(function(fail, success){
        dbClient.readFile("justwritedammit.jwd",
        {binary:true},
        function(err, doc, stat, rangeInfo){
            if(!err)
                parseFileData(decodeURIComponent(doc), fail, success);
            else{
                var thunk = function(fail, success, doc){
                    var table = dbDataStore.getTable("jwd");
                    var records = table.query();
                    var fieldName = "data";
                    if(records.length == 0){
                        table = dbDataStore.getTable("books");
                        records = table.query();
                        fieldName = "chapters";
                    }
                    if(records.length > 0)
                        doc = records[0].get(fieldName);
                    parseFileData(doc, fail, success);
                };

                if(!dbDataStore)
                    dbClient
                    .getDatastoreManager()
                    .openDefaultDatastore(function (error, datastore) {
                        if (error)
                            fail();
                        else {
                            dbDataStore = datastore;
                            thunk(fail, success, doc);
                        }
                    });
                else
                    thunk(fail, success, doc);
            }
        });
    }, fail, success);
}

function dorpboxSave(fail, success, doc) {
    saveFileToDropbox("justwritedammit.jwd", doc, success, fail);
}

function saveFileToDropbox(filename, data, success, fail){
    dorpbox(function(fail, success, data){
        if(!dbClient)
            fail();
        else
            dbClient.writeFile(
                filename,
                encodeURIComponent(data),
                function(err, stat){
                    if(err) fail();
                    else    success();
                });
    }, fail, success, data);
}
