package com.wedusc.justwritedammit;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.ArrayList;

public class Document {

    private static String NEW_LINE;
    private String filepath, textOnDisk, textInMemory, notes;
    private int wordsAtStart;

    public Document() {
        if (NEW_LINE == null) {
            NEW_LINE = System.getProperty("line.separator");
        }
        textInMemory = textOnDisk = notes = "";
        wordsAtStart = 0;
    }

    public boolean isNew() {
        return filepath == null;
    }

    public boolean isEmpty() {
        return isNew() && !isEdited();
    }

    public boolean isEdited() {
        return textInMemory.compareTo(textOnDisk) != 0;
    }

    public void load(String path) {
        filepath = path;
        textOnDisk = textInMemory = readFile(filepath);
        wordsAtStart = getWordCount();
        notes = readFile(makeNotesFilename(filepath));
        if(notes == null){
            notes = "";
        }
    }
    
    private String readFile(String path) {
        File file = new File(path);
        String value = null;
        if (file.exists()) {
            try {
                FileInputStream fis = new FileInputStream(file);
                InputStreamReader isr = new InputStreamReader(fis, "UTF-8");
                ArrayList<Character> input = new ArrayList<Character>();
                char[] buffer = new char[256];
                while (isr.ready()) {
                    int len = isr.read(buffer);
                    for (int i = 0; i < len; ++i) {
                        input.add(buffer[i]);
                    }
                }
                isr.close();
                buffer = new char[input.size()];
                for (int i = 0; i < input.size(); ++i) {
                    buffer[i] = input.get(i);
                }
                value = new String(buffer);
            } catch (Exception exp) {
            }
        }
        return value;
    }

    public void setFileName(String filepath) {
        this.filepath = filepath;
    }

    public String getFileName() {
        if (filepath == null) {
            return "Untitled";
        } else {
            return filepath;
        }
    }

    public void setTextInMemory(String text) {
        textInMemory = text;
    }

    public String getTextInMemory() {
        return textInMemory;
    }

    public void save(String text) {
        setTextInMemory(text);
        writeToDisk(textInMemory, filepath);
        if(!notes.isEmpty()){
            writeToDisk(notes, makeNotesFilename(filepath));
        }
        textOnDisk = textInMemory;
    }
    
    private static String makeNotesFilename(String filepath){
        String filename = null;
        if(filepath.endsWith(".txt")){
            filename = filepath.replace(".txt", "_notes.txt");
        }
        else{
            filename = filepath + "_notes";
        }
        return filename;
    }
    
    public void setNotes(String notes){
        this.notes = notes;
    }
    
    public String getNotes(){
        return notes;
    }

    private void writeToDisk(String text, String path) {
        try {
            PrintWriter writer = new PrintWriter(new File(path), "UTF-8");
            writer.write(text);
            writer.flush();
            writer.close();
        } catch (IOException exp) {
            // Suppress
        }
    }

    public int getWordCount() {
        if (textInMemory != null) {
            String[] parts = textInMemory.split("\\S+");
            if (parts != null) {
                return parts.length;
            }
        }
        return 0;
    }

    public int getDeltaWordCount() {
        return getWordCount() - wordsAtStart;
    }
}
