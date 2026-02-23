import React, { createContext, useContext, useState, useEffect } from 'react';
import { zh, en } from '../i18n';

const translations = { zh, en };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('zh'); // Default to Chinese

  useEffect(() => {
    const saved = localStorage.getItem('mw-lang');
    if (saved && translations[saved]) {
      setLang(saved);
    }
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'zh' ? 'en' : 'zh';
    setLang(newLang);
    localStorage.setItem('mw-lang', newLang);
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
