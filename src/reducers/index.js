import {combineReducers} from 'redux';
import passport from './passport';
import editor from './editor';

export default combineReducers({
    passport,
    editor
});
