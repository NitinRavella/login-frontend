export const isAuthenticated = () => {
    console.log('checking authentication status', sessionStorage.getItem('token'));
    return !!sessionStorage.getItem('token');
};

export const saveAuthInfo = (token, isAdmin) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('isAdmin', isAdmin);
};

export const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('isAdmin');
};
