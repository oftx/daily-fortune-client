import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // 如果用户未登录，重定向到登录页，并记录他们想去的页面
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (adminOnly && user.role !== 'admin') {
    // 如果需要管理员权限但用户不是管理员，重定向到他们的主页
    return <Navigate to="/me" replace />;
  }

  return children;
};

export default ProtectedRoute;