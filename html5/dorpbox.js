var dbClient = null,
    dbDataStoreMGR = null,
    dbDataStore = null;

function dorpboxSignout(){
    if (dbClient){
        if (dbDataStore){
            ["jwd", "books"].forEach(function (tableName){
                var table = dbDataStore.getTable(tableName);
                var records = table.query();
                for (var i = 0; i < records.length; ++i)
                    records[i].deleteRecord();
            });
        }
        dbClient.signOut();
    }
}

function dorpbox(thunk, fail, success, doc){
    if (!thunk){
        thunk = function (){ };
    }
    if (!fail){
        fail = function (){ };
    }
    if (!success){
        success = function (){ };
    }
    else{
        include("https://www.dropbox.com/static/api/dropbox-datastores-1.0-latest.js", function (){
            if (!window.Dropbox){
                fail("Dropbox SDK not found");
            }
            else{
                if (!dbClient){
                    dbClient = new Dropbox.Client({ key: "g2rnjvo102estt0" });
                }
                dorpboxAuth(thunk, fail, success, doc, dbClient.isAuthenticated());
            }
        }, fail);
    }
}

function dorpboxAuth(thunk, fail, success, doc, immediate){
    try {
        dbClient.authenticate(
            { interactive: !immediate },
            dorpboxAuthed.bind(window, thunk, fail, success, doc, immediate));
    }
    catch (error){
        dorpboxAuthed(thunk, fail, success, doc, immediate, error);
    }
}

function dorpboxAuthed(thunk, fail, success, doc, wasImmediate, error){
    if (!error){
        thunk(fail, success, doc);
        datIt("link", "dorpbox");
    }
    else if (wasImmediate){
        dorpboxAuth(thunk, fail, success, doc, false);
    }
    else{
        fail("Failed to link to Dropbox. Reason: " + error);
    }
}

function dorpboxLoad(fail, success){
    dorpbox(function (fail, success){
        dbClient.readFile("justwritedammit.jwd",
            { binary: true },
            function (err, doc, stat, rangeInfo){
                if (!err){
                    parseFileData(doc, fail, success);
                }
                else{
                    var thunk = function (fail, success, doc){
                        var table = dbDataStore.getTable("jwd");
                        var records = table.query();
                        var fieldName = "data";
                        if (records.length == 0){
                            table = dbDataStore.getTable("books");
                            records = table.query();
                            fieldName = "chapters";
                        }
                        if (records.length > 0){
                            doc = records[0].get(fieldName);
                        }
                        parseFileData(doc, fail, success);
                    };

                    if (!dbDataStore){
                        dbClient
                            .getDatastoreManager()
                            .openDefaultDatastore(function (error, datastore){
                                if (error){
                                    fail("Dropbox error loc #2: " + error);
                                }
                                else{
                                    dbDataStore = datastore;
                                    thunk(fail, success, doc);
                                }
                            });
                    }
                    else{
                        thunk(fail, success, doc);
                    }
                }
            });
    }, fail, success);
}

function dorpboxSave(fail, success, doc){
    saveFileToDropbox("justwritedammit.jwd", doc, success, fail);
}

function saveFileToDropbox(filename, data, success, fail){
    dorpbox(function (fail, success, data){
        if (!dbClient){
            fail("Dropbox setup broken, no Client object");
        }
        else{
            dbClient.writeFile(
                filename,
                data,
                function (err, stat){
                    if (err){
                        fail("Dropbox error loc #3: " + err);
                    }
                    else{
                        success();
                    }
                });
        }
    }, fail, success, data);
}
