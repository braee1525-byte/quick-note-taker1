const{app, BrowserWindow, ipcMain, BrowserView }=require('electron');
app.disableHardwareAcceleration();

const path=require('node:path');
const fs=require('node:fs');

function createWindow(){
    const win =new BrowserWindow({
        width:900,
        height:600,
        webPreferences:{
            preload:path.join(__dirname,'preload.js'),
            contextIsolation:true,
            nodeIntegration:false
        }
    });
    win.loadFile('index.html');
}
app.whenReady().then(()=>{
    createWindow();

    app.on('activate',()=>{
        if(BrowserWindow.getAllWindows().length===0) createWindow();
    });
});

app.on('window-all-closed',()=>{
    if(process.platform !=='darwin') app.quit();
});

ipcMain.handle('save-note', async(event,text)=>{
    const filePath=path.join(app.getPath('documents'),'quicknote.txt');
    fs.writeFileSync(filePath,text,'utf-8');
    return{success:true};
});
ipcMain.handle('load-note', async()=>{
    const filePath=path.join(app.getPath('documents'),'quicknote.txt');
    if(fs.existsSync(filePath)){
        return fs.readFileSync(filePath,'utf-8');
    }
    return'';
});