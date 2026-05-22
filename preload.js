const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  getProducts: () => ipcRenderer.invoke('get-products'),
  detectEnvironment: (ids) => ipcRenderer.invoke('detect-environment', ids),
  startInstall: (data) => ipcRenderer.invoke('start-install', data),
  onInstallProgress: (cb) => { ipcRenderer.on('install-progress', (e, d) => cb(d)); },
  openUrl: (url) => ipcRenderer.invoke('open-url', url),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window')
});
