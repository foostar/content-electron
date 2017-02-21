import {combineReducers} from 'redux';
import passport from './passport';
import editor from './editor';
import upstreams from './upstreams';
import articles from './articles';
import adminArticles from './admin/articles';
import adminEditor from './admin/editor';
import users from './users';

export default combineReducers({
    passport,
    users,
    editor,
    articles,
    adminArticles,
    adminEditor,
    upstreams
});
