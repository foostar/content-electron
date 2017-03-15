import {combineReducers} from 'redux';
import passport from './passport';
import upstreams from './upstreams';
import contents from './contents';
import reproduction from './reproduction';
import adminContents from './admin/contents';
import users from './users';

export default combineReducers({
    reproduction,
    passport,
    users,
    contents,
    adminContents,
    upstreams
});
