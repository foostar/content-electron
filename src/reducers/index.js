import {combineReducers} from 'redux';
import passport from './passport';
import editor from './editor';
import upstreams from './upstreams';
import articles from './articles';
import users from './users';

export default combineReducers({
    passport,
    users,
    editor,
    upstreams,
    articles
});
