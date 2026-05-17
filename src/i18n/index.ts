import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ptBR from './locales/pt-BR.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
] as const;

export type SupportedLocale = (typeof SUPPORTED_LANGUAGES)[number]['code'];
export const LOCALE_STORAGE_KEY = 'th_locale';

const SUPPORTED_CODES = SUPPORTED_LANGUAGES.map((l) => l.code) as readonly string[];

export function isSupportedLocale(code: string | null | undefined): code is SupportedLocale {
  return !!code && SUPPORTED_CODES.includes(code);
}

function detectInitialLanguage(): string {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCALE_STORAGE_KEY) : null;
  if (isSupportedLocale(stored)) return stored;

  const browserLangs = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : [];
  for (const browserLang of browserLangs) {
    if (isSupportedLocale(browserLang)) return browserLang;
    const base = browserLang.split('-')[0];
    if (isSupportedLocale(base)) return base;
    const match = SUPPORTED_CODES.find((c) => c.startsWith(base + '-'));
    if (match) return match;
  }
  return 'en';
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'pt-BR': { translation: ptBR },
    es: { translation: es },
    fr: { translation: fr },
  },
  lng: detectInitialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
