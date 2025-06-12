import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { showToast } from '../utils/toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      validateToken(token);
          } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await api.get('/admin/me');
      if (response.data.success) {
        setAdmin(response.data.data);
        setIsAuthenticated(true);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Token validation error:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post('/admin/login', {
        email,
        password
      });

      if (response.data.success) {
        const { token, admin: adminData } = response.data;
        
        if (!token || !adminData) {
          showToast('Invalid response from server', { type: 'error' });
          return false;
        }

        localStorage.setItem('token', token);
        setAdmin(adminData);
        setIsAuthenticated(true);
        showToast('Login successful!', { type: 'success' });
        
        // Navigate to dashboard after successful login
        navigate('/dashboard', { replace: true });
        return true;
      } else {
        showToast(response.data.message || 'Login failed', { type: 'error' });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast(
        error.response?.data?.error || 
        error.message || 
        'Login failed. Please try again.', 
        { type: 'error' }
      );
      return false;
    }
  }, [navigate]);

  const register = useCallback(async (formData) => {
    try {
      const response = await api.post('/admin/register', formData);

      if (response.data.success) {
        const { token, admin: adminData } = response.data;

        if (!token || !adminData) {
          showToast('Invalid response from server', { type: 'error' });
          return false;
        }

        localStorage.setItem('token', token);
        setAdmin(adminData);
        setIsAuthenticated(true);
        showToast('Registration successful!', { type: 'success' });
        navigate('/dashboard', { replace: true });
        return true;
      } else {
        showToast(response.data.message || 'Registration failed', { type: 'error' });
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      showToast(
        error.response?.data?.error || 
        error.message || 
        'Registration failed. Please try again.', 
        { type: 'error' }
      );
      return false;
    }
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setAdmin(null);
    setIsAuthenticated(false);
    showToast('Logged out successfully', { type: 'success' });
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo(() => ({
    isAuthenticated,
    admin,
    loading,
    login,
    register,
    logout: handleLogout
  }), [isAuthenticated, admin, loading, login, register, handleLogout]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
