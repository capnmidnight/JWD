/*
 * To change this template, choose Tools | Templates
 * and open the template in the this.
 */
package com.wedusc.ui;

import java.awt.event.KeyEvent;
import javax.swing.text.html.HTMLDocument;

/**
 *
 * @author Sean McBeth
 */
public class EasyEditorPane extends javax.swing.JEditorPane {

    public boolean embolden() {
        return simpleEdit("b", "");
    }

    public boolean italicize() {
        return simpleEdit("i", "");
    }

    public boolean underline() {
        return simpleEdit("u", "");
    }

    public boolean centerText() {
        return simpleEdit("center", "");
    }

    public boolean setFontAttributes(String color, String face, int size) {
        return simpleEdit("font", String.format(" color=\"%s\" face=\"%s\" size=\"%d\"", color, face, size));
    }

    private boolean simpleEdit(String tag, String attr) {
        HTMLDocument doc = (HTMLDocument) this.getDocument();
        String startTag = "<" + tag + attr + ">";
        String endTag = "</" + tag + ">";
        String startMarker = "[START_" + tag + "]";
        String endMarker = "[END_" + tag + "]";
        int selStart = this.getSelectionStart();
        int selEnd = this.getSelectionEnd();
        // stick some predictable text into the document to be able to
        // find it.
        try {
            doc.insertString(selStart, startMarker, null);
            // the selection end changes when you insert text before it
            doc.insertString(this.getSelectionEnd(), endMarker, null);
        } catch (Exception exp) {
        }

        // look to see if the desired tag is already in effect in the
        // range of the selection.
        String text = this.getText();
        int startX = text.indexOf(startMarker);
        int start1 = text.indexOf(startTag, startX);
        int endX = text.indexOf(endMarker);
        int end2 = text.lastIndexOf(endTag, endX);

        boolean result = true;
        // if so, remove it
        if (start1 >= startX + startMarker.length() && start1 <= endX
                && end2 > startX && end2 + endTag.length() <= endX) {
            // don't change the stuff before the selection
            String left = text.substring(0, startX);
            // targeting the middle
            String mid = text.substring(startX, endX + endMarker.length());
            // don't change the stuff after the selection
            String right = text.substring(endX + endMarker.length(), text.length());
            //remove both the tag and the markers
            text = left + mid.replace(startTag, "")
                    .replace(endTag, "")
                    .replace(startMarker, "")
                    .replace(endMarker, "")
                    + right;
            result = false;
        } else { // otherwise, add it
            text = text.replace(startMarker, startTag)
                    .replace(endMarker, endTag);
            
        }

        this.setText(text);
        this.setSelectionStart(selStart);
        this.setSelectionEnd(selEnd);
        return result;
    }
}
