import {combineReducers} from 'redux';
import itemReducer from './itemReducer';
import erroReducer from './erroReducer';
import authReducer from './authReducer';

export default combineReducers(({
    item: itemReducer,
    error: erroReducer,
    auth: authReducer

}))