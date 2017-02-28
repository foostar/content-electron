const {session, ipcMain} = require('electron');
const querystring = require('querystring');

ipcMain.on('GET_COOKIES_BY_PARTITION', (event, {partition, opt = {}} = {}) => {
    if (!partition) {
        event.returnValue = {
            error: true,
            message: 'lack of partition'
        };
        return;
    };
    session.fromPartition(partition).cookies.get(opt, (err, cookies) => {
        if (err) {
            event.returnValue = {
                error: true,
                message: err.message
            };
            return;
        }
        event.returnValue = cookies;
    });
});

ipcMain.on('SET_PARTITION_COOKIES', (event, {partition, cookies = []}) => {
    if (!partition) {
        event.returnValue = {
            error: true,
            message: 'lack of partition'
        };
        return;
    };
    const webviewCookies = session.fromPartition(partition).cookies;
    cookies.map((cookie) => {
        webviewCookies.set(cookie, (err) => {
            if (err) console.log('[set cookie error:]', cookie);
        });
    });
    event.returnValue = true;
});

ipcMain.on('HANDLE_BEFORE_REQUEST_BY_PARTITION', (event, {partition, filter = {}}) => {
    function handler (details, cb) {
        let uploadData = [];
        if (details.uploadData) {
            uploadData = details.uploadData.map(
                item => querystring.parse(item.bytes.toString('utf-8'))
            );
        }
        event.sender.send(`HANDLE_BEFORE_REQUEST_${partition}`, uploadData);
        cb({cancel: false});
    }
    session.fromPartition(partition).webRequest.onBeforeRequest(filter, handler);
});
