var millisPerDay = 1000 * 60 * 60 * 24;

function checkProgress(){
    var dayIndex = Math.floor(Date.now() / millisPerDay),
        previous = data.chapters.sum("lastCount"),
        current = data.chapters.sum("currentCount"),
        newWords = current - previous,
        progressMarked = false;

    if(data.progress && !data.progress[dayIndex - 1]){
        var max = 0;
        for(var dayIndex in data.progress){
            if(dayIndex > max){
                max = dayIndex;
            }
        }
        var lastDate = new Date(max * millisPerDay);
        msg("chain-broken", 
            fmt("Oh no! You haven't logged in since $1/$02/$03 and have broken the progress chain.", 
                lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()), 0, forever);
        delete data.progress;
    }
    
    if(!data.progress){
        data.progress = {};
    }

    if(newWords > 150){
        data.progress[dayIndex] = {
            start: previous,
            end: current
        };
    }
    
    theChain.innerHTML = "Don't break the chain! Use JWD consecutive days in a row.<br>";
    for(var dayIndex in data.progress){
        progressMarked = true;
        theChain.innerHTML += "O ";
    }
    if(!progressMarked){
        theChain.innerHTML += "&lt;No progress yet. Write at least 150 words.&gt;";
    }
}