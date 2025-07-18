// src/redux/actions/authActions.js
export const loginSuccess = (token, role, userId, name, email) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("role", role);
    sessionStorage.setItem("userId", userId);
    sessionStorage.setItem('username', name);
    sessionStorage.setItem('userEmail', email);


    return {
        type: "LOGIN_SUCCESS",
        payload: { token, role },
    };
};

export const logoutUser = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('username');


    return {
        type: "LOGOUT",
    };
};
