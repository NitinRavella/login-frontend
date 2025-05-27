// src/redux/actions/authActions.js
export const loginSuccess = (token, isAdmin) => {
    sessionStorage.setItem('isAdmin', isAdmin);
    sessionStorage.setItem("token", token);

    return {
        type: "LOGIN_SUCCESS",
        payload: { isAdmin, token },
    };
};


export const logoutUser = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("isAdmin");

    return {
        type: "LOGOUT",
    };
};
