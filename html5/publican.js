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
    rptIt("publish");
}

function exportEPUB(){
    data.title = pubTitle.getValue();
    data.authorFirstName = pubAuthFirstName.getValue();
    data.authorLastName = pubAuthLastName.getValue();
    saveFile();
    if(data.title && data.authorFirstName && data.authorLastName){
        ePub();
        rptIt("publish");
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
    var navFileName = "nav";
    var fileName = data.title.replace(/ /g, "-");
    var zip = new JSZip();
    zip.file("mimetype", "application/epub+zip");
    zip.file(styleFileName + ".css", "body{}");
    zip.file(fileName + ".opf", ePubPackageDoc("pubid", guid(), "en", navFileName, styleFileName));
    zip.file(navFileName + ".xhtml", ePubNavigationDoc(styleFileName));
    data.chapters.forEach(function(chapter, i){
        var name = chapter.name.replace(/ /g, "-");
        zip.file(fmt("chapter$1.xhtml", i + 1), ePubContentDoc(styleFileName, chapter));
    });

    var metainf = zip.folder("META-INF");
    metainf.file("container.xml", ePubContainer(fileName));

    saveFileToDesktop(fileName + ".epub", "application/rpub+zip", zip.generate());
}

function ePubContentDoc(styleFileName, chapter){
    var chapterBody = chapter.doc
        .replace(/\r\n/g, "\n")
        .replace(/\n{2,}/g, "\n")
        .split(/\n/g).map(function (para){
            return p(para).outerHTML;
        })
        .join("\n");

    return fmt("<?xml version=\"1.0\" encoding=\"UTF-8\"?><!DOCTYPE html>\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:epub=\"http://www.idpf.org/2007/ops\" xml:lang=\"en\" lang=\"en\"><head><meta charset=\"utf-8\" /><title>$1: $2</title><link rel=\"stylesheet\" href=\"$3.css\" type=\"text/css\"/></head>\n<body><section epub:type=\"chapter\"><h1 epub:type=\"title\">$2</h1>$4</section></body></html>", data.title, chapter.name, styleFileName, chapterBody);
}

function ePubNavigationDoc(styleFileName){
    var chaptersChunk = data.chapters.map(function(chapter, i){
        return fmt("<li id=\"chapter$1\"><a href=\"chapter$1.xhtml\">$2</a></li>", i + 1, chapter.name);
    }).join("\n");

    return fmt("<?xml version=\"1.0\" encoding=\"UTF-8\"?><!DOCTYPE html>\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:epub=\"http://www.idpf.org/2007/ops\" xml:lang=\"en\" lang=\"en\">\n<head><meta charset=\"utf-8\" /><title>$1</title><link rel=\"stylesheet\" href=\"$2.css\" type=\"text/css\"/></head>\n<body><h1>$1</h1><nav id=\"toc\" epub:type=\"toc\"><h2>Table of Contents</h2><ol>$3</ol></nav>\n</body></html>", data.title, styleFileName, chaptersChunk);
}

function ePubPackageDoc(pubID, uuid, lang, navFileName, styleFileName){
    var now = new Date();

    var chapters = data.chapters.map(function(chapter, i){
        return {
            item: fmt("<item id=\"chapter$1\" href=\"chapter$1.xhtml\" media-type=\"application/xhtml+xml\"/>", i + 1),
            itemref: fmt("<itemref idref=\"chapter$1\" />", i + 1)
        };
    });

    var manifestChapters = chapters.map(function(c){
        return c.item;
    }).join("\n");

    var spineChapters = chapters.map(function(c){
        return c.itemref;
    }).join("\n");

    return fmt("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<package version=\"3.0\" unique-identifier=\"$1\" xml:lang=\"en\" xmlns=\"http://www.idpf.org/2007/opf\" ><metadata xmlns:dc=\"http://purl.org/dc/elements/1.1/\"><dc:identifier id=\"$1\">urn:uuid:$2</dc:identifier><dc:title>$3</dc:title><dc:language>$4</dc:language><meta property=\"dcterms:modified\">$5</meta><dc:creator id=\"creator01\">$6 $7</dc:creator><meta refines=\"#creator01\" property=\"file-as\">$7, $6</meta><meta refines=\"#creator01\" property=\"display-seq\">1</meta><meta refines=\"#creator01\" property=\"role\" scheme=\"marc:relators\">aut</meta><dc:date>$5</dc:date><dc:rights>Copyright © $8 $6 $7</dc:rights></metadata><manifest><item id=\"nav-id-1\" properties=\"nav\" href=\"$9.xhtml\" media-type=\"application/xhtml+xml\"/><item id=\"main-style-sheet\" href=\"$10.css\" media-type=\"text/css\"/>$11</manifest><spine toc=\"nav-id-1\">$12</spine></package>", pubID, uuid, data.title, lang, now.toISOString(), data.authorFirstName, data.authorLastName, now.getFullYear(), navFileName,
            styleFileName, manifestChapters, spineChapters);
}

function guid(){
   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
       var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
       return v.toString(16);
   });
}

function ePubContainer(pubName){
    return fmt("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">\n<rootfiles>\n<rootfile full-path=\"$1.opf\" media-type=\"application/oebps-package+xml\" />\n</rootfiles>\n</container>", pubName);
}