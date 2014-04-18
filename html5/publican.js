function exportBody(){
    if(!data)
        return null;

    var toc = table(data.chapters.map(function(chapter, i){
        return tr(td(chapter.name),
            td(a({href:"#chapter"+i}, "view")));
    }));

    toc.style.width = "100%";

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

    return [div({id:"table-of-contents"},
                h2("Table of Contents"),
                toc),
            div({id:"main"}, chapters)];
}

function exportHTML(){
    var doc = html(head(
            title("My Book"),
            meta({charset:"utf8"}),
            style("h2{page-break-before:always;}")),
        body.apply(window, exportBody()));
    
    saveFileToDesktop("export.html", "text/html;charset=utf-8", doc.outerHTML);
    rptIt("publish");
}