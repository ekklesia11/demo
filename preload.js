const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('linkedIn', {
  login: (email, password) => ipcRenderer.send('login', email, password),
  linkedInLogin: () => ipcRenderer.invoke('linkedInLogin'),
  loginResponse: (callback) => ipcRenderer.on('loginResponse', callback),
  loggedIn: (callback) => ipcRenderer.on('loggedIn', callback),
  message: (callback) => ipcRenderer.on('message', callback),
});
