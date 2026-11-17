import React, { createContext, useContext, useState, useEffect } from 'react';
import { alertasApi, acompanamientoApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ied_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('ied_user');
    const savedToken = localStorage.getItem('ied_token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        console.error('Error restoring session:', e);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // First attempt authentication against alertas-service (primary identity provider)
      let response;
      try {
        response = await alertasApi.post('/auth/login', { email, password });
      } catch (err) {
        // Fallback to acompanamiento-service if necessary
        response = await acompanamientoApi.post('/auth/login', { email, password });
      }

      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('ied_token', receivedToken);
      localStorage.setItem('ied_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Error al iniciar sesión';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('ied_token');
    localStorage.removeItem('ied_user');
    setUser(null);
    setToken(null);
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (user.role === 'Administrador') return true; // Administrator has unrestricted access
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      hasRole,
      isAuthenticated: !!token && !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
