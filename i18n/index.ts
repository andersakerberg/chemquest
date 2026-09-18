import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import sv from './locales/sv.json';
import en from './locales/en.json';

const LANG_KEY = 'chemquest-lang';

const savedLang =
  typeof window !== 'undefined' ? localStorage.getItem(LANG_KEY) : null;

void i18n.use(initReactI18next).init({
  resources: {
    sv: { translation: sv },
    en: { translation: en },
  },
  lng: savedLang === 'en' || savedLang === 'sv' ? savedLang : 'sv',
  fallbackLng: 'sv',
  interpolation: {
    escapeValue: false,
  },
});

export const setAppLanguage = (lang: 'sv' | 'en') => {
  void i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANG_KEY, lang);
  }
};

export default i18n;
