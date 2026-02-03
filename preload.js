const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // i18n
  getTranslations: () => ipcRenderer.invoke('i18n:getTranslations'),

  // Config
  getConfig: () => ipcRenderer.invoke('config:get'),
  saveConfig: (config) => ipcRenderer.invoke('config:save', config),

  // Settings
  openSettings: () => ipcRenderer.send('settings:open'),
  closeSettings: () => ipcRenderer.send('settings:close'),

  // Dialog
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),

  // LanguageTool
  checkGrammar: (text) => ipcRenderer.invoke('languagetool:check', text),

  // Transport
  transport: (data) => ipcRenderer.invoke('transport:execute', data)
});
