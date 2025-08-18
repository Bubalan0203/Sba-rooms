// public/electron.js

const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // --- SECURITY ENHANCEMENTS ---
      nodeIntegration: false, // Keep Node.js integration off in the renderer
      contextIsolation: true, // Protect against prototype pollution
      preload: path.join(__dirname, './preload.js') // Use a preload script
    },
    icon: path.join(__dirname, './icon.png')
  });

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  if (isDev) {
    win.webContents.openDevTools();
  }
}

// ... rest of your file remains the same
app.whenReady().then(createWindow);
// ...