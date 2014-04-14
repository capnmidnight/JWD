(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-49938410-1', 'justwritedammit.com');
ga('require', 'displayfeatures');
ga('send', 'pageview');

var conversionLabels = {
    save: "6hMOCNCPuwgQqPnO1QM",
    load: "0EO6CLiSuwgQqPnO1QM",
    saveSnip: "GzTCCKCVuwgQqPnO1QM",
    analysisFreq: "ae9-COCcuwgQqPnO1QM",
    linkDorpbox: "Fk2xCMCRuwgQqPnO1QM",
    linkGDrive: "fnEZCKCkuwgQqPnO1QM",
    mailingList: "gMfZCICouwgQqPnO1QM",
    reset: "jWx5CLCTuwgQqPnO1QM"
};

function goog_snippet_vars(type) {
    var w = window;
    w.google_conversion_id = 984857768;
    w.google_conversion_label = conversionLabels[type];
    w.google_remarketing_only = false;
}

function goog_report_conversion(type, url) {
    goog_snippet_vars(type);
    window.google_conversion_format = "3";
    window.google_is_call = true;
    var opt = new Object();
    opt.onload_callback = function() {
        if(typeof(url) != "undefined")
            document.location = url;
    };
    var conv_handler = window['google_trackConversion'];
    if (typeof(conv_handler) == 'function') {
        conv_handler(opt);
    }
}