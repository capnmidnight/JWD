package com.wedusc.justwritedammit;

import java.awt.Color;
import java.awt.FileDialog;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GraphicsDevice;
import java.awt.GraphicsEnvironment;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.SystemColor;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyListener;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.io.File;
import java.util.ArrayList;
import java.util.prefs.Preferences;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.Timer;
import javax.swing.filechooser.FileSystemView;

public class MainFrame extends JFrame implements ActionListener {

    private static final long serialVersionUID = 8474556465641396189L;
    private OptionsFrame optionsFrame;
    private JLabel currentFileIndexLabel;
    private JLabel fileNameLabel;
    private JLabel needsSavingIndicator;
    private JLabel timeLabel;
    private JLabel statusLabel;
    private JPanel panMiddle;
    private JTextArea textbox;
    private JTextArea rightMargin;
    private FileDialog fileDialog;
    private Timer timer1;
    private ArrayList<Document> docs;
    private int curDocIndex;
    private long start;
    private JFrame[] windows;
    private Preferences pref;
    // private boolean isOSX;
    public MainFrame() {// boolean isOSX) {
        // this.isOSX = isOSX;
        pref = Preferences.userNodeForPackage(com.wedusc.justwritedammit.Program.class);
        int defaultForeground = Color.WHITE.getRGB();
        int defaultBackground = SystemColor.controlShadow.getRGB();
        String defaultFontName = Font.SANS_SERIF;
        int defaultFontSize = 36;
        
        Color foreground = new Color(pref.getInt("ForegroundColor", defaultForeground));
        Color background = new Color(pref.getInt("BackgroundColor", defaultBackground));
        String fontName = pref.get("FontName", defaultFontName);
        int fontSize = pref.getInt("FontSize", defaultFontSize);

        getContentPane().setFont(new Font("Tahoma", Font.BOLD, 11));
        GridBagLayout gridBagLayout = new GridBagLayout();
        gridBagLayout.columnWidths = new int[]{0, 0, 0};
        gridBagLayout.rowHeights = new int[]{0, 0, 0};
        gridBagLayout.columnWeights = new double[]{0.0, 1.0, 0.0};
        gridBagLayout.rowWeights = new double[]{0.0, 1.0, Double.MIN_VALUE};
        getContentPane().setLayout(gridBagLayout);

        currentFileIndexLabel = new JLabel("(1 of 1)");
        currentFileIndexLabel.setForeground(foreground);
        GridBagConstraints gbc_lblCurrent = new GridBagConstraints();
        gbc_lblCurrent.insets = new Insets(100, 150, 5, 5);
        gbc_lblCurrent.gridx = 0;
        gbc_lblCurrent.gridy = 0;
        getContentPane().add(currentFileIndexLabel, gbc_lblCurrent);

        panMiddle = new JPanel();
        panMiddle.setBackground(background);
        FlowLayout flowLayout = (FlowLayout) panMiddle.getLayout();
        flowLayout.setAlignment(FlowLayout.LEFT);
        GridBagConstraints gbc_panMiddle = new GridBagConstraints();
        gbc_panMiddle.fill = GridBagConstraints.BOTH;
        gbc_panMiddle.insets = new Insets(100, 5, 5, 5);
        gbc_panMiddle.gridx = 1;
        gbc_panMiddle.gridy = 0;
        getContentPane().add(panMiddle, gbc_panMiddle);

        fileNameLabel = new JLabel("(new file)");
        fileNameLabel.setForeground(foreground);
        panMiddle.add(fileNameLabel);

        needsSavingIndicator = new JLabel("(Unsaved)");
        needsSavingIndicator.setVisible(false);
        needsSavingIndicator.setForeground(foreground);
        panMiddle.add(needsSavingIndicator);

        timeLabel = new JLabel("(Time)");
        timeLabel.setForeground(foreground);
        GridBagConstraints gbc_lblTime = new GridBagConstraints();
        gbc_lblTime.insets = new Insets(100, 5, 5, 150);
        gbc_lblTime.gridx = 2;
        gbc_lblTime.gridy = 0;
        getContentPane().add(timeLabel, gbc_lblTime);
                
        rightMargin = new JTextArea();
        JScrollPane rightMarginPane = new JScrollPane(rightMargin);
        rightMargin.setTabSize(4);
        rightMargin.setBorder(null);
        rightMargin.setBackground(background);
        rightMargin.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 12));
        rightMargin.setForeground(foreground);
        rightMargin.setLineWrap(true);
        rightMargin.setWrapStyleWord(true);
        GridBagConstraints gbc_rightMargin = new GridBagConstraints();
        gbc_rightMargin.insets = new Insets(0, 5, 0, 5);
        gbc_rightMargin.fill = GridBagConstraints.BOTH;
        gbc_rightMargin.gridx = 2;
        gbc_rightMargin.gridy = 1;
        getContentPane().add(rightMarginPane, gbc_rightMargin);

        textbox = new JTextArea();
        JScrollPane pane = new JScrollPane(textbox);
        pane.setBorder(null);
        textbox.setTabSize(4);
        textbox.setBorder(null);
        textbox.setBackground(background);
        textbox.setFont(new Font(fontName, Font.PLAIN, fontSize));
        textbox.setForeground(foreground);
        textbox.setLineWrap(true);
        textbox.setWrapStyleWord(true);
        GridBagConstraints gbc_richTextBox1 = new GridBagConstraints();
        gbc_richTextBox1.insets = new Insets(0, 0, 5, 5);
        gbc_richTextBox1.fill = GridBagConstraints.BOTH;
        gbc_richTextBox1.gridx = 1;
        gbc_richTextBox1.gridy = 1;
        getContentPane().add(pane, gbc_richTextBox1);

        statusLabel = new JLabel(
                "(Welcome to JustWriteDammit, the Zen writing program)");
        statusLabel.setForeground(foreground);
        statusLabel.setBackground(background);
        GridBagConstraints gbc_lblStatus = new GridBagConstraints();
        gbc_lblStatus.anchor = GridBagConstraints.WEST;
        gbc_lblStatus.insets = new Insets(5, 0, 100, 0);
        gbc_lblStatus.gridx = 1;
        gbc_lblStatus.gridy = 2;
        getContentPane().add(statusLabel, gbc_lblStatus);

        fileDialog = new FileDialog(this);
        fileDialog.setDirectory(FileSystemView.getFileSystemView()
                .getHomeDirectory().getPath());

        GraphicsEnvironment ge = GraphicsEnvironment
                .getLocalGraphicsEnvironment();
        GraphicsDevice[] screens = ge.getScreenDevices();
        windows = new JFrame[screens.length];
        windows[0] = this;

        for (int i = 0; i < screens.length; ++i) {
            if (windows[i] == null) {
                windows[i] = new JFrame();
            }
            windows[i].setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
            windows[i].getContentPane().setBackground(background);
            windows[i].setBounds(screens[i].getDefaultConfiguration()
                    .getBounds());
            windows[i].setUndecorated(true);
            windows[i].setTitle("Just Write, Dammit");
            //windows[i].setAlwaysOnTop(true);
            windows[i].setVisible(true);
        }

        optionsFrame = new OptionsFrame();
        optionsFrame.setSelectedFont(textbox.getFont());
        optionsFrame.setSelectedBackground(textbox.getBackground());
        optionsFrame.setSelectedForeground(textbox.getForeground());
        optionsFrame.addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent e) {
                readOptions();
            }
        });



        docs = new ArrayList<Document>();
        newDoc();

        timer1 = new Timer(500, this);
        start = System.nanoTime();
        timer1.start();
    }

    public String getText() {
        return textbox.getText();
    }

    public void setIsEdited(boolean isEdited) {
        needsSavingIndicator.setVisible(isEdited);
    }

    public void setStatusText(String text) {
        statusLabel.setText(text);
    }

    public void addTextAreaKeyListener(KeyListener listener) {
        textbox.addKeyListener(listener);
    }

    public void showOptions() {
        optionsFrame.setVisible(true);
    }

    public void readOptions() {
        Color background = optionsFrame.getSelectedBackground();
        Color foreground = optionsFrame.getSelectedForeground();
        Font font = optionsFrame.getSelectedFont();
        for (JFrame frame : windows) {
            frame.getContentPane().setForeground(foreground);
            frame.getContentPane().setBackground(background);
        }
        textbox.setForeground(foreground);
        needsSavingIndicator.setForeground(foreground);
        fileNameLabel.setForeground(foreground);
        rightMargin.setForeground(foreground);
        statusLabel.setForeground(foreground);
        timeLabel.setForeground(foreground);
        currentFileIndexLabel.setForeground(foreground);
        pref.putInt("ForegroundColor", optionsFrame.getSelectedForeground().getRGB());
        
        textbox.setBackground(background);
        panMiddle.setBackground(background);
        rightMargin.setBackground(background);
        statusLabel.setBackground(background);
        pref.putInt("BackgroundColor", background.getRGB());
        
        textbox.setFont(font);
        pref.put("FontName", font.getName());
        pref.putInt("FontSize", font.getSize());
    }

    public void actionPerformed(ActionEvent e) {
        long elapsed = System.nanoTime() - start;
        long seconds = elapsed / 1000000000;
        long minutes = seconds / 60;
        long hours = minutes / 60;
        seconds %= 60;
        minutes %= 60;
        timeLabel.setText(String.format("Elapsed: %02d:%02d:%02d", hours,
                minutes, seconds));
    }

    public Document getCurrentDocument() {
        return docs.get(curDocIndex);
    }

    boolean closeProgram() {
        moveDoc(-curDocIndex);
        boolean cont = true;
        while (!docs.isEmpty() && cont) {
            cont = saveAndCloseDoc(false);
        }
        if (docs.isEmpty()) {
            System.exit(0);
        }
        return cont;
    }

    boolean saveAndCloseDoc(boolean openNew) {
        int result = JOptionPane.NO_OPTION;
        Document current = getCurrentDocument();
        if (current.isEdited()) {
            result = JOptionPane.showConfirmDialog(this, "The text in the "
                    + current.getFileName()
                    + " file has changed. Would you like to save it?",
                    "Just Write, Dammit!", JOptionPane.YES_NO_CANCEL_OPTION,
                    JOptionPane.QUESTION_MESSAGE);
        }
        if (result == JOptionPane.YES_OPTION) {
            save();
        }
        if (result != JOptionPane.CANCEL_OPTION) {
            docs.remove(curDocIndex);
            if (openNew && docs.isEmpty()) {
                newDoc();
            }
            if (docs.size() > 0) {
                moveDoc(0);
            }
        }
        return result != JOptionPane.CANCEL_OPTION;
    }

    void closeDoc() {
        saveAndCloseDoc(true);
    }

    void newDoc() {
        docs.add(new Document());
        curDocIndex = docs.size() - 1;
        moveDoc(0);
    }

    void moveDoc(int dir) {
        curDocIndex += dir;
        if (curDocIndex < 0) {
            curDocIndex += docs.size();
        }
        if (curDocIndex >= docs.size()) {
            curDocIndex -= docs.size();
        }
        currentFileIndexLabel.setText("(" + Integer.toString(curDocIndex + 1) + " of "
                + Integer.toString(docs.size()) + ")");
        Document doc = getCurrentDocument();
        fileNameLabel.setText(doc.getFileName());
        textbox.setText(doc.getTextInMemory());
        rightMargin.setText(doc.getNotes());
    }

    void prevDoc() {
        moveDoc(-1);
    }

    void nextDoc() {
        moveDoc(1);
    }

    void open() {
        fileDialog.setMode(FileDialog.LOAD);
        fileDialog.setTitle("Open File");
        fileDialog.setVisible(true);
        String filename = fileDialog.getFile();
        if (filename != null) {
            String directory = fileDialog.getDirectory();
            if (!getCurrentDocument().isEmpty()) {
                newDoc();
            }
            String path = new File(directory, filename).getAbsolutePath();
            Document cur = getCurrentDocument();
            cur.load(path);
            textbox.setText(cur.getTextInMemory());
            rightMargin.setText(cur.getNotes());
            fileNameLabel.setText(path);
        }
    }

    void save() {
        Document doc = getCurrentDocument();
        if (doc.isNew()) {
            saveAs();
        } else {
            doc.setNotes(rightMargin.getText());
            doc.save(textbox.getText());
        }
    }

    void saveAs() {
        fileDialog.setMode(FileDialog.SAVE);
        fileDialog.setTitle("Save As");
        fileDialog.setVisible(true);
        String filename = fileDialog.getFile();
        if (filename != null) {
            String directory = fileDialog.getDirectory();
            Document doc = getCurrentDocument();
            String filepath = new File(directory, filename).getAbsolutePath();
            doc.setFileName(filepath);
            doc.setNotes(rightMargin.getText());
            doc.save(textbox.getText());
            fileNameLabel.setText(filepath);
        }
    }
}
