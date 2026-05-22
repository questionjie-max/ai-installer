const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  getProducts: () => ipcRenderer.invoke('get-products'),
  detectEnvironment: (ids) => ipcRenderer.invoke('detect-environment', ids),
  startInstall: (data) => ipcRenderer.invoke('start-install', data),
  onInstallProgress: (cb) => { ipcRenderer.on('install-progress', (e, d) => cb(d)); },
  openUrl: (url) => ipcRenderer.invoke('open-url', url),
  getLogPath: () => ipcRenderer.invoke('get-log-path'),
  readLogs: (lines) => ipcRenderer.invoke('read-logs', lines),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window')
});
