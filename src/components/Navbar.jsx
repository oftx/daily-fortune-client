// src/components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';
import ConfirmModal from './ConfirmModal';
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  // --- MODIFIED: Import pause and resume functions ---
  const { isNavbarVisible, pauseNavInteraction, resumeNavInteraction } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };
  
  const confirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    navigate('/login');
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navbarClassName = `navbar ${!isNavbarVisible ? 'hidden' : ''}`;

  return (
    <>
      {/* --- MODIFIED: Add onMouseEnter and onMouseLeave handlers --- */}
      <nav 
        className={navbarClassName}
        onMouseEnter={pauseNavInteraction}
        onMouseLeave={resumeNavInteraction}
      >
        <Link to="/" className="nav-brand">{t('navBrand')}</Link>
        
        {/* --- DESKTOP NAVIGATION --- */}
        <div className="nav-links">
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
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === 'light' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* --- MOBILE MENU TOGGLE BUTTON --- */}
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Open menu">
          <FiMenu />
        </button>
      </nav>

      {/* --- MOBILE NAVIGATION MENU --- */}
      <div className={`mobile-nav-menu ${isMenuOpen ? 'open' : ''}`}>
        <button className="menu-close-btn" onClick={toggleMenu} aria-label="Close menu">
            <FiX />
        </button>

        <div className="mobile-nav-links">
          <Link to="/leaderboard" className="nav-item">{t('leaderboard')}</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/me" className="nav-item">{user.display_name}</Link>
              <Link to="/settings" className="nav-item">{t('settings')}</Link>
              <button onClick={handleLogout} className="nav-item">{t('logout')}</button>
            </>
          ) : (
            <Link to="/login" className="nav-item login-btn">{t('login')}</Link>
          )}
        </div>
        
        <div className="mobile-theme-toggle-wrapper">
            <button onClick={toggleTheme} className="theme-toggle-btn" style={{fontSize: '2rem'}}>
                {theme === 'light' ? '☀️' : '🌙'}
            </button>
        </div>
      </div>

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