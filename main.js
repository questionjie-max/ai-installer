const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { getProductsByCategory, getRequiredDependencies } = require('./modules/products');
const { detectAll } = require('./modules/detector');
const { startInstallation, setProgressCallback } = require('./modules/installer');
const logger = require('./modules/logger');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 700, height: 800, resizable: false,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0f0f13',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  // Uncomment for devtools: mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

ipcMain.handle('get-products', () => getProductsByCategory());

ipcMain.handle('detect-environment', async (e, ids) => {
  const deps = getRequiredDependencies(ids);
  return await detectAll(deps);
});

ipcMain.handle('start-install', async (e, { productIds, networkStatus }) => {
  setProgressCallback((p) => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('install-progress', p);
  });
  return await startInstallation(productIds, networkStatus);
});

ipcMain.handle('open-url', async (e, url) => {
  await shell.openExternal(url);
});

ipcMain.handle('get-log-path', () => logger.getLogPath());

ipcMain.handle('read-logs', async (e, lines) => logger.readLogs(lines));

ipcMain.handle('minimize-window', () => mainWindow?.minimize());
ipcMain.handle('close-window', () => mainWindow?.close());
