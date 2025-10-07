// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.language && i18n.language !== user.language) {
      i18n.changeLanguage(user.language);
    }
  }, [user, i18n]);

  useEffect(() => {
    const fetchUser = async () => {
      if (token && !user) {
        const response = await api.getMyProfile();
        if (response.success) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token, user]);

  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);
    if (userData.language && i18n.language !== userData.language) {
      i18n.changeLanguage(userData.language);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  // --- NEW: Function to update only the token ---
  const updateToken = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const authContextValue = {
    user,
    token,
    login,
    logout,
    updateUser,
    updateToken, // <-- EXPORT THE NEW FUNCTION
    isAuthenticated: !!user,
  };

  if (loading) {
    return <div>{t('loadingApp')}</div>;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};