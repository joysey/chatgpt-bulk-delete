import { useCallback } from 'react';

/**
 * Simple i18n hook for Chrome extensions
 * Uses chrome.i18n.getMessage for translation
 */
export function useI18n() {
  const t = useCallback((key: string, substitutions?: string | string[]): string => {
    try {
      if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getMessage) {
        const message = chrome.i18n.getMessage(key, substitutions);
        return message || key;
      }
      // Fallback for development environment
      return key;
    } catch (error) {
      console.warn(`Translation failed for key: ${key}`, error);
      return key;
    }
  }, []);

  return { t };
}