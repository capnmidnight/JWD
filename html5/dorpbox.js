var dbClient = null,
    dbDataStoreMGR = null,
    dbDataStore = null;

function dbSetup(){
    withDB(function () { }, function () { });
}

function withDB(thunk, fail, doc){
  if(!window.Dropbox)
    fail();
  else{
    if(!dbClient)
      dbClient = new Dropbox.Client({key: "g2rnjvo102estt0"});

    dbClient.authenticate({interactive: true}, function (error) {
      if (error){
        fail();
      }
      else{
        if(!dbDataStoreMGR)
          dbDataStoreMGR = dbClient.getDatastoreManager();

        if(!dbDataStore)
          dbDataStoreMGR.openDefaultDatastore(function (error, datastore) {
              if (error){
                fail();
              }
              else {
                dbDataStore = datastore;
                thunk(fail, doc);
              }
          });
        else{
          thunk(fail, doc);
        }
      }
    });
  }
}

function dbLoad(fail) {
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
  parseFileData(doc, fail);
}

function dbSave(fail, doc) {
  if(dbDataStore){
    var table = dbDataStore.getTable("jwd");
    var records = booksTable.query();
    if (records.length == 0)
      table.insert({data: doc});
    else {
      records[0].set("data", doc);
      for (var i = 1; i < records.length; ++i){
        records[i].deleteRecord();
      }
    }
  }
  else if(fail)
    fail();
}
