﻿var millisPerDay = 1000 * 60 * 60 * 24;

function checkProgress(){
    var dayIndex = Math.floor(Date.now() / millisPerDay),
        previous = data.chapters.sum("lastCount"),
        current = data.chapters.sum("currentCount"),
        newWords = current - previous,
        progressMarked = false;
    if(data.progress){
        var days = [];
        for(var day in data.progress){
            if(day * 1 == day){
                days.push(day);
            }
        }
        days = days.sort();
        var lastDay = days[days.length - 1];
        if(dayIndex - lastDay > 1){
            var lastDate = new Date(lastDay * millisPerDay + 1000);
            msg("chain-broken", fmt("Oh no! You haven't logged in since $1 and have broken the progress chain.", lastDate.toDateString()), 0, forever);
            delete data.progress;
            saveFile();
        }
    }
    
    if(!data.progress){
        data.progress = {};
    }

    if(newWords > 150){
        if(!data.progress[dayIndex]){
            msg("chain-maintained", fmt("Congratulations! You've met you're writing quota for the day. $1 words today. Keep writing!",  newWords), 0, forever);
        }
        data.progress[dayIndex] = {
            start: previous,
            end: current
        };
        saveFile();
    }
    
    theChain.innerHTML = "Don't break the chain! Use JWD consecutive days in a row.<br>";
    for(var dayIndex in data.progress){
        progressMarked = true;
        theChain.innerHTML += "O ";
    }
    if(!data.progress[dayIndex]){
        theChain.innerHTML += "&lt;No progress yet. Write at least 150 words.&gt;";
    }
}