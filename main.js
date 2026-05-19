const { app, BrowserWindow, ipcMain, dialog, Menu, Tray } = require('electron');
app.disableHardwareAcceleration();

const path = require('node:path');
const fs = require('node:fs');

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

  win.on('close', (event) => {
    e.preventDefault();
    win.hide();
  });
}
// NEW: System Tray
let tray = null;

app.whenReady().then(() => {
  createWindow();
  // NEW: App Menu
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Note',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.send('menu-new-note');
          }
        },
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.send('menu-open-file');
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.send('menu-save');
          }
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.send('menu-save-as');
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // NEW: Double-click tray icon to show window
  tray.on('double-click', () => {
    const win = BrowserWindow.getAllWindows()[0];

    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
    }
  });


  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
  // Create tray icon
  tray = new Tray(path.join(__dirname, 'tray-icon.png'));

  // Tray context menu
  const trayMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        BrowserWindow.getAllWindows()[0].show();
      }
    },
    {
      label: 'Quit',
      click: () => app.quit()
    }
  ]);

  tray.setToolTip('Quick Note Taker');
  tray.setContextMenu(trayMenu);

});

// =========================
// EXISTING FEATURES
// =========================
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

ipcMain.handle('delete-note', async () => {
  const filePath = path.join(app.getPath('documents'), 'quicknote.txt');

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return { success: true };
});

// =========================
// SAVE AS (NEW)
// =========================
ipcMain.handle('save-as', async (event, text) => {
  const result = await dialog.showSaveDialog({
    title: 'Save Note As',
    defaultPath: 'mynote.txt',
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  });

  if (result.canceled) return null;

  fs.writeFileSync(result.filePath, text, 'utf-8');
  return result.filePath;
});

// =========================
// OPEN FILE (NEW)
// =========================
ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Open File',
    filters: [{ name: 'Text Files', extensions: ['txt'] }],
    properties: ['openFile']
  });

  if (result.canceled) return null;

  const filePath = result.filePaths[0];
  const content = fs.readFileSync(filePath, 'utf-8');

  return { filePath, content };
});

// =========================
// NEW NOTE (CONFIRMATION)
// =========================
ipcMain.handle('new-note', async () => {
  const result = await dialog.showMessageBox({
    type: 'warning',
    buttons: ['Yes', 'Cancel'],
    defaultId: 1,
    message: 'You have unsaved changes. Are you sure you want to start a new note?'
  });

  return result.response === 0; // true if "Yes"
});

// =========================
// SMART SAVE (IMPORTANT FIX)
// =========================
ipcMain.handle('smart-save', async (event, text, filePath) => {
  const finalPath =
    filePath || path.join(app.getPath('documents'), 'quicknote.txt');

  fs.writeFileSync(finalPath, text, 'utf-8');

  return finalPath;
});

// ipcMain.handle('save-note', async (event, text) => {
//   const filePath = path.join(app.getPath('documents'), 'quicknote.txt');
//   fs.writeFileSync(filePath, text, 'utf-8');
//   return { success: true };
// });

// ipcMain.handle('load-note', async () => {
//   const filePath = path.join(app.getPath('documents'), 'quicknote.txt');

//   if (fs.existsSync(filePath)) {
//     return fs.readFileSync(filePath, 'utf-8');
//   }

//   return '';
// });

// ipcMain.handle('save-as', async (event, text) => {
//   const result = await dialog.showSaveDialog({
//     title: 'Save Note',
//     defaultPath: 'quicknote.txt',
//     filters: [{ name: 'Text Files', extensions: ['txt'] }]
//   });

//   if (result.canceled || !result.filePath) {
//     return { success: false };
//   }

//   fs.writeFileSync(result.filePath, text, 'utf-8');
//   return { success: true, filePath: result.filePath };
// });

// ipcMain.handle('new-note', async () => {
//   const result = await dialog.showMessageBox({
//     type: 'warning',
//     buttons: ['Discard Changes', 'Cancel'],
//     defaultId: 1,
//     title: 'Unsaved Changes',
//     message: 'You have unsaved changes. Start a new note anyway?'
//   });
//   return { confirmed: result.response === 0 };
// });
// ipcMain.handle('open-file', async (event) => {
//   const result = await dialog.showOpenDialog({
//     properties: ['openFile'],
//     filters: [{ name: 'Text Files', extensions: ['txt'] }]
//   });

//   if (result.canceled) {
//     return { success: false };
//   }

//   const filePath = result.filePaths[0];
//   const content = fs.readFileSync(filePath, 'utf-8');

//   return { success: true, content, filePath };
// });

// return result.response === 0;
// });
