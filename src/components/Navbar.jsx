// src/components/Navbar.jsx

import React, { useState } from 'react'; // Import useState
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';
import ConfirmModal from './ConfirmModal'; // Import the new component

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isNavbarVisible } = useUI();
  const navigate = useNavigate();

  // --- NEW: State for the confirmation modal ---
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // --- MODIFIED: This now opens the modal ---
  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };
  
  // --- NEW: This function performs the actual logout ---
  const confirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    navigate('/login');
  };

  const navbarClassName = `navbar ${!isNavbarVisible ? 'hidden' : ''}`;

  return (
    <>
      <nav className={navbarClassName}>
        <Link to="/" className="nav-brand">{t('navBrand')}</Link>
        <div className="nav-links">
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === 'light' ? '☀️' : '🌙'}
          </button>
          <Link to="/leaderboard" className="nav-item">{t('leaderboard')}</Link>
          {isAuthenticated ? (
            <div className="nav-item user-menu">
              <Link to="/me" className="nav-item">
                <span>{user.display_name}</span>
              </Link>
              <div className="dropdown">
                <Link to="/me">{t('profile')}</Link>
                <Link to="/settings">{t('settings')}</Link>
                <button onClick={handleLogout}>{t('logout')}</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="nav-item login-btn">{t('login')}</Link>
          )}
        </div>
      </nav>

      {/* --- NEW: Render the confirmation modal --- */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
      >
        <p>Are you sure you want to log out?</p>
      </ConfirmModal>
    </>
  );
};

export default Navbar;