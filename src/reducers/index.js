import {combineReducers} from 'redux';
import passport from './passport';
import editor from './editor';
import upstreams from './upstreams';
import articles from './articles';
import reproduction from './reproduction';

import adminArticles from './admin/articles';
import adminEditor from './admin/editor';
import users from './users';
import manager from './manager';

export default combineReducers({
    reproduction,
    passport,
    users,
    editor,
    articles,
    adminArticles,
    adminEditor,
    upstreams,
    manager
});
