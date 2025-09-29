// src/context/UIContext.jsx

import React, { createContext, useState, useContext, useCallback } from 'react';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isAutoHideEnabled, setIsAutoHideEnabled] = useState(false);
  const [isMouseFrozen, setIsMouseFrozen] = useState(false);
  
  // *** NEW: State to pause auto-hide when hovering over the navbar/dropdown ***
  const [isNavInteractionPaused, setIsNavInteractionPaused] = useState(false);

  const showNavbar = useCallback(() => setIsNavbarVisible(true), []);
  const hideNavbar = useCallback(() => setIsNavbarVisible(false), []);

  const setAutoHide = useCallback((isEnabled) => {
    setIsAutoHideEnabled(isEnabled);
    if (!isEnabled) {
      setIsNavbarVisible(true);
    }
  }, []);

  const freezeMouseEvents = useCallback(() => {
    setIsMouseFrozen(true);
    setTimeout(() => setIsMouseFrozen(false), 500);
  }, []);
  
  // *** NEW: Functions to control the pause state ***
  const pauseNavInteraction = useCallback(() => setIsNavInteractionPaused(true), []);
  const resumeNavInteraction = useCallback(() => setIsNavInteractionPaused(false), []);

  const value = {
    isNavbarVisible,
    showNavbar,
    hideNavbar,
    isAutoHideEnabled,
    setAutoHide,
    isMouseFrozen,
    freezeMouseEvents,
    isNavInteractionPaused, // Export the state
    pauseNavInteraction,    // Export the pause function
    resumeNavInteraction,   // Export the resume function
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};