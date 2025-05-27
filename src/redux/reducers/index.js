import { combineReducers } from 'redux';
import authReducer from './authReducer';

const rootReducer = combineReducers({
    auth: authReducer // you can add more reducers here
});

export default rootReducer;
