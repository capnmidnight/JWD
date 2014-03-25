package com.wedusc.justwritedammit;

import java.awt.Toolkit;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.util.HashMap;
import javax.swing.UIManager;

public class Program extends WindowAdapter implements KeyListener {
    private static int MODIFIER_KEY;
    public static boolean IS_OSX;
    public static String NL;
    
    private interface KeyAction {

        void doAction(boolean isShiftDown);
    }
    private HashMap<Integer, KeyAction> keyActions;
    private MainFrame frame;

    private Program() {
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception e) {
            // do nothing
        }
        frame = new MainFrame();
        frame.addWindowListener(this);
        frame.addKeyListener(this);
        frame.addTextAreaKeyListener(this);
        keyActions = new HashMap<Integer, KeyAction>();
        keyActions.put(KeyEvent.VK_O, new KeyAction() {
            public void doAction(boolean isShiftDown) {
                frame.open();
            }
        });
        keyActions.put(KeyEvent.VK_S, new KeyAction() {
            public void doAction(boolean isShiftDown) {
                if (isShiftDown) {
                    frame.saveAs();
                } else {
                    frame.save();
                }
            }
        });
        keyActions.put(KeyEvent.VK_OPEN_BRACKET, new KeyAction() {
            public void doAction(boolean isShiftDown) {
                frame.prevDoc();
            }
        });
        keyActions.put(KeyEvent.VK_CLOSE_BRACKET, new KeyAction() {
            public void doAction(boolean isShiftDown) {
                frame.nextDoc();
            }
        });
        keyActions.put(KeyEvent.VK_N, new KeyAction() {
            public void doAction(boolean isShiftDown) {
                frame.newDoc();
            }
        });
        keyActions.put(KeyEvent.VK_W, new KeyAction() {
            public void doAction(boolean isShiftDown) {
                frame.closeDoc();
            }
        });
        keyActions.put(KeyEvent.VK_SLASH, new KeyAction() {
            public void doAction(boolean isShiftDown) {
                frame.showOptions();
            }
        });

    }

    public static void main(String[] args) {
        String osName = System.getProperty("os.name").toLowerCase();
        IS_OSX = osName.contains("mac");
        Toolkit tk = java.awt.Toolkit.getDefaultToolkit();
        MODIFIER_KEY = tk.getMenuShortcutKeyMask();
        NL = System.getProperty("line.separator");
        new Program();
    }

    @Override
    public void windowClosing(WindowEvent e) {
        if (frame.closeProgram()) {
            frame.setVisible(false);
            frame.dispose();
            System.exit(0);
        }
    }

    public void keyPressed(KeyEvent e) {
        if ((e.getModifiers() & MODIFIER_KEY) != 0
                && keyActions.containsKey(e.getKeyCode())) {
            keyActions.get(e.getKeyCode()).doAction(e.isShiftDown());
        }
    }

    public void keyReleased(KeyEvent e) {
        Document doc = frame.getCurrentDocument();
        if (doc != null) {
            doc.setTextInMemory(frame.getText());
            frame.setIsEdited(doc.isEdited());
            frame.setStatusText(String.format("TOTAL WORDS: %d, ADD'L WORDS: %d",
                    doc.getWordCount(), doc.getDeltaWordCount()));
        }
    }

    public void keyTyped(KeyEvent e) {
        // do nothing, not needed
    }
}
