const {session, ipcMain} = require('electron');

ipcMain.on('GET_COOKISES_BY_PARTITION_REQUEST', (event, data) => {
    if (!data) return;
    console.log(data);
    const {account, platform, partition} = data;
    session.fromPartition(partition).cookies.get({}, (err, cookies) => {
        if (err) return;
        event.sender.send(
            'GET_COOKISES_BY_PARTITION_SUCCESS',
            {
                account,
                platform,
                cookies
            }
        );
    });
});

