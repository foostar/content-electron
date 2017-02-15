const {session, ipcMain} = require('electron');

export const GET_WEBVIEW_COOKIES_REQUEST = 'get-webview-cookies-request';

ipcMain.on(GET_WEBVIEW_COOKIES_REQUEST, (event, partition) => {
    const cookies = session.fromPartition(partition).cookies;
    cookies.get({}, (err, result) => {
        if (err) return;
        console.log(`${[partition]} cookies`, result);
        event.sender.send('get-webview-cookies', result);
    });
});

