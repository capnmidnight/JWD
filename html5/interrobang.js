var interrobang = (function(){
    // I have the unicode values broken out like this
    // because I find them easier to manipulate as a
    // quasi-enumeration.
    var characters = {
        OpenSmartQuote : "\u201c",
        CloseSmartQuote : "\u201d",
        EnDash : "\u2013",
        EmDash : "\u2014",
        Ellipsis : "\u2026",
        Prime : "\u2032",
        DoublePrime : "\u2033",
        TriplePrime : "\u2034",
        BallotBox : "\u2610",
        BallotBoxWithCheck : "\u2611",
        BallotBoxWithX : "\u2612",
        ChessWhiteKing : "\u2654",
        ChessWhiteQueen : "\u2655",
        ChessWhiteRook : "\u2656",
        ChessWhiteBishop : "\u2657",
        ChessWhiteKnight : "\u2658",
        ChessWhitePawn : "\u2659",
        ChessBlackKing : "\u265a",
        ChessBlackQueen : "\u265b",
        ChessBlackRook : "\u265c",
        ChessBlackBishop : "\u265d",
        ChessBlackKnight : "\u265e",
        ChessBlackPawn : "\u265f",
        Interrobang : "\u203D"
    };


    // These pattern objects really need be nothing more than a pair of values.
    // to create an entire class for them would be overkill. As they are also
    // internal, future considerations for an object model will not break backwards
    // compatability. Also, I don't really give a shit.
    var patterns = [
        [/"([\s\S]+?)"/gm, characters.OpenSmartQuote + "$1" + characters.CloseSmartQuote, 0],
        [/--/gm, characters.EmDash],
        [/\W-\W/gm, characters.EnDash],
        [/\.\.\./gm, characters.Ellipsis],
        [/\?\!/gm, characters.Interrobang],
        [/\!\?/gm, characters.Interrobang],
        [/''/gm, characters.DoublePrime],
        [/(''|\u2033)'/gm, characters.TriplePrime],
        [/\\u([0-9a-fA-F]{4})/gm, function(match, cap1){
            return String.fromCharCode(parseInt(cap1, 16));
        }],
        [/<h2[^>]*>!!(.+?)<\/h2>/gm, function(res, cap1){
            return "<h1>" + cap1 + "</h1>";
        }],
        [/<h3>!!(.+?)<\/h3>/gm, function(res, cap1){
            return "<h2>" + cap1 + "</h2>";
        }],
        [/<h4>!!(.+?)<\/h4>/gm, function(res, cap1){
            return "<h3>" + cap1 + "</h3>";
        }],
        [/<h5>!!(.+?)<\/h5>/gm, function(res, cap1){
            return "<h4>" + cap1 + "</h4>";
        }],
        [/<h6>!!(.+?)<\/h6>/gm, function(res, cap1){
            return "<h5>" + cap1 + "</h5>";
        }],
        [/<p>!!(.+?)<\/p>/gm, function(res, cap1){
            return "<h6>" + cap1 + "</h6>";
        }]
    ];

    var makeAThing = function(domObject){

        function saveSelection(parent){
            var queue = [parent],
                range = window.getSelection().getRangeAt(0),
                start = null,
                end = null,
                index = 0;
            while(queue.length > 0){
                var current = queue.shift();
                if(range.startContainer == current)
                    start = index + range.startOffset;
                if(range.endContainer == current)
                    end = index + range.endOffset;
                index += current.length || 0;

                if(start != null && end != null)
                    break;
                if(current.nodeType != 3) // 3 - text node
                    for(var i = current.childNodes.length - 1; i >= 0; --i)
                        queue.unshift(current.childNodes[i]);
            }

            return [start, end];
        }

        function restoreSelection(parent, sel){
            if(sel != null){
                var queue = [parent],
                    range = window.getSelection().getRangeAt(0),
                    start = sel[0],
                    end = sel[1],
                    index = 0;
                while(queue.length > 0){
                    var current = queue.shift();
                    if(index <= start && start <= index + current.length){
                        range.setStart(current, start - index);
                        start = null;
                    }
                    if(index <= end && end <= index + current.length){
                        range.setEnd(current, end - index);
                        end = null;
                    }
                    index += current.length || 0;

                    if(start == null && end == null)
                        break;
                    if(current.nodeType != 3) // 3 - text node
                        for(var i = current.childNodes.length - 1; i >= 0; --i)
                            queue.unshift(current.childNodes[i]);
                }
            }
        }

        domObject.addEventListener("keyup", function(evt){
            var s = domObject.innerHTML, i, rule, res, e, o, d;
            o = s;
            for(i = 0; i < patterns.length; ++i){
                rule = patterns[i];
                while(s.match(rule[0]))
                    s = s.replace(rule[0], rule[1]);
            }
            if(s != o){
                var sel = saveSelection(domObject);
                domObject.innerHTML = s;
                sel[0] += s.length - o.length;
                sel[1] = sel[0];
                restoreSelection(domObject, sel);
            }
        }, false);
    };
    return makeAThing;
})();