import {combineReducers} from 'redux';
import passport from './passport';
import editor from './editor';
import upstreams from './upstreams';
import articles from './articles';

export default combineReducers({
    passport,
    editor,
    upstreams,
    articles
});
