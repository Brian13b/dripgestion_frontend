import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          console.error("Token inválido o expirado");
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (username, password, tenantId) => {
    try {
      const { access_token } = await authService.login(username, password, tenantId);
      localStorage.setItem('token', access_token);

      const userData = await authService.getMe();
      setUser(userData);
      
      if (userData.role?.toUpperCase() === 'CLIENTE') {
        navigate('/mi-portal');
      } else {
        navigate('/dashboard');
      }
      return { success: true };

    } catch (error) {
      return { success: false, error: "Credenciales incorrectas para esta empresa" };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Cargando Arlestin...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};