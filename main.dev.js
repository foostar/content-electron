require('./message');
const {BrowserWindow, app, session} = require('electron');

let mainWindow;

// function setCookies (cookies) {
//     cookies.forEach(cookie => {
//         session.defaultSession.cookies.set(cookie, (error) => {
//             if (error) console.error(error);
//         });
//     });
// }

function createWindow () {
    // setCookies([
    //     {
    //         url: 'https://github.com',
    //         name: 'user_session',
    //         value: 'COz6RpLclOx4QoXjG8pUqd0_f5_vohtP7ier9RZiboiIb-TA'
    //     }
    // ]);

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        nodeIntegration: false
    });

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

