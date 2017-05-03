const {
    API_PREFIX = 'http://120.27.24.55/api',
    // API_PREFIX: 'https://content-distribution.apps.xiaoyun.com/api',
    FILESERVER_PREFIX = 'http://op1u2nuef.bkt.clouddn.com',
    QINIU_UPLOAD_PREFIX = 'http://upload.qiniu.com'
} = process.env;

export default {
    API_PREFIX,
    FILESERVER_PREFIX,
    QINIU_UPLOAD_PREFIX
};
