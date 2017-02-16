import {combineReducers} from 'redux';
import passport from './passport';
import editor from './editor';
import platforms from './platforms';

export default combineReducers({
    passport,
    editor,
    platforms
});
