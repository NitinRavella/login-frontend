// src/redux/actions/authActions.js
export const loginSuccess = (token, role, userId) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("role", role);
    sessionStorage.setItem("userId", userId)

    return {
        type: "LOGIN_SUCCESS",
        payload: { token, role },
    };
};

export const logoutUser = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem('userId')

    return {
        type: "LOGOUT",
    };
};
