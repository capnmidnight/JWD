(function(){
    "use strict";

    // implement a breadth-first tree traversal without recursion, cuz
    // recursion without tail-call optimization makes programmer sad.
    Element.prototype.breadthFirst = function(thunk){
        var queue = [this];

        while(queue.length > 0){
            var current = queue.shift();

            if(thunk(current)){
                break;
            }

            if(current.nodeType != 3){ // 3 - text node
                for(var i = current.childNodes.length - 1; i >= 0; --i){
                    queue.unshift(current.childNodes[i]);
                }
            }
        }
    }

    // Figure out the text index offset of the current selection with
    // regards to some ancestor node of the actually selected node. This
    // is an important distinction because changing text in a document
    // generates completely new Text nodes, so no selection will ever
    // be savable from its original context. We have to translate to a
    // context that is more stable, and the most stable context in this
    // case would be the actual editor node.
    Element.prototype.getSelection = function(){
        var range = window.getSelection().getRangeAt(0),
            start = null,
            end = null,
            index = 0;

        this.breadthFirst(function(current){
            if(range.startContainer == current){
                start = index + range.startOffset;
            }
            if(range.endContainer == current){
                end = index + range.endOffset;
            }
            index += current.length || 0;

            return start != null && end != null;
        });
        return [start, end];
    }

    // Finds the most specific child node within a parent node on which
    // to set the selection range. This is basically walking the node
    // tree until we've passed enough characters to make a similar-
    // looking selection as the one prior.
    Element.prototype.setSelection = function (sel){
        var selc = window.getSelection(),
            range = document.createRange(),
            start = sel[0],
            end = sel[1],
            index = 0;
        this.breadthFirst(function(current){
            if(index <= start && start <= index + current.length){
                range.setStart(current, start - index);
                current.parentNode.scrollIntoView();
                start = null;
            }
            if(index <= end && end <= index + current.length){
                range.setEnd(current, end - index);
                end = null;
            }

            index += current.length || 0;

            if(start == null && end == null){
                selc.removeAllRanges();
                selc.addRange(range);
                return true;
            }
            return false;
        });
    };

    Element.prototype.getValue = function(){return this.innerHTML; }
    Element.prototype.setValue = function(val){ 
        if(val == undefined || val == null){
            val = "";
        }
        this.innerHTML = val; 
    }
    HTMLTextAreaElement.prototype.getValue = 
    HTMLSelectElement.prototype.getValue =
    HTMLInputElement.prototype.getValue = function(){return this.value; }
    HTMLTextAreaElement.prototype.setValue = 
    HTMLSelectElement.prototype.setValue =
    HTMLInputElement.prototype.setValue = function(val){ 
        if(val == undefined || val == null){
            val = "";
        }
        this.value = val; 
    }
    
    HTMLTextAreaElement.prototype.getSelection = function(){
        return [this.selectionStart, this.selectionEnd];
    };

    HTMLTextAreaElement.prototype.setSelection = function(sel){
        this.selectionStart = sel[0];
        this.selectionEnd = sel[1];
    };

    // Pack up the workflow in a single, easy to use function.
    Element.prototype.edit = function(thunk){
        var initial = this.getValue(), final, delta;
        var sel = this.getSelection();
        final = thunk.call(this, initial);
        if(final != initial){
            delta = final.length - initial.length;
            sel[0] += delta;
            if(delta != 0){
                sel[1] = sel[0];
            }
            this.setValue(final);
            this.setSelection(sel);
        }
    };
})();