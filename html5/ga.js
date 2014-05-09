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