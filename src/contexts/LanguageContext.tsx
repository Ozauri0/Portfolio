'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en';
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  useEffect(() => {
    // Detect browser language on load
    const detectBrowserLanguage = () => {
      const browserLang = navigator.language.toLowerCase();
      // Detect any Spanish variant (es, es-ES, es-MX, etc.)
      if (browserLang.startsWith('es')) {
        setLanguage('es');
      } else {
        // For English or any other language, use English
        setLanguage('en');
      }
    };
  
    // Intenta recuperar el idioma guardado en localStorage
    try {
      const savedLanguage = localStorage.getItem('preferredLanguage') as Language;
      if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
        setLanguage(savedLanguage);
      } else {
        detectBrowserLanguage();
      }    } catch (error) {
      // If there's any problem with localStorage (private browsing mode, etc.)
      detectBrowserLanguage();
    }
  }, []);

  // Guarda el idioma seleccionado en localStorage
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}