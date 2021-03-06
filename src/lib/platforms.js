import OMQQPlatform from 'lib/platforms/omqq-platform';
import BaijiaPlatform from 'lib/platforms/baijia-platform';
import UCPlatform from 'lib/platforms/uc-platform';
import NetEasePlatform from 'lib/platforms/netease-platform';
import SohuPlanform from 'lib/platforms/sohu-platform';

import qieLogo from './logos/platform-omqq.png';
import baijiaLogo from './logos/platform-baijiahao.png';
import toutiaoLogo from './logos/platform-toutiao.png';
import yidianLogo from './logos/platform-yidianzixun.png';
import wechatLogo from './logos/platform-weixin.png';
import ucLogo from './logos/platform-uc.png';
import qqLogo from './logos/platform-qq.png';
import sohuLogo from './logos/platform-sohu.png';
import weiboLogo from './logos/platform-weibo.png';
import zhihuLogo from './logos/platform-zhihu.png';
import jianshuLogo from './logos/platform-jianshu.png';
import neteaseLogo from './logos/platform-wangyi.png';

const platforms = [{
    id: 'baijia',
    name: '百家号',
    logo: baijiaLogo,
    Class: BaijiaPlatform
}, {
    id: 'omqq',
    name: '企鹅媒体平台',
    logo: qieLogo,
    Class: OMQQPlatform
}, {
    id: 'uc',
    name: 'UC云观',
    logo: ucLogo,
    Class: UCPlatform
}, {
    id: 'netease',
    name: '网易',
    logo: neteaseLogo,
    Class: NetEasePlatform
}, {
    id: 'sohu',
    name: '搜狐公众平台',
    logo: sohuLogo,
    Class: SohuPlanform
}, {
    id: 'toutiao',
    name: '头条号',
    logo: toutiaoLogo,
    disabled: true
}, {
    id: 'yidian',
    name: '一点号',
    logo: yidianLogo,
    disabled: true
}, {
    id: 'wechat',
    name: '微信公众号',
    logo: wechatLogo,
    disabled: true
}, {
    id: 'qq',
    name: 'QQ公众平台',
    logo: qqLogo,
    disabled: true
}, {
    id: 'sina',
    name: '新浪微博',
    logo: weiboLogo,
    disabled: true
}, {
    id: 'zhihu',
    name: '知乎',
    logo: zhihuLogo,
    disabled: true
}, {
    id: 'jianshu',
    name: '简书',
    logo: jianshuLogo,
    disabled: true
}];

const platformsById = {};
platforms.forEach(x => (platformsById[x.id] = x));

export default platforms;
export {
    platformsById
};
