import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { SupportedLanguage, TranslationKey, SUPPORTED_LANGUAGES } from './i18n.types';
import { TRANSLATIONS } from './translations';

interface I18nContextValue {
  readonly language: SupportedLanguage;
  readonly setLanguage: (lang: SupportedLanguage) => void;
  readonly t: (key: TranslationKey, fallback?: string) => string;
}

const STORAGE_KEY = 'tabzenith_language';

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLanguage(): SupportedLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
    // Detectar idioma del navegador
    const browserLang = navigator.language?.slice(0, 2).toLowerCase();
    if (browserLang === 'es') return 'es';
    if (browserLang === 'ru') return 'ru';
    if (browserLang === 'zh') return 'zh';
    return 'en';
  } catch {
    return 'es';
  }
}

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(getInitialLanguage);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignorar errores de localStorage
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, fallback?: string): string => {
      const langDict = TRANSLATIONS[language];
      if (langDict && langDict[key]) {
        return langDict[key];
      }
      // Fallback a español o clave
      return TRANSLATIONS.es[key] || fallback || key;
    },
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n debe utilizarse dentro de un I18nProvider');
  }
  return ctx;
}
