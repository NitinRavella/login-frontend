// src/redux/reducers/authReducer.js
const initialState = {
    token: sessionStorage.getItem('token') || null,
    isAdmin: sessionStorage.getItem('isAdmin') === 'true',
    isAuthenticated: !!sessionStorage.getItem('token'),
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                token: action.payload.token,
                isAdmin: action.payload.isAdmin,
                isAuthenticated: true
            };
        case 'LOGOUT':
            return {
                token: null,
                isAdmin: false,
                isAuthenticated: false
            };
        default:
            return state;
    }
};

export default authReducer;
