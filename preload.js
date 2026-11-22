const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  printReceipt: (options) => ipcRenderer.invoke('print-receipt', options)
});
