function exportBody(){
    if (!data){
        return null;
    }

    var toc = table(data.chapters.map(function (chapter, i){
        return tr(td(chapter.name),
            td(a({ href: "#chapter" + i }, "view")));
    }));

    toc.style.width = "100%";

    var chapters = data.chapters.map(function (chapter, i){
        return article(
            h2(a({ name: "chapter" + i },
                chapter.name + " ",
                small(a({ href: "#TOC" }, "(top)")))),
            chapter.doc
                .replace(/\r\n/g, "\n")
                .replace(/\n{2,}/g, "\n")
                .split(/\n/g).map(function (para){
                    return p(para);
                }));
    });

    return [div({ id: "table-of-contents" },
        h2(a({ name: "TOC" }, "Table of Contents")),
        toc),
        div({ id: "chapters" }, chapters)];
}

function exportHTML(){
    var doc = html(head(
        title("My Book"),
        meta({ charset: "utf8" }),
        style(
            ["@page {margin-top: 3cm;margin-bottom:3cm;}",
                "@page :left {margin-left: 4cm; margin-right: 3cm;}",
                "@page :left :header {content:\"pp. \" decimal(pageno), ,;}",
                "@page :left :footer {content:\"pp. \" decimal(pageno), first(chapter),;}",
                "@page :right {margin-left: 3cm;margin-right: 4cm;}",
                "@page :right :header {content:, , \"pp. \" decimal(pageno);}",
                "@page :right :footer {content:, first(chapter), \"pp. \" decimal(pageno);}",
                "article{page-break-before:always;}",
                "h2{running-head:chapter;}",
                "p{text-align:justify}"].join("\n"))),
        body(exportBody()));
    saveFileToDesktop("book.html", "text/html", utf8_to_b64(doc.outerHTML));
    ga('send', 'event', 'report', "publish");
}

function exportEPUB(){
    data.title = pubTitle.getValue();
    data.authorFirstName = pubAuthFirstName.getValue();
    data.authorLastName = pubAuthLastName.getValue();
    saveFile();
    if(data.title && data.authorFirstName && data.authorLastName){
        ePub();
        ga('send', 'event', 'report', "publish");
    }
    else{
        var message = "Before generating a publishable document, please enter a value the following fields:<ul>";
        
        if(!data.title){
            message += "<li>Title</li>";
        }
        if(!data.authorFirstName){
            message += "<li>Author (first name)</li>";
        }
        if(!data.authorLastName){
            message += "<li>Author (last name)</li>";
        }

        message += "</ul>";

        msg("publish-error-message", message, 0, forever);
    }
}

function ePub(){
    var styleFileName = "style";
    var navFileName = "epub3toc";
    var ncxFileName = "epub2toc";
    var fileName = data.title.replace(/ /g, "-");
    var zip = new JSZip();
    zip.file("mimetype", "application/epub+zip");
    zip.file(styleFileName + ".css", "body{}");
    zip.file(fileName + ".opf", ePubPackageDoc("pubid", guid(), "en", navFileName, ncxFileName, styleFileName));
    zip.file(navFileName + ".xhtml", ePubNavigationDoc(styleFileName, navFileName));
    zip.file(ncxFileName + ".ncx", ePub2NCX(guid(), navFileName));
    data.chapters.forEach(function(chapter, i){
        var name = chapter.name.replace(/ /g, "-");
        zip.file(fmt("chapter$1.xhtml", i + 1), ePubContentDoc(styleFileName, chapter));
    });

    var metainf = zip.folder("META-INF");
    metainf.file("container.xml", ePubContainer(fileName));
    if(window.Blob){
        console.log("saving as blob");
        saveAs(zip.generate({type:"blob"}), fileName + ".epub");
    }
    else{
        saveFileToDesktop(fileName + ".epub", "application/epub+zip", zip.generate({type:"base64"}));
    }
}

function ePubNavigationDoc(styleFileName, navFileName){
    var chaptersChunk = data.chapters.map(function(chapter, i){
        return fmt("<li id=\"chapter$1\"><a href=\"chapter$1.xhtml\">$2</a></li>", i + 1, chapter.name);
    }).join("\n\t\t\t\t");

    return fmt("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
+"<!DOCTYPE html>\n"
+"<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:epub=\"http://www.idpf.org/2007/ops\" xml:lang=\"en\" lang=\"en\">\n"
+"\t<head>\n"
+"\t\t<meta charset=\"utf-8\" />\n"
+"\t\t<title>$1</title>\n"
+"\t\t<link rel=\"stylesheet\" href=\"$2.css\" type=\"text/css\"/>\n"
+"\t</head>\n"
+"\t<body>\n"
+"\t\t<h1>$1</h1>\n"
+"\t\t<nav id=\"toc\" epub:type=\"toc\">\n"
+"\t\t\t<h2>Table of Contents</h2>\n"
+"\t\t\t<ol>\n"
+"\t\t\t\t<li id=\"toc\"><a href=\"$3.xhtml\">Table of Contents</a></li>\n"
+"\t\t\t\t$4\n"
+"\t\t\t</ol>\n"
+"\t\t</nav>\n"
+"\t</body>\n"
+"</html>", data.title, styleFileName, navFileName, chaptersChunk);
}

