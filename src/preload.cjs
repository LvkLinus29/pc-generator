const { contextBridge, ipcRenderer, clipboard } = require("electron");

contextBridge.exposeInMainWorld("pcGenerator", {
  getOptions: () => ipcRenderer.invoke("pc:get-options"),
  recommend: (payload) => ipcRenderer.invoke("pc:recommend", payload),
  openExternal: (url) => ipcRenderer.invoke("pc:open-external", url),
  copyText: (text) => clipboard.writeText(text),
});
