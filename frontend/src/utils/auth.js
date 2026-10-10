const TOKEN_KEY = 'shopnest_token';
const USER_KEY = 'shopnest_user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

export const setUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const isAdmin = () => {
  const user = getUser();
  return user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';
};
