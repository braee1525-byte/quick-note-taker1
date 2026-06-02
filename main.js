const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

app.disableHardwareAcceleration();

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                { label: 'New Note', accelerator: 'CmdOrCtrl+N', click: () => BrowserWindow.getFocusedWindow().webContents.send('menu-new-note') },
                { label: 'Open File', accelerator: 'CmdOrCtrl+O', click: () => BrowserWindow.getFocusedWindow().webContents.send('menu-open-file') },
                { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => BrowserWindow.getFocusedWindow().webContents.send('menu-save') },
                { label: 'Save As', accelerator: 'CmdOrCtrl+Shift+S', click: () => BrowserWindow.getFocusedWindow().webContents.send('menu-save-as') },
                { type: 'separator' },
                { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
            ]
        }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// --- Helpers ---
const notesFile = path.join(app.getPath('documents'), 'notes.json');
function loadNotes() {
    if (fs.existsSync(notesFile)) {
        return JSON.parse(fs.readFileSync(notesFile, 'utf-8'));
    }
    return [];
}
function saveNotes(notes) {
    fs.writeFileSync(notesFile, JSON.stringify(notes, null, 2));
}

// --- IPC Handlers ---
ipcMain.handle('get-notes', async () => loadNotes());

ipcMain.handle('save-note-json', async (event, note) => {
    let notes = loadNotes();
    const index = notes.findIndex(n => n.id === note.id);
    if (index !== -1) {
        notes[index] = { ...note, updatedAt: new Date().toISOString() };
    } else {
        notes.push({ ...note, updatedAt: new Date().toISOString() });
    }
    saveNotes(notes);
    return { success: true };
});

ipcMain.handle('delete-note-json', async (event, id) => {
    let notes = loadNotes();
    notes = notes.filter(n => n.id !== id);
    saveNotes(notes);
    return { confirmed: true };
});

ipcMain.handle('save-note', async (event, text) => {
    const filePath = path.join(app.getPath('documents'), 'quicknote.txt');
    fs.writeFileSync(filePath, text, 'utf-8');
    return { success: true };
});

ipcMain.handle('load-note', async () => {
    const filePath = path.join(app.getPath('documents'), 'quicknote.txt');
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
    }
    return '';
});

ipcMain.handle('save-as', async (event, text) => {
    const result = await dialog.showSaveDialog({
        defaultPath: 'mynote.txt',
        filters: [{ name: 'Text Files', extensions: ['txt'] }]
    });
    if (result.canceled) return { success: false };
    fs.writeFileSync(result.filePath, text, 'utf-8');
    return { success: true, filePath: result.filePath };
});

ipcMain.handle('new-note', async () => {
    const result = await dialog.showMessageBox({
        type: 'warning',
        buttons: ['Discard changes', 'Cancel'],
        defaultId: 1,
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Start a new note anyway?'
    });
    return { confirmed: result.response === 0 };
});

ipcMain.handle('open-file', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Text Files', extensions: ['txt'] }]
    });
    if (result.canceled) return { success: false };
    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, content, filePath };
});

ipcMain.handle('delete-note', async () => {
    const filePath = path.join(app.getPath('documents'), 'quicknote.txt');
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return { success: true };
});

ipcMain.handle('smart-save', async (event, text, filePath) => {
    const targetPath = filePath || path.join(app.getPath('documents'), 'quicknote.txt');
    fs.writeFileSync(targetPath, text, 'utf-8');
    return { success: true, filePath: targetPath };
});