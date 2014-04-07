var dbClient = null,
    dbDataStoreMGR = null,
    dbDataStore = null;

function dbSetup(){
  print("db setup");
  withDB(print.bind(console, "dropbox setup"),
         print.bind(console, "dropbox failed"));
}

function withDB(thunk, fail, doc){
  print("dorpbox");
  if(!window.Dropbox)
    fail();
  else{
    if(!dbClient)
      dbClient = new Dropbox.Client({key: "g2rnjvo102estt0"});

    print("authenticate dropbox");
    dbClient.authenticate({interactive: false}, function (error) {
      print("authenticated:", !error);
      if (error){
        print("dropbox authentication error:", error);
        fail();
      }
      else{
        if(!dbDataStoreMGR)
          dbDataStoreMGR = dbClient.getDatastoreManager();

        if(!dbDataStore)
          dbDataStoreMGR.openDefaultDatastore(function (error, datastore) {
              if (error){
                print("Error opening default datastore:", error);
                fail();
              }
              else {
                dbDataStore = datastore;
                print("exec callback", thunk, fail);
                thunk(fail, doc);
              }
          });
        else{
          print("exec", thunk, fail);
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
    print("getting table");
    var booksTable = dbDataStore.getTable("books");
    print("querying table");
    var books = booksTable.query();
    if (books.length == 0){
      print("inserting new record");
      booksTable.insert({
        chapters: doc
      });
    }
    else {
      print("overwriting old record");
      books[0].set("chapters", doc);
      for (var i = 1; i < books.length; ++i){
        print("deleting extraneous record", i);
        books[i].deleteRecord();
      }
    }
  }
  else if(fail)
    fail();
}
