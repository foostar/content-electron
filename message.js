const {session, ipcMain, webContents} = require('electron');
// const querystring = require('querystring');
// const request = require('request');

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

ipcMain.on('GET_REPONSE_BODY_BY_ID', (event, {id, url}) => {
    console.log(typeof id, id);
    console.log(webContents.getAllWebContents());
    const contents = webContents.fromId(id);
    console.log(contents);

    // try {
    //     contents.debugger.attach('1.1');
    // } catch (err) {
    //     console.log('Debugger attach failed : ', err);
    // }

    // contents.debugger.on('detach', (event, reason) => {
    //     console.log('Debugger detached due to : ', reason);
    // });

    // contents.debugger.on('message', (event, method, params) => {
    //     if (method == 'Network.responseReceived' && params.type == 'XHR') {
    //         // Code here.
    //         console.log(params);
    //     }
    // });

    // contents.debugger.sendCommand('Network.enable');
});

// ipcMain.on('HANDLE_BEFORE_REQUEST_BY_PARTITION', (event, {partition, filter = {}}) => {
//     console.log({partition});
//     const {webContents} = session.  (partition);
//     console.log(webContents);

    // webRequest.onBeforeSendHeaders(filter, beforeSendHeadersHandler);
    // webRequest.onBeforeRequest(filter, beforeRequestHandler);

    // function beforeSendHeadersHandler (details, cb) {
    //     requestHeaders = details.requestHeaders;
    //     cb({cancel: false});
    // }

    // function beforeRequestHandler (details, cb) {
    //     let uploadData;
    //     const {url, method} = details;
    //     if (details.uploadData) {
    //         uploadData = details.uploadData.map(
    //             item => querystring.parse(item.bytes.toString('utf-8'))
    //         );
    //     }
    //     // console.log({uploadData});
    //     console.log(Object.keys(uploadData[0]));
    //     console.log({url, method, requestHeaders});
    //     request({url, method, headers: requestHeaders, formData: uploadData[0]}, (err, res, body) => {
    //         if (err) {
    //             console.log(err);
    //         }
    //         console.log('-----------------------------');
    //         console.log(body);
    //         console.log('+++++++++++++++++++++++++++++');
    //     });
    //     cb({cancel: true});
    // }
// });
