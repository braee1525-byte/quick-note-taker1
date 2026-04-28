const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
<<<<<<< HEAD
    // Basic features
    saveNote: (text) => ipcRenderer.invoke('save-note', note),
    loadNote: () => ipcRenderer.invoke('load-note'),
    deleteNote: () => ipcRenderer.invoke('delete-note'),

    // New features (from your PDF)
    saveAs: (text) => ipcRenderer.invoke('save-as', text),
    openFile: () => ipcRenderer.invoke('open-file'),
    newNote: () => ipcRenderer.invoke('new-note'),

    // Smart save (fixes Save button behavior)
    smartSave: (text, filePath) => ipcRenderer.invoke('smart-save', text, filePath)
=======
  saveNote: (note) => ipcRenderer.invoke('save-note', note),

  loadNote: () => ipcRenderer.invoke('load-note'),

  saveAs: (text) => ipcRenderer.invoke('save-as', text),

  deleteNote: () => ipcRenderer.invoke('delete-note'),

  newNote: () => ipcRenderer.invoke('new-note'),

  openFile: () => ipcRenderer.invoke('open-file')
>>>>>>> 5c2a99e33e2a2fc701c493d09b6d63b5b8f1f06d
});