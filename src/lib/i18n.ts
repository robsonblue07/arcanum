import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import es from '../locales/es.json';
import pt from '../locales/pt.json';

export const APP_LANGUAGES = ['pt-BR', 'en-US', 'es-ES'] as const;
export type AppLanguage = (typeof APP_LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = 'arcanum-language';

const RESOURCES = {
  'pt-BR': { translation: pt },
  'en-US': { translation: en },
  'es-ES': { translation: es },
} as const;

export function isAppLanguage(value: string): value is AppLanguage {
  return value === 'pt-BR' || value === 'en-US' || value === 'es-ES';
}

export function resolveLanguageTag(tag: string | null | undefined): AppLanguage {
  if (tag === null || tag === undefined || tag.length === 0) {
    return 'pt-BR';
  }
  const lower = tag.toLowerCase();
  if (lower.startsWith('en')) {
    return 'en-US';
  }
  if (lower.startsWith('es')) {
    return 'es-ES';
  }
  if (lower.startsWith('pt')) {
    return 'pt-BR';
  }
  return 'pt-BR';
}

export function detectDeviceLanguage(): AppLanguage {
  try {
    const primary = getLocales()[0];
    return resolveLanguageTag(primary?.languageTag ?? primary?.languageCode);
  } catch {
    return 'pt-BR';
  }
}

export function getActiveLanguage(): AppLanguage {
  const raw = i18n.resolvedLanguage ?? i18n.language;
  if (isAppLanguage(raw)) {
    return raw;
  }
  return resolveLanguageTag(raw);
}

export async function changeAppLanguage(language: AppLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  await i18n.changeLanguage(language);
}

export async function hydrateStoredLanguage(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored !== null && isAppLanguage(stored)) {
      await i18n.changeLanguage(stored);
    }
  } catch {
    // Keep the device language already set at init.
  }
}

void i18n.use(initReactI18next).init({
  resources: RESOURCES,
  lng: detectDeviceLanguage(),
  fallbackLng: 'pt-BR',
  supportedLngs: [...APP_LANGUAGES],
  interpolation: { escapeValue: false },
  returnNull: false,
  react: { useSuspense: false },
});

export default i18n;
