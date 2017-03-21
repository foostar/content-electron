const {
    API_PREFIX = 'https://content-distribution.apps.xiaoyun.com/api',
    FILESERVER_PREFIX = 'https://distribution-file.apps.xiaoyun.com',
    QINIU_UPLOAD_PREFIX = 'https://upload.qiniu.com'
} = process.env;

export default {
    API_PREFIX,
    FILESERVER_PREFIX,
    QINIU_UPLOAD_PREFIX
};
