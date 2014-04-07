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
    var booksTable = dbDataStore.getTable("books");
    var books = booksTable.query();
    doc = books[0].get("chapters");
  }
  parseFileData(doc, fail);
}

function dbSave(fail, doc) {
  if(dbDataStore){
    var booksTable = dbDataStore.getTable("books");
    var books = booksTable.query();
    if (books.length == 0){
      booksTable.insert({
        chapters: doc
      });
    }
    else {
      books[0].set("chapters", doc);
      for (var i = 1; i < books.length; ++i){
        books[i].deleteRecord();
      }
    }
  }
  else if(fail)
    fail();
}
