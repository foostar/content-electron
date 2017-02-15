export const WEBVIEW_EVENT = [
    'load-commit',
    'did-finish-load',
    'did-fail-load',
    'did-frame-finish-load',
    'did-start-loading',
    'did-stop-loading',
    'did-get-response-details',
    'did-get-redirect-request',
    // 'dom-ready', // handle by self
    'page-title-updated',
    'page-favicon-updated',
    'enter-html-full-screen',
    'leave-html-full-screen',
    'console-message',
    'found-in-page',
    'new-window',
    'will-navigate',
    'did-navigate',
    'did-navigate-in-page',
    'close',
    'ipc-message',
    'crashed',
    'gpu-crashed',
    'plugin-crashed',
    'destroyed',
    'media-started-playing',
    'media-paused',
    'did-change-theme-color',
    'update-target-url',
    'devtools-opened',
    'devtools-closed',
    'devtools-focused'
];

export const AVAILABLE_SETATTRIBUTES = [
    'partition',
    'disablewebsecurity',
    'useragent',
    'httpreferrer',
    'preload',
    'nodeintegration',
    'autosize',
    'allowpopups',
    'webpreferences',
    'blinkfeatures'
];

