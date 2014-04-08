var dbClient = null,
    dbDataStoreMGR = null,
    dbDataStore = null;

function dorpbox(thunk, fail, success, doc){
    if(!thunk) thunk = function(){};
    if(!fail) fail = function(){};
    if(!success) success = function(){};

    if(!window.Dropbox)
        fail();
    else{
        if(!dbClient)
            dbClient = new Dropbox.Client({key: "g2rnjvo102estt0"});

        dbClient.authenticate({interactive: true}, function (error) {
            if (error)
                fail();
            else{
                if(!dbDataStoreMGR)
                dbDataStoreMGR = dbClient.getDatastoreManager();

                if(!dbDataStore)
                dbDataStoreMGR.openDefaultDatastore(function (error, datastore) {
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
    }
}

function dorpboxLoad(fail, success) {
    dorpbox(function(fail, success){
        var doc = null;
        if (dbDataStore) {
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
        }
        parseFileData(doc, fail, success);
    }, fail, success);
}

function dorpboxSave(fail, success, doc) {
    dorpbox(function(fail, success, doc){
        if(dbDataStore){
            var table = dbDataStore.getTable("jwd");
            var records = table.query();
            if (records.length == 0)
                table.insert({data: doc});
            else {
                records[0].set("data", doc);
                for (var i = 1; i < records.length; ++i)
                    records[i].deleteRecord();
            }
            success();
        }
        else
            fail();
    }, fail, success, doc);
}
