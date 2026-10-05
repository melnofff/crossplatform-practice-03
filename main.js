const { app, BrowserWindow, ipcMain, Menu, session } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { readDirectory } = require('./directory');

const workingDirectory = process.cwd();
const pagePath = path.join(__dirname, 'index.html');
const pageURL = pathToFileURL(pagePath).href;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000, height: 720, minWidth: 720, minHeight: 520,
    title: 'Практика 3 — Файловый просмотрщик',
    backgroundColor: '#f4f6fa',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true
    }
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', event => event.preventDefault());
  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.loadFile(pagePath);
}

function requestRefresh() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('refresh-request');
  }
}

function installMenu() {
  const template = [
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
    { label: 'Файл', submenu: [
      { id: 'refresh-list', label: 'Обновить список',
        accelerator: 'CmdOrCtrl+R', click: requestRefresh },
      { type: 'separator' },
      { role: 'quit', label: 'Выйти' }
    ] },
    { label: 'Вид', submenu: [
      { role: 'toggleDevTools', label: 'Инструменты разработчика' },
      { role: 'resetZoom', label: 'Исходный масштаб' },
      { role: 'zoomIn', label: 'Увеличить' },
      { role: 'zoomOut', label: 'Уменьшить' }
    ] }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  ipcMain.handle('list-dir', async (event, dir) => {
    // UI can read only the working directory; it cannot choose arbitrary paths.
    if (!mainWindow || event.sender !== mainWindow.webContents ||
        event.senderFrame !== mainWindow.webContents.mainFrame ||
        event.senderFrame.url !== pageURL || dir !== '.') {
      throw new Error('Недопустимый запрос каталога.');
    }
    return readDirectory(workingDirectory);
  });
  createWindow();
  installMenu();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
