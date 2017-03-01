require('./message');
const {BrowserWindow, app} = require('electron');

let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        // autoHideMenuBar: true,
        useContentSize: true,
        // frame: false,
        // titleBarStyle: 'hidden-inset',
        webPreferences: {
            webSecurity: false
        }
    });

    mainWindow.webContents.session.clearStorageData();

    mainWindow.loadURL('http://localhost:8000/');

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

