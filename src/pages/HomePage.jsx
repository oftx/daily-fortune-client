// src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FORTUNE_COLORS } from '../utils/constants';
import { darkenColor } from '../utils/colorUtils';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';
import Modal from '../components/Modal';
import { drawFortuneLocally } from '../utils/fortuneUtils';

const HomePage = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { setAutoHide, hideNavbar, freezeMouseEvents } = useUI();
  const [fortune, setFortune] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [dynamicStyle, setDynamicStyle] = useState({});
  
  // --- NEW: State for countdown ---
  const [nextDrawAt, setNextDrawAt] = useState(null);
  const [countdown, setCountdown] = useState('');

  // Effect to fetch user's draw status when the page loads
  useEffect(() => {
    const checkUserStatus = async () => {
      if (isAuthenticated) {
        const response = await api.getMyProfile();
        // --- MODIFIED: Adjust to the new response structure ---
        if (response.success && response.data.user && response.data.user.has_drawn_today) {
          setFortune(response.data.user.todays_fortune);
          setNextDrawAt(response.data.next_draw_at); // Get time from the outer object
          setAutoHide(true);
          hideNavbar();
        }
      }
    };
    checkUserStatus();
  }, [isAuthenticated, setAutoHide, hideNavbar]);

  // Effect to manage the countdown timer
  useEffect(() => {
    if (!nextDrawAt) {
      setCountdown('');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const target = new Date(nextDrawAt);
      const diff = target - now;

      if (diff <= 0) {
        setCountdown('00:00:00');
        clearInterval(interval);
        // Reset the page state to allow a new draw
        setFortune(null);
        setNextDrawAt(null);
        setAutoHide(false);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formattedCountdown = 
        `${String(hours).padStart(2, '0')}:` +
        `${String(minutes).padStart(2, '0')}:` +
        `${String(seconds).padStart(2, '0')}`;
      
      setCountdown(formattedCountdown);
    }, 1000);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [nextDrawAt, setAutoHide]);

  useEffect(() => {
    return () => {
      setAutoHide(false);
    };
  }, [setAutoHide]);

  useEffect(() => {
    if (!fortune) {
      setDynamicStyle({});
      return;
    }
    const fortuneInfo = FORTUNE_COLORS[fortune];
    if (!fortuneInfo) return;
    const vibrantBaseColor = fortuneInfo.background;
    if (theme === 'dark') {
      setDynamicStyle({ backgroundColor: darkenColor(vibrantBaseColor, 20), color: '#d1d1d1' });
    } else {
      setDynamicStyle({ backgroundColor: vibrantBaseColor, color: fortuneInfo.text });
    }
  }, [fortune, theme]);

  const handleDraw = async () => {
    setIsLoading(true);

    if (isAuthenticated) {
      const response = await api.drawFortune();
      if (response.success) {
        setFortune(response.data.fortune);
        setNextDrawAt(response.data.next_draw_at); // <-- Set next draw time from the response
        freezeMouseEvents();
        setAutoHide(true);
        hideNavbar();
      } else {
        setModalMessage(response.error || "An unknown error occurred.");
        setIsModalOpen(true);
      }
    } else {
      const localFortune = drawFortuneLocally();
      setFortune(localFortune);
      freezeMouseEvents();
      setAutoHide(true);
      hideNavbar();
    }

    setIsLoading(false);
  };
  
  return (
    <>
      <div className="home-container" style={dynamicStyle}>
        {fortune ? (
          <div className="result-display">
            <div className="result-backdrop-bar" />
            <span className="fortune-description">{t('yourTodayFortuneIs')}</span>
            <span className="fortune-value">{fortune}</span>
            {/* --- NEW: Display countdown timer --- */}
            {countdown && (
              <p style={{ marginTop: '2rem', fontSize: '1.2rem' }}>
                {t('nextDrawLabel')}: {countdown}
              </p>
            )}
          </div>
        ) : (
          <button onClick={handleDraw} disabled={isLoading} className="draw-button">
            {isLoading ? t('drawing') : t('draw')}
          </button>
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('error')}>
        <p>{modalMessage}</p>
      </Modal>
    </>
  );
};

export default HomePage;