import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { getToken, setToken, getUser, setUser, clearAuth } from '../utils/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setCurrentUser] = useState(getUser());
  const [token, setCurrentToken] = useState(getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      if (storedToken) {
        try {
          const res = await authApi.getProfile();
          if (res.data?.success) {
            setCurrentUser(res.data.data);
            setUser(res.data.data);
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          clearAuth();
          setCurrentUser(null);
          setCurrentToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data?.success) {
      const { token: jwt, user: authUser } = res.data.data;
      setToken(jwt);
      setUser(authUser);
      setCurrentToken(jwt);
      setCurrentUser(authUser);
      return authUser;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    if (res.data?.success) {
      const { token: jwt, user: authUser } = res.data.data;
      setToken(jwt);
      setUser(authUser);
      setCurrentToken(jwt);
      setCurrentUser(authUser);
      return authUser;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = () => {
    clearAuth();
    setCurrentToken(null);
    setCurrentUser(null);
  };

  const updateProfile = async (name) => {
    const res = await authApi.updateProfile({ name });
    if (res.data?.success) {
      const updated = res.data.data;
      setUser(updated);
      setCurrentUser(updated);
      return updated;
    }
    throw new Error(res.data?.message || 'Failed to update profile');
  };

  const normalizedRole = String(user?.role ?? user?.authorities?.[0]?.authority ?? '').toUpperCase().replace(/^ROLE_/, '');
  const isAdmin = normalizedRole === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
