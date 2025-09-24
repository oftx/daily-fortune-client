import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FORTUNE_COLORS } from '../utils/constants';
import { darkenColor } from '../utils/colorUtils';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';
import Modal from '../components/Modal';

const HomePage = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { theme } = useTheme();
  // *** Get the new freezeMouseEvents function ***
  const { setAutoHide, hideNavbar, freezeMouseEvents } = useUI();
  const [fortune, setFortune] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [dynamicStyle, setDynamicStyle] = useState({});

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
    const vibrantBaseColor = fortuneInfo.background;
    if (theme === 'dark') {
      setDynamicStyle({ backgroundColor: darkenColor(vibrantBaseColor, 20), color: '#d1d1d1' });
    } else {
      setDynamicStyle({ backgroundColor: vibrantBaseColor, color: fortuneInfo.text });
    }
  }, [fortune, theme]);

  const handleDraw = async () => {
    setIsLoading(true);
    const response = await api.drawFortune(token);
    if (response.success) {
      setFortune(response.data.fortune);
      
      // *** MODIFIED: Call all three functions in the correct order ***
      freezeMouseEvents(); // 1. Freeze mouse tracking
      setAutoHide(true);   // 2. Enable the auto-hide feature
      hideNavbar();        // 3. Immediately hide the navbar
    } else {
      setModalMessage(response.error || "An unknown error occurred.");
      setIsModalOpen(true);
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
          </div>
        ) : (
          <button onClick={handleDraw} disabled={isLoading} className="draw-button">
            {isLoading ? 'Drawing...' : t('draw')}
          </button>
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Error"><p>{modalMessage}</p></Modal>
    </>
  );
};

export default HomePage;