(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-49938410-1', 'justwritedammit.com');
ga('require', 'linkid', 'linkid.js')
ga('require', 'displayfeatures');

var navIt = ga.bind(window, "send", "pageview");
var evtIt = ga.bind(window, "send", "event");

var usrIt = evtIt.bind(window, "user");
var rptIt = evtIt.bind(window, "report");
var datIt = evtIt.bind(window, "data");
    var savIt = datIt.bind(window, "save");
    var lodIt = datIt.bind(window, "load");