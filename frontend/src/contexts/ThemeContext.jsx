import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('websiteTheme');
    if (savedTheme) {
      setIsDarkTheme(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    // Apply theme to body and root
    const themeClass = isDarkTheme ? 'dark-theme' : 'light-theme';
    document.body.className = document.body.className.replace(/dark-theme|light-theme/g, '').trim() + ' ' + themeClass;
    document.documentElement.className = document.documentElement.className.replace(/dark-theme|light-theme/g, '').trim() + ' ' + themeClass;
    localStorage.setItem('websiteTheme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const themeStyles = isDarkTheme ? {
    background: '#1a1a1a',
    cardBackground: '#2a2a2a',
    text: '#ffffff',
    textMuted: '#b0b0b0',
    border: '#404040',
    tableHeaderBg: '#1a1a1a',
    tableRowBg: '#2a2a2a',
    tableRowHover: '#333333'
  } : {
    background: '#f8f9fa',
    cardBackground: '#ffffff',
    text: '#212529',
    textMuted: '#6c757d',
    border: '#dee2e6',
    tableHeaderBg: '#f8f9fa',
    tableRowBg: '#ffffff',
    tableRowHover: '#f8f9fa'
  };

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme, themeStyles }}>
      {children}
    </ThemeContext.Provider>
  );
};

