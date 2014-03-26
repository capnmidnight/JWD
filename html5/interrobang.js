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
        [/"([\s\S]+?)"/g, characters.OpenSmartQuote + "$1" + characters.CloseSmartQuote, 0],
        [/(\w)--(\w)/g, "$1" + characters.EmDash + "$2"],
        [/\s-\s/g, characters.EnDash],
        [/\.{3}/g, characters.Ellipsis],
        [/\?\!/g, characters.Interrobang],
        [/\!\?/g, characters.Interrobang],
        [/''/g, characters.DoublePrime],
        [/(''|\u2033)'/g, characters.TriplePrime],
        [/\\u([0-9a-fA-F]{4})/g, function(match, cap1){
            return String.fromCharCode(parseInt(cap1, 16));
        }],
        [/<h2[^>]*>!!(.+?)<\/h2>/g, function(res, cap1){
            return "<h1>" + cap1 + "</h1>";
        }],
        [/<h3>!!(.+?)<\/h3>/g, function(res, cap1){
            return "<h2>" + cap1 + "</h2>";
        }],
        [/<h4>!!(.+?)<\/h4>/g, function(res, cap1){
            return "<h3>" + cap1 + "</h3>";
        }],
        [/<h5>!!(.+?)<\/h5>/g, function(res, cap1){
            return "<h4>" + cap1 + "</h4>";
        }],
        [/<h6>!!(.+?)<\/h6>/g, function(res, cap1){
            return "<h5>" + cap1 + "</h5>";
        }],
        [/<p>!!(.+?)<\/p>/g, function(res, cap1){
            return "<h6>" + cap1 + "</h6>";
        }],
        [/(!|\?|\u203D)\1+/g, "$1"],
        [/&lt;(\/?(p|h\d))&gt;/g, "<$1>"],
        [/>([^<]+?)(<br>)+/g, "><p>$1</p>"],
        [/<p><\/p>/g, ""]
    ];

    return function(evt){
        this.edit(function(){
            var s = this.innerHTML, o, d;
            o = s;

            patterns.forEach(function(rule){
                while(s.match(rule[0]))
                    s = s.replace(rule[0], rule[1]);
            });

            // setting innerHTML will cause the browser to generate
            // completely new Text nodes, even if the text itself hasn't
            // changed any. So, we make sure the before and after state
            // of the HTML has actually, realistically changed before
            // setting innerHTML, so we don't have to screw around with
            // the selctions more often than we have to. It's extremely
            // difficult to get the selections right, so let's just not
            // screw with it very often.
            if(s != o){
                this.innerHTML = s;
            }
        });
    }
})();