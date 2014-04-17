var GDRIVE_CLIENT_ID = "1009723091257-f6t1ssf5cj6l8egkbrjmjdolkk2cqmkh.apps.googleusercontent.com";

function gdriveSignout(){
    gapi.auth.checkSessionState({client_id: GDRIVE_CLIENT_ID}, function(sess){
        if(sess){
            gapi.auth.signOut();
        }
    });
}

function gdrive(thunk, fail, success, doc) {
    if (!thunk) thunk = function () { };
    if (!fail) fail = function () { };
    if (!success) success = function () { };
    if (!window.gapi) fail("Google Drive API not installed.");
    else gdriveAuth(thunk, fail, success, doc, true);
}

function gdriveAuth(thunk, fail, success, doc, immediate) {
    gapi.auth.authorize({
        client_id: GDRIVE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/drive",
        immediate: immediate
    }, gdriveAuthed.bind(window, thunk, fail, success, doc, immediate));
}

function gdriveAuthed(thunk, fail, success, doc, wasImmediate, authResult) {
    if (authResult && !authResult.error){
        gapi.client.load("drive", "v2", function () {
            thunk(fail, success, doc);
        });
        datIt("link", "gdrive");
    }
    else if(wasImmediate)
        gdriveAuth(thunk, fail, success, doc, false);
    else
        fail("Failed to link to Google Drive. Reason: " + (authResult && authResult.error));
}

function gdriveLoad(fail, success){
    gdrive(function (fail, success) {
        gdriveFindFile("justwritedammit.jwd", fail, function (file) {
            if (!file.downloadUrl)
                fail("GDrive error loc #2:" + JSON.stringify(file));
            else{
                var accessToken = gapi.auth.getToken().access_token;
                var xhr = new XMLHttpRequest();
                xhr.open("GET", file.downloadUrl);
                xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
                xhr.onload = function () {
                    parseFileData(xhr.responseText, fail, success);
                };
                xhr.onerror = function () {
                    fail("GDrive error loc #3");
                };
                xhr.send();
            }
        });
    }, fail, success);
}

function gdriveSave(fail, success, doc) {
    saveFileToGDrive("justwritedammit.jwd", "application/json", fail, success, doc);
}

function saveFileToGDrive(filename, contentType, fail, success, doc){
    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    var metadata = {
        title: filename,
        mimeType: contentType
    };

    var base64Data = btoa(doc);

    var multipartRequestBody =
        delimiter +
        "Content-Type: application/json\r\n\r\n" +
        JSON.stringify(metadata) +
        delimiter +
        "Content-Type: " + contentType + "\r\n" +
        "Content-Transfer-Encoding: base64\r\n" +
        "\r\n" +
        base64Data +
        close_delim;

    var doIt = function (file) {
        var path = "/upload/drive/v2/files";
        if (file) path += "/" + file.id;

        var request = gapi.client.request({
            path: path,
            method: file ? "PUT" : "POST",
            params: { uploadType: "multipart" }, // "alt" : "json"
            headers: {
                "Content-Type": "multipart/mixed; boundary=\"" + boundary + "\""
            },
            body: multipartRequestBody
        });
        request.execute(success);
    };

    gdrive(function (fail, success, doc) {
        gdriveFindFile(filename, doIt, doIt);
    }, fail, success, doc);
}


function gdriveFindFile(filename, fail, success) {
    var retrievePageOfFiles = function (request, result) {
        request.execute(function (resp) {
            var test = resp
                && resp.items
                && resp.items.filter(function (item) {
                    return item.title == filename
                        && !(item.labels && item.labels.trashed);
                });
            if (test
                && test.length > 0)
                success(test[0]);
            else {
                var nextPageToken = resp.nextPageToken;
                if (nextPageToken) {
                    request = gapi.client.drive.files.list({
                        pageToken: nextPageToken
                    });
                    retrievePageOfFiles(request, result);
                } else
                    fail();
            }
        });
    }
    var initialRequest = gapi.client.drive.files.list();
    retrievePageOfFiles(initialRequest, []);
}