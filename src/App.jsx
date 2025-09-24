import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UIProvider, useUI } from './context/UIContext';
import { Tooltip } from 'react-tooltip';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import MePage from './pages/MePage';
import AdminPage from './pages/AdminPage';

const AppContent = () => {
  // *** Get the new isMouseFrozen state from the context ***
  const { isAutoHideEnabled, showNavbar, hideNavbar, isMouseFrozen } = useUI();

  useEffect(() => {
    const handleMouseMove = (event) => {
      // *** MODIFIED: The listener now checks the frozen state ***
      if (!isAutoHideEnabled || isMouseFrozen) return;
      
      if (event.clientY < 60) {
        showNavbar();
      } else {
        hideNavbar();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isAutoHideEnabled, showNavbar, hideNavbar, isMouseFrozen]); // Add isMouseFrozen to dependency array

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/daily-fortune-client" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/@:username" element={<ProfilePage />} />
        <Route path="/me" element={<ProtectedRoute><MePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminPage /></ProtectedRoute>} />
      </Routes>
      <Tooltip id="heatmap-tooltip" />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <Router>
          <AppContent />
        </Router>
      </UIProvider>
    </AuthProvider>
  );
}

export default App;