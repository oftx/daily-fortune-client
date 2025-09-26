// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { t, i18n } = useTranslation(); // <-- Get the i18n instance
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // --- NEW: useEffect to sync user's language preference ---
  useEffect(() => {
    // If we have a user object and their language preference is different
    // from the current i18n language, then update i18n.
    if (user && user.language && i18n.language !== user.language) {
      i18n.changeLanguage(user.language);
    }
  }, [user, i18n]); // Dependencies: run this effect when user or i18n instance changes

  useEffect(() => {
    const fetchUser = async () => {
      if (token && !user) {
        const response = await api.getMyProfile();
        if (response.success) {
          setUser(response.data.user); // <-- MODIFIED: Use the nested user object
        } else {
          // If fetching profile fails (e.g., token expired), log out.
          localStorage.removeItem('token');
          setToken(null);
          setUser(null); // Ensure user state is cleared
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
    // On login, immediately set the language
    if (userData.language && i18n.language !== userData.language) {
      i18n.changeLanguage(userData.language);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // --- NEW: Function to update user data in context ---
  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  const authContextValue = {
    user,
    token,
    login,
    logout,
    updateUser, // <-- EXPORT THE NEW FUNCTION
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