import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, t, formatMessage, getLanguageTranslations } from './i18n';

/**
 * I18n Context Type
 */
interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string, defaultValue?: string) => string;
  formatMessage: (key: string, variables?: Record<string, string | number>) => string;
  translations: Record<string, string>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

/**
 * I18n Provider Component
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Load language preference on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('app_language');
        if (savedLanguage === 'ru' || savedLanguage === 'en') {
          setLanguageState(savedLanguage);
        } else {
          // Default to English
          setLanguageState('en');
        }
      } catch (error) {
        setLanguageState('en');
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, []);

  const setLanguage = async (newLanguage: Language) => {
    try {
      setLanguageState(newLanguage);
      await AsyncStorage.setItem('app_language', newLanguage);
    } catch (error) {
    }
  };

  const tFunction = (key: string, defaultValue?: string) => {
    return t(language, key, defaultValue);
  };

  const formatMessageFunction = (key: string, variables?: Record<string, string | number>) => {
    return formatMessage(language, key, variables);
  };

  const translations = getLanguageTranslations(language);

  const value: I18nContextType = {
    language,
    setLanguage,
    t: tFunction,
    formatMessage: formatMessageFunction,
    translations,
  };

  if (isLoading) {
    return null; // Or a splash screen
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Hook to use i18n context
 */
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
