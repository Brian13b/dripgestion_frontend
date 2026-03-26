import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = async () => {
    const token = authService.getToken();
    if (token) {
      try {
        const userData = await authService.getMe();
        setUser(userData);
      } catch (error) {
        authService.logout();
      }
    }
    setLoading(false);
  };

  useEffect(() => { checkAuth(); }, []);

  const login = async (username, password, tenantId) => {
    const data = await authService.login(username, password, tenantId);
    const userData = await authService.getMe();
    setUser(userData);
    return userData;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};