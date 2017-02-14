const {BrowserWindow, app, session} = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function setCookies (cookies) {
    cookies.forEach(cookie => {
        session.defaultSession.cookies.set(cookie, (error) => {
            if (error) console.error(error);
        });
    });
}

function createWindow () {
    setCookies([{
        url: 'https://github.com',
        name: 'user_session',
        value: 'COz6RpLclOx4QoXjG8pUqd0_f5_vohtP7ier9RZiboiIb-TA'
    }, {
        url: 'https://console.apps.xiaoyun.com',
        name: 'console-ssr',
        value: 's%3Af3p0_OF5s7HvfZhZEmm6gjhR9GME_00J.%2FkO6spjV%2B32%2FvfA7SD3Ot86opoJCBbRMC3hAalVHK9k'
    }]);

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        nodeIntegration: false
    });

    mainWindow.loadURL('http://localhost:8000/');

    // mainWindow.loadURL(url.format({
    //     pathname: path.join(__dirname, 'pages', 'index.html'),
    //     protocol: 'file:',
    //     slashes: true
    // }));

    // setTimeout(() => {
    //     mainWindow.loadURL('https://console.apps.xiaoyun.com');
    // }, 5000);

    // mainWindow.webContents.openDevTools();

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

