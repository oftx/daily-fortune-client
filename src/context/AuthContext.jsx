// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api'; // 引入API

// 核心修复：确保 AuthContext 被正确导出
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地是否有token
    const localToken = localStorage.getItem('token');
    if (localToken) {
      setToken(localToken);
      // 在真实应用中，这里应该有一个API调用来验证token并获取用户信息
      // 为了模拟，我们假设token有效并设置一个假用户
      // api.getMe(localToken).then(response => { ... });
      const mockUser = { username: 'testuser', role: 'user' }; 
      if (localToken === 'fake-admin-token') {
          mockUser.username = 'admin';
          mockUser.role = 'admin';
      }
      setUser(mockUser);
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const authContextValue = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user,
  };

  // 在加载状态结束前，不渲染子组件，避免页面闪烁
  if (loading) {
    return <div>Loading Application...</div>;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};