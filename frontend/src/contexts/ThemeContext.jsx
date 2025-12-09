import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    // Initialize from localStorage synchronously to prevent flash
    const savedTheme = localStorage.getItem('websiteTheme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  // Apply theme to DOM efficiently
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove both theme classes
    root.classList.remove('dark-theme', 'light-theme');
    body.classList.remove('dark-theme', 'light-theme');
    
    // Add current theme class
    const themeClass = isDarkTheme ? 'dark-theme' : 'light-theme';
    root.classList.add(themeClass);
    body.classList.add(themeClass);
    
    // Save to localStorage
    localStorage.setItem('websiteTheme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  // Memoize toggle function
  const toggleTheme = useCallback(() => {
    setIsDarkTheme(prev => !prev);
  }, []);

  // Memoize theme styles to prevent unnecessary re-renders
  const themeStyles = useMemo(() => ({
    isDark: isDarkTheme,
    colors: isDarkTheme ? {
      background: '#1a1a1a',
      cardBackground: '#2a2a2a',
      text: '#ffffff',
      textMuted: '#b0b0b0',
      border: '#404040',
      tableHeaderBg: '#1a1a1a',
      tableRowBg: '#2a2a2a',
      tableRowHover: '#333333',
      inputBg: '#2a2a2a',
      inputBorder: '#404040'
    } : {
      background: '#f8f9fa',
      cardBackground: '#ffffff',
      text: '#212529',
      textMuted: '#6c757d',
      border: '#dee2e6',
      tableHeaderBg: '#f8f9fa',
      tableRowBg: '#ffffff',
      tableRowHover: '#f8f9fa',
      inputBg: '#ffffff',
      inputBorder: '#dee2e6'
    }
  }), [isDarkTheme]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    isDarkTheme,
    toggleTheme,
    themeStyles
  }), [isDarkTheme, toggleTheme, themeStyles]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
