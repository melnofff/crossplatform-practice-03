const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  listDir: dir => ipcRenderer.invoke('list-dir', dir),
  onRefresh: callback => {
    if (typeof callback !== 'function') return () => {};
    const listener = () => callback(); // Do not expose the IPC event to the page.
    ipcRenderer.on('refresh-request', listener);
    return () => ipcRenderer.removeListener('refresh-request', listener);
  }
});
