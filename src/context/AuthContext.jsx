// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { setAccessToken, clearTokens } from '../utils/tokenManager';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  // const [token, setToken] = useState(localStorage.getItem('token')); // REMOVED
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.language && i18n.language !== user.language) {
      i18n.changeLanguage(user.language);
    }
  }, [user, i18n]);

  useEffect(() => {
    const initAuth = async () => {
      // Optimistically try to refresh the token first to avoid initial 401 on getMyProfile
      // This is because we don't have the access token in memory on reload, 
      // but we might have a valid cookie.
      try {
        const refreshResponse = await api.refreshToken();
        if (refreshResponse.success) {
          // If refresh succeeded, we are logged in. Now fetch profile.
          // access token is already set in memory by api.refreshToken()
          const response = await api.getMyProfile();
          if (response.success) {
            setUser(response.data.user);
          } else {
            // Weird state: refresh worked but profile fetch failed?
            // Maybe network error or something.
            setUser(null);
            clearTokens();
          }
        } else {
          // Refresh failed (likely 401), so user is not logged in.
          // We do nothing, just leave user as null.
          clearTokens();
          setUser(null);
        }
      } catch (e) {
        clearTokens();
        setUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, []); // Run once on mount

  const login = (userData, accessToken) => {
    setAccessToken(accessToken);
    // Refresh token is handled by cookie
    setUser(userData);
    if (userData.language && i18n.language !== userData.language) {
      i18n.changeLanguage(userData.language);
    }
  };

  const logout = async () => {
    try {
      await api.logout(); // Call backend to clear cookie
    } catch (e) {
      console.error("Logout failed", e);
    }
    setUser(null);
    clearTokens();
    // Use window location to ensure complete reset if desired, or just navigate
    // But since this is context, consuming components might use navigate.
    // However, api.js might force redirect on failure.
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  // No longer needed to expose updateToken directly usually, but if needed:
  // const updateToken = ... (handled internally by api.js mostly)

  const authContextValue = {
    user,
    // token, // We don't necessarily need to expose the raw token string anymore, but if components need it, they can use getAccessToken() from utils if really needed.
    // For now, let's remove it from context to encourage using api client.
    login,
    logout,
    updateUser,
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