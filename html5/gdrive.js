var GDRIVE_CLIENT_ID = "1009723091257-f6t1ssf5cj6l8egkbrjmjdolkk2cqmkh.apps.googleusercontent.com";

function gdriveSignout(){
    gapi.auth.checkSessionState({client_id: GDRIVE_CLIENT_ID}, function(sess){
        if(sess){
            gapi.auth.signOut();
        }
    });
}

function gdrive(thunk, fail, success, doc){
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
        include("https://apis.google.com/js/client.js", function(){
            setTimeout(function(){
                if (!window.gapi || !gapi.auth){
                    fail("Google Drive API not installed.");}
                else{
                    gdriveAuth(thunk, fail, success, doc, true);
                }
            }, 250);
        }, fail);
    }
}

function gdriveAuth(thunk, fail, success, doc, immediate){
    gapi.auth.authorize({
        client_id: GDRIVE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/drive",
        immediate: immediate
    }, gdriveAuthed.bind(window, thunk, fail, success, doc, immediate));
}

function gdriveAuthed(thunk, fail, success, doc, wasImmediate, authResult){
    if (authResult && !authResult.error){
        gapi.client.load("drive", "v2", function (){
            thunk(fail, success, doc);
        });
        ga("send", "event", "link", "gdrive");
    }
    else if(wasImmediate){
        gdriveAuth(thunk, fail, success, doc, false);
    }
    else{
        fail("Failed to link to Google Drive. Reason: " + (authResult && authResult.error));
    }
}

function gdriveLoad(fail, success){
    gdriveFindFile("justwritedammit.jwd", fail, function (file){
        if (!file.downloadUrl){
            fail("GDrive error loc #2:" + JSON.stringify(file));
        }
        else{
            var accessToken = gapi.auth.getToken().access_token;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", file.downloadUrl);
            xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
            xhr.onload = function (){
                parseFileData(unescape(xhr.responseText), fail, success);
            };
            xhr.onerror = function (){
                fail("GDrive error loc #3");
            };
            xhr.send();
        }
    });
}

function gdriveSave(fail, success, doc){
    saveFileToGDrive("justwritedammit.jwd", "application/json", fail, success, escape(doc));
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

    var doIt = function (file){
        var path = "/upload/drive/v2/files";
        if (file){
            path += "/" + file.id;
        }

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

    gdriveFindFile(filename, doIt, doIt);
}

function gdriveFindFile(filename, fail, success){
    gdriveFilterFiles(function(doc){
        return doc.title == filename
            && !(doc.labels && doc.labels.trashed);
    }, fail, function(arr){
        success(arr[0]);
    });
}

function gdriveFilterFiles(filter, fail, success){
    gdrive(function(){
        var retrievePageOfFiles = function (request, output){
            request.execute(function (resp){
                output = output.concat((resp
                        && resp.items
                        && resp.items.filter(filter))
                    || []);
                var nextPageToken = resp.nextPageToken;
                if (nextPageToken){
                    request = gapi.client.drive.files.list({
                        pageToken: nextPageToken
                    });
                    retrievePageOfFiles(request, output);
                }else{
                    success(output);
                }
            });
        }
        var initialRequest = gapi.client.drive.files.list();
        retrievePageOfFiles(initialRequest, []);
    }, success, fail);
}

function gdriveListFiles(outputID){
    var list = getDOM("#" + outputID);
    gdriveFilterFiles(
        function(doc){ 
            return doc
                && doc.labels
                && !doc.labels.trashed
                && doc.exportLinks
                && doc.exportLinks["text/plain"]
                && doc.kind == "drive#file"
                && doc.mimeType == "application/vnd.google-apps.document"; 
        },
        function(err){
            console.error("Failed to load files", err);
        }, 
        function(arr){
            arr.map(function(doc){
                return li(a({
                    href:fmt("javascript:gdriveImportFile(\"$1\", \"$2\");", 
                        doc.title, doc.exportLinks["text/plain"])}, 
                    doc.title));
            }).forEach(function(l){
                list.appendChild(l);
            });
        });
}

function gdriveImportFile(title, link)
{
    var accessToken = gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", link);
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
    xhr.onload = function (){
        var chapter = {
            name: title,
            doc: xhr.responseText
        };
        data.chapters.push(chapter);
        data.currentChapter = data.chapters.length - 1;
        showFile();
        countWords();
        showTab(["main", "write"], true);
    };
    xhr.onerror = function (){
        fail(fmt("Failed to load file $1 from GDrive", title));
    };
    xhr.send();
}