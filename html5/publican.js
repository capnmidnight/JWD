function exportHTML(){
    var toc = data.chapters.map(function(chapter, i){
        return tr(td(chapter.name),
            td(a({href:"#chapter"+i}, "view")));
    });

    var chapters = data.chapters.map(function(chapter, i){
        return article(
            h2(a({name:"chapter" + i}, chapter.name)),
            chapter.doc
                .replace(/\r\n/g, "\n")
                .replace(/\n{2,}/g, "\n")
                .split(/\n/g).map(function(para){
                return p(para);
            }));
    });

    var doc = html(head(
            title("My Book"),
            meta({charset:"utf8"}),
            style("h2{page-break-before:always;}")),
        body(
            section({id:"table-of-contents"},
                h2("Table of Contents"),
                table(toc)),
            section({id:"main"}, chapters)));
    
    saveFileToDesktop("export.html", "text/html;charset=utf-8", doc.outerHTML);
    rptIt("publish");
}