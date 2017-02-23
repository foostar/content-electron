require('./message');
const {BrowserWindow, app} = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            webSecurity: false
        }
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'dist', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

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

