import {combineReducers} from 'redux';
import passport from './passport';
import editor from './editor';
import platforms from './cookies';
import articles from './articles';
import adminArticles from './admin/articles';
import adminEditor from './admin/editor';

export default combineReducers({
    passport,
    editor,
    platforms,
    articles,
    adminArticles,
    adminEditor
});
