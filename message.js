const {session, ipcMain} = require('electron');

ipcMain.on('GET_COOKIES_BY_PARTITION', (event, partition) => {
    if (!partition) {
        event.returnValue = {
            error: true,
            message: 'lack of partition'
        };
        return;
    };
    session.fromPartition(partition).cookies.get({
        url: 'http://console.apps.xiaoyun.com'
    }, (err, cookies) => {
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

ipcMain.on('SET_PARTITION_COOKIES', (event, {partition, values}) => {
    if (!partition) {
        event.returnValue = {
            error: true,
            message: 'lack of partition'
        };
        return;
    };
    console.log({values});

    const webviewCookies = session.fromPartition(partition).cookies;
    values.map(cookie => {
        webviewCookies.set(Object.assign(cookie, {
            url: 'http://console.apps.xiaoyun.com'
        }), console.log);
    });
    event.returnValue = true;
});

