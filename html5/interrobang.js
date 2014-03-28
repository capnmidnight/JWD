// Interrobang is a text scrubber for replacing common
// typing behaviors with more appropriate Unicode
// characters. It is also somewhat opinionated about
// how you should be writing. It enforces the Oxford
// comma. It replaces combinations of exclamation
// points and question marks with interrobangs. It
// prevents repeated use of exclamation points,
// question marks, and interrobangs. And it allows the
// simplified entry of unicode characters by escape
// sequence.

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
        [/(!|\?|\u203D)\1+/g, "$1"],
        [/(, \w+) (and \w+)/g, "$1, $2"]
    ];

    return function(evt){
        this.edit(function(s){
            patterns.forEach(function(rule){
                while(s.match(rule[0]))
                    s = s.replace(rule[0], rule[1]);
            });
            return s;
        });
    }
})();