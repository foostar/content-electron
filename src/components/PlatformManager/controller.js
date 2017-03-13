import {platformsById} from 'lib/platforms';
import _ from 'lodash';

export default {
    platforms: [],
    add (id, account, options) {
        const {platforms} = this;
        const op = _.find(platforms, x => x.id === account.id);
        if (op) {
            console.warn(`账号 ${account.account} 已存在!`);
            return op;
        };
        const platform = new platformsById[id].Class(account, options);
        platforms.push(platform);
        return platform;
    },
    get (id) {
        return _.find(this.platforms, x => x.id === id);
    }
};
