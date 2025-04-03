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
    // Detecta el idioma del navegador al cargar
    const detectBrowserLanguage = () => {
      const browserLang = navigator.language.toLowerCase();
      // Detecta cualquier variante de español (es, es-ES, es-MX, etc.)
      if (browserLang.startsWith('es')) {
        setLanguage('es');
      } else {
        // Para inglés o cualquier otro idioma, usa inglés
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
      }
    } catch (error) {
      // Si hay algún problema con localStorage (navegador en modo privado, etc.)
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