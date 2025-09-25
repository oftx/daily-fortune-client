import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FORTUNE_COLORS } from '../utils/constants';
import { darkenColor } from '../utils/colorUtils';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';
import Modal from '../components/Modal';
// --- NEW: Import the local draw function ---
import { drawFortuneLocally } from '../utils/fortuneUtils';

const HomePage = () => {
  const { t } = useTranslation();
  // --- MODIFIED: We now need 'isAuthenticated' to make a decision ---
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
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
    if (!fortuneInfo) return; // Defensive check
    const vibrantBaseColor = fortuneInfo.background;
    if (theme === 'dark') {
      setDynamicStyle({ backgroundColor: darkenColor(vibrantBaseColor, 20), color: '#d1d1d1' });
    } else {
      setDynamicStyle({ backgroundColor: vibrantBaseColor, color: fortuneInfo.text });
    }
  }, [fortune, theme]);

  const handleDraw = async () => {
    setIsLoading(true);

    // --- MODIFIED: Core logic change is here ---
    if (isAuthenticated) {
      // If the user is logged in, call the API to save the result
      const response = await api.drawFortune();
      if (response.success) {
        setFortune(response.data.fortune);
        // Trigger the immersive UI effect
        freezeMouseEvents();
        setAutoHide(true);
        hideNavbar();
      } else {
        setModalMessage(response.error || "An unknown error occurred.");
        setIsModalOpen(true);
      }
    } else {
      // If the user is not logged in, draw locally
      const localFortune = drawFortuneLocally();
      setFortune(localFortune);
      // Also trigger the immersive UI effect
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