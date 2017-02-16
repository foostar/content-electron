import {combineReducers} from 'redux';
import passport from './passport';
import editor from './editor';
import platforms from './cookies';

export default combineReducers({
    passport,
    editor,
    platforms
});
