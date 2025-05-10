const { contextBridge, ipcRenderer } = require("electron");

// Expose the `sendLoginData` function to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  sendLoginData: (token, branchId, branchName, personnelName) => {
    ipcRenderer.send("login-data", token, branchId, branchName, personnelName);
  },
});
