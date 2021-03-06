function frequency(min, arr){
    var result = group(
            group(arr)
              .map(function (word){ return [word[0], word[1].length]; }),
            function (word){ return word[1]; },
            function (word){ return word[0]; })
        .map(function (count){
            count[1].sort();
            return [count[0], count[1].join(", ")];
        })
        .filter(function(count){
            return count[0] >= min
        });

    result.sort(function (a, b){
        return b[0] - a[0];
    });

    return result.map(function (word){
        return fmt("$1: $2", word[0], word[1]);
    }).join("\n<br>");
}

function wordCount(text){
    var words = text
        .replace(/<\/?(br|p)>/g, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .match(/[\w'’]+/g);

    return words && words.length || 0;
}

function countWords(){
    var count = wordCount(writer.getValue());
    data.chapters[data.currentChapter].currentCount = count;
    totalWordCount.setValue(count);
    var additional = count - data.chapters[data.currentChapter].lastCount;
    if(additional >= 0){
        additional = fmt("+$1", additional);
    }
    addWordCount.setValue(additional);
}

function analyzeScreenShow(){
    var words = writer.getValue()
        .replace(/<\/?(br|p)>/g, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .match(/[\w'’]+/g),
        min = parseInt(minFreqCount.getValue(), 10),
        counts1 = "", counts2 = "", counts3 = "", counts4 = "";

    var exclude = excludeWords
        .getValue()
        .split(",")
        .map(function(word){
            return word.trim();
        })
        .filter(function(word){
            return word.length > 0;
        });

    if(exclude.length > 0){
        words = words.filter(function(word){
            return exclude.indexOf(word) == -1;
        });
    }

    if(words != null){
        words = words.map(function(word){
            return word.toLowerCase();
        });

        counts1 = frequency(min, words);
        var words2 = [], words3 = [], words4 = [];
        for (var i = 0; i < words.length; ++i){
            if (i > 0){
                words2.push(words.slice(i - 1, i + 1).join(" "));
            }
            if (i > 1){
                words3.push(words.slice(i - 2, i + 1).join(" "));
            }
            if (i > 2){
                words4.push(words.slice(i - 3, i + 1).join(" "));
            }
        }
        counts2 = frequency(min, words2);
        counts3 = frequency(min, words3);
        counts4 = frequency(min, words4);
    }

    word1Frequency.setValue(counts1);
    word2Frequency.setValue(counts2);
    word3Frequency.setValue(counts3);
    word4Frequency.setValue(counts4);
    ga('send', 'event', 'report', "analysisFreq");
}
