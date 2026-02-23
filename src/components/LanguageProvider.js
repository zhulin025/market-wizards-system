// src/components/LanguageProvider.js
import { createContext, useContext, useState, useEffect } from 'react';
import { en, zh } from '../i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('en');

  // Load saved locale
  useEffect(() => {
    const saved = localStorage.getItem('locale');
    if (saved) setLocale(saved);
  }, []);

  // Save locale on change
  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  const t = (key) => {
    const dict = locale === 'zh' ? zh : en;
    return dict[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, lang: locale, setLocale, setLang: setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);
export const useLanguage = () => useContext(LanguageContext);
