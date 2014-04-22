function exportBody() {
    if (!data)
        return null;

    var toc = table(data.chapters.map(function (chapter, i) {
        return tr(td(chapter.name),
            td(a({ href: "#chapter" + i }, "view")));
    }));

    toc.style.width = "100%";

    var chapters = data.chapters.map(function (chapter, i) {
        return article(
            h2(a({ name: "chapter" + i },
                chapter.name + " ",
                small(a({ href: "#TOC" }, "(top)")))),
            chapter.doc
                .replace(/\r\n/g, "\n")
                .replace(/\n{2,}/g, "\n")
                .split(/\n/g).map(function (para) {
                    return p(para);
                }));
    });

    return [div({ id: "table-of-contents" },
        h2(a({ name: "TOC" }, "Table of Contents")),
        toc),
        div({ id: "chapters" }, chapters)];
}

function exportHTML() {
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
    var zip = new JSZip();
    zip.file("index.html", doc.outerHTML);
    //var img = zip.folder("images");
    //img.file("smile.gif", imgData, { base64: true });
    saveFileToDesktop("export.zip", "application/zip", zip.generate());
    rptIt("publish");
}