import {
    USER_LOADED,
    USER_LOADING,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT_SUCCESS,
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    GET_USER,
    USER_FAIL
} from '../actions/type';

const initialState={
    token:localStorage.getItem('token'),
    isAuthenticated:null,
    isLoading:false,
    user:null
};

export default function (state=initialState, action){
    switch (action.type) {
        case USER_LOADING:
            return{
                ...state,
                isLoading:true
            };

        case USER_LOADED:
            return{
               ...state,
                isAuthenticated: "authenticated",
                isLoading:false,
                user:action.payload
            };
        case LOGIN_SUCCESS:
            localStorage.setItem('token', action.payload.token);
            return{
                ...state,
                ...action.payload,
                isAuthenticated: "authorized",
                isLoading:false,
                user:action.payload.user

            };
        case REGISTER_SUCCESS:
            return{
                ...state,
                ...action.payload,
                isAuthenticated: "authenticated",
                isLoading:false,
                user:action.payload.user

            };
        case LOGIN_FAIL:
        case AUTH_ERROR:
            localStorage.removeItem('token');
            return{
                ...state,
                token: null,
                isAuthenticated: null,
                isLoading:false,
                user:null
            };
        case REGISTER_FAIL:
            return{
                ...state,
                token: null,
                isAuthenticated: null,
                isLoading:false,
                user:null
            };
        case LOGOUT_SUCCESS:
            localStorage.removeItem('token');
            return{
                ...state,
                token: null,
                isAuthenticated: null,
                isLoading:false,
                user:null
            };
        case GET_USER:
            return{
                ...state,
                user:action.payload
            };
        case USER_FAIL:
            return{
                ...state
            };

        default:
            return state;
    }

}
