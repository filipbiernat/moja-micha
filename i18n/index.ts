import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import pl from './pl.json';
import en from './en.json';

const resources = {
  pl: { translation: pl },
  en: { translation: en },
};

// Funkcja zwracająca domyślny język systemu, dopasowany do dostępnych tłumaczeń
export const getSystemLanguage = () => {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0) {
    const languageCode = locales[0].languageCode;
    // Sprawdzamy czy wspieramy język z systemu, jeśli nie to fallback na 'en'
    if (languageCode === 'pl' || languageCode === 'en') {
      return languageCode;
    }
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getSystemLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React natywnie chroni przed XSS
    },
  });

export default i18n;
