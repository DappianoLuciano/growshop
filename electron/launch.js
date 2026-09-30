const { app, BrowserWindow } = require('electron') 
 
app.whenReady().then(() => { 
  const win = new BrowserWindow({ 
    width: 1400, 
    height: 900, 
    title: 'AgroGrow Admin', 
    webPreferences: { devTools: true } 
  }) 
  win.loadURL('http://localhost:3000/admin/dashboard') 
  win.webContents.openDevTools() 
}) 
 
app.on('window-all-closed', () => { 
  if (process.platform !== 'darwin') app.quit() 
}) 
