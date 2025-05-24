export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export const saveAuthInfo = (token, isAdmin) => {
    localStorage.setItem('token', token);
    localStorage.setItem('isAdmin', isAdmin);
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
};
