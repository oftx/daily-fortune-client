import React, { createContext, useState, useContext, useCallback } from 'react';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isAutoHideEnabled, setIsAutoHideEnabled] = useState(false);
  // *** NEW: State to temporarily ignore mouse events ***
  const [isMouseFrozen, setIsMouseFrozen] = useState(false);

  const showNavbar = useCallback(() => setIsNavbarVisible(true), []);
  const hideNavbar = useCallback(() => setIsNavbarVisible(false), []);

  const setAutoHide = useCallback((isEnabled) => {
    setIsAutoHideEnabled(isEnabled);
    if (!isEnabled) {
      setIsNavbarVisible(true);
    }
  }, []);

  // *** NEW: Function to freeze mouse tracking for 500ms ***
  const freezeMouseEvents = useCallback(() => {
    setIsMouseFrozen(true);
    setTimeout(() => setIsMouseFrozen(false), 500);
  }, []);

  const value = {
    isNavbarVisible,
    showNavbar,
    hideNavbar,
    isAutoHideEnabled,
    setAutoHide,
    isMouseFrozen, // Export the state
    freezeMouseEvents, // Export the function
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};