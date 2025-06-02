// src/redux/reducers/authReducer.js
const initialState = {
    token: sessionStorage.getItem('token') || null,
    role: sessionStorage.getItem('role') || null,
    isAuthenticated: !!sessionStorage.getItem('token'),
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            sessionStorage.setItem('token', action.payload.token);
            sessionStorage.setItem('role', action.payload.role);

            return {
                ...state,
                token: action.payload.token,
                role: action.payload.role,
                isAuthenticated: true
            };
        case 'LOGOUT':
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('role');

            return {
                token: null,
                role: null,
                isAuthenticated: false
            };
        default:
            return state;
    }
};

export default authReducer;
