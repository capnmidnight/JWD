var dbClient = null,
    dbDataStoreMGR = null,
    dbDataStore = null;

function dbSetup(){
    if(window.Dropbox){
      dbClient = new Dropbox.Client({key: "g2rnjvo102estt0"});

      dbClient.authenticate({interactive: false}, function (error) {
          if (error)
              alert('Authentication error: ' + error);
      });

      if (dbClient.isAuthenticated())
          dbDataStoreMGR = dbClient.getDatastoreManager();
    }
}

function withDB(thunk) {
    if (dbClient) {
        dbClient.authenticate();
        if (dbDataStoreMGR) {
            if (dbDataStore)
                thunk();
            else
                dbDataStoreMGR.openDefaultDatastore(function (error, datastore) {
                    if (error)
                        alert('Error opening default datastore: ' + error);
                    else {
                        dbDataStore = datastore;
                        thunk();
                    }
                });
        }
    }
    else
        thunk();
}

function dbLoad() {
    var doc = null;
    if (dbDataStore) {
        var booksTable = dbDataStore.getTable("books");
        var books = booksTable.query();
        doc = books[0].get("chapters");
    }
    parseFileData(doc);
}

function dbSave() {
    var doc = JSON.stringify(chapters);
    var booksTable = dbDataStore.getTable("books");
    var books = booksTable.query();
    if (books.length == 0)
        booksTable.insert({
            chapters: doc
        });
    else {
        books[0].set("chapters", doc);
        for (var i = 1; i < books.length; ++i)
            books[i].deleteRecord();
    }
}
