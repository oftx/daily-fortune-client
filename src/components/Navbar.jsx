import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useUI } from '../context/UIContext'; // Import useUI

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isNavbarVisible } = useUI(); // Get visibility state
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Add a 'hidden' class when the navbar should not be visible
  const navbarClassName = `navbar ${!isNavbarVisible ? 'hidden' : ''}`;

  return (
    <nav className={navbarClassName}>
      <Link to="/" className="nav-brand">DailyFortune</Link>
      <div className="nav-links">
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <Link to="/leaderboard" className="nav-item">{t('leaderboard')}</Link>
        {isAuthenticated ? (
          <div className="nav-item user-menu">
            <span>{user.username}</span>
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
  );
};

export default Navbar;