function ePub2NCX(ncxUID, navFileName){
    var chaptersChunk = data.chapters.map(function(chapter, i){
        return fmt("<navPoint class=\"h1\" id=\"ncx-$1\"><navLabel><text>$2</text></navLabel><content src=\"chapter$1.xhtml\"/></navPoint>", i + 1, chapter.name);
    }).join("\n\t\t");

    return fmt("<ncx xmlns=\"http://www.daisy.org/z3986/2005/ncx/\" version=\"2005-1\" xml:lang=\"en\">\n"
+"\t<head><meta name=\"dtb:uid\" content=\"urn:uuid:$1\"/></head>\n"
+"\t<docTitle><text>$2</text></docTitle>\n"
+"\t<docAuthor><text>$3 $4</text></docAuthor>\n"
+"\t<navMap>\n"
+"\t\t<navPoint class=\"h1\" id=\"ncx-toc\"><navLabel><text>Table of Contents</text></navLabel><content src=\"$5.xhtml\"/></navPoint>\n"
+"\t\t$6\n"
+"\t</navMap>\n"
+"</ncx>",
        ncxUID, data.title, data.authorFirstName, data.authorLastName, navFileName, chaptersChunk);
}

function ePubContentDoc(styleFileName, chapter){
    var chapterBody = chapter.doc
        .replace(/\r\n/g, "\n")
        .replace(/\n{2,}/g, "\n")
        .split(/\n/g).map(function (para){
            return p(para).outerHTML;
        })
        .join("\n\t\t\t");

    return fmt("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
+"<!DOCTYPE html>\n"
+"<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:epub=\"http://www.idpf.org/2007/ops\" xml:lang=\"en\" lang=\"en\">\n"
+"\t<head>\n"
+"\t\t<meta charset=\"utf-8\" />\n"
+"\t\t<title>$1: $2</title>\n"
+"\t\t<link rel=\"stylesheet\" href=\"$3.css\" type=\"text/css\"/>\n"
+"\t</head>\n"
+"\t<body>\n"
+"\t\t<section epub:type=\"chapter\">\n"
+"\t\t\t<h1 epub:type=\"title\">$2</h1>\n"
+"\t\t\t$4\n"
+"\t\t</section>\n"
+"\t</body>\n"
+"</html>", 
        data.title, chapter.name, styleFileName, chapterBody);
}

function ePubPackageDoc(pubID, uuid, lang, navFileName, ncxFileName, styleFileName){
    var now = new Date();

    var chapters = data.chapters.map(function(chapter, i){
        return {
            item: fmt("<item id=\"chapter$1\" href=\"chapter$1.xhtml\" media-type=\"application/xhtml+xml\"/>", i + 1),
            itemref: fmt("<itemref idref=\"chapter$1\" />", i + 1)
        };
    });

    var manifestChapters = chapters.map(function(c){
        return c.item;
    }).join("\n\t\t");

    var spineChapters = chapters.map(function(c){
        return c.itemref;
    }).join("\n\t\t");

    return fmt("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
+"<package version=\"3.0\" unique-identifier=\"$1\" xml:lang=\"en\" xmlns=\"http://www.idpf.org/2007/opf\" >\n"
+"\t<metadata xmlns:dc=\"http://purl.org/dc/elements/1.1/\">\n"
+"\t\t<dc:identifier id=\"$1\">urn:uuid:$2</dc:identifier>\n"
+"\t\t<dc:title>$3</dc:title>\n"
+"\t\t<dc:language>$4</dc:language>\n"
+"\t\t<meta property=\"dcterms:modified\">$5</meta>\n"
+"\t\t<dc:creator id=\"creator01\">$6 $7</dc:creator>\n"
+"\t\t<meta refines=\"#creator01\" property=\"file-as\">$7, $6</meta>\n"
+"\t\t<meta refines=\"#creator01\" property=\"display-seq\">1</meta>\n"
+"\t\t<meta refines=\"#creator01\" property=\"role\" scheme=\"marc:relators\">aut</meta>\n"
+"\t\t<dc:date>$5</dc:date>\n"
+"\t\t<dc:rights>Copyright © $8 $6 $7</dc:rights>\n"
+"\t</metadata>\n"
+"\t<manifest>\n"
+"\t\t<item id=\"epub3nav\" properties=\"nav\" href=\"$9.xhtml\" media-type=\"application/xhtml+xml\"/>\n"
+"\t\t<item id=\"epub2nav\" href=\"$10.ncx\" media-type=\"application/x-dtbncx+xml\"/>\n"
+"\t\t<item id=\"main-style-sheet\" href=\"$11.css\" media-type=\"text/css\"/>\n"
+"\t\t$12\n"
+"\t</manifest>\n"
+"\t<spine toc=\"epub2nav\">\n"
+"\t\t<itemref idref=\"epub3nav\" />\n"
+"\t\t$13\n"
+"\t</spine>\n"
+"</package>", 
        pubID, uuid, data.title, lang, now.toISOString(), data.authorFirstName, data.authorLastName, now.getFullYear(), navFileName, ncxFileName, styleFileName, manifestChapters, spineChapters);
}

function guid(){
   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
       var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
       return v.toString(16);
   });
}

function ePubContainer(pubName){
    return fmt("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
+"<container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">\n"
+"\t<rootfiles>\n"
+"\t\t<rootfile full-path=\"$1.opf\" media-type=\"application/oebps-package+xml\" />\n"
+"\t</rootfiles>\n"
+"</container>\n", 
        pubName);
}