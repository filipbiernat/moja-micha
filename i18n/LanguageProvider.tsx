import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDatabase } from '../db';
import { getSetting, setSetting } from '../db/settings';
import { getSystemLanguage } from './index';

export type LanguagePreference = 'pl' | 'en' | 'system';

export type LanguageContextType = {
  preference: LanguagePreference;
  setPreference: (val: LanguagePreference) => void;
  isLoading: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const db = useDatabase();
  const { i18n } = useTranslation();
  
  const [preference, setPreferenceState] = useState<LanguagePreference>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Zmiana i18n
  const applyLanguage = useCallback((pref: LanguagePreference) => {
    if (pref === 'system') {
      i18n.changeLanguage(getSystemLanguage());
    } else {
      i18n.changeLanguage(pref);
    }
  }, [i18n]);

  // Ładowanie ustawienia przy starcie
  useEffect(() => {
    try {
      const savedLang = getSetting(db, 'language');
      if (savedLang === 'pl' || savedLang === 'en' || savedLang === 'system') {
        setPreferenceState(savedLang as LanguagePreference);
        applyLanguage(savedLang as LanguagePreference);
      } else {
        applyLanguage('system');
      }
    } catch (e) {
      console.error('Failed to load language setting:', e);
      applyLanguage('system');
    } finally {
      setIsLoading(false);
    }
  }, [db, applyLanguage]);

  const setPreference = useCallback((newPref: LanguagePreference) => {
    setPreferenceState(newPref);
    applyLanguage(newPref);
    try {
      setSetting(db, 'language', newPref);
    } catch (e) {
      console.error('Failed to save language setting:', e);
    }
  }, [db, applyLanguage]);

  const val = useMemo(() => ({ preference, setPreference, isLoading }), [preference, setPreference, isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <LanguageContext.Provider value={val}>
      {children}
    </LanguageContext.Provider>
  );
}
