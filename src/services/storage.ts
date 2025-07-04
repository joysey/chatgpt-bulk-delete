import type { StorageSchema, StorageKey } from '../types/storage';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../utils/constants';

/**
 */
export class StorageService {
  /**
   */
  static async get<K extends StorageKey>(key: K): Promise<StorageSchema[K] | null> {
    try {
      const result = await chrome.storage.local.get([key]);
      return result[key] || null;
    } catch (error) {
      console.error(`Failed to get storage key ${key}:`, error);
      return null;
    }
  }

  /**
   */
  static async set<K extends StorageKey>(key: K, value: StorageSchema[K]): Promise<boolean> {
    try {
      await chrome.storage.local.set({ [key]: value });
      return true;
    } catch (error) {
      console.error(`Failed to set storage key ${key}:`, error);
      return false;
    }
  }

  /**
   */
  static async remove(key: StorageKey): Promise<boolean> {
    try {
      await chrome.storage.local.remove([key]);
      return true;
    } catch (error) {
      console.error(`Failed to remove storage key ${key}:`, error);
      return false;
    }
  }

  /**
   */
  static async clear(): Promise<boolean> {
    try {
      await chrome.storage.local.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  /**
   */
  static async getIgnoreList(): Promise<string[]> {
    const list = await this.get(STORAGE_KEYS.IGNORE_LIST);
    return list || [];
  }

  /**
   */
  static async setIgnoreList(list: string[]): Promise<boolean> {
    return this.set(STORAGE_KEYS.IGNORE_LIST, list);
  }

  /**
   */
  static async addToIgnoreList(id: string): Promise<boolean> {
    const currentList = await this.getIgnoreList();
    if (!currentList.includes(id)) {
      currentList.push(id);
      return this.setIgnoreList(currentList);
    }
    return true;
  }

  /**
   */
  static async removeFromIgnoreList(id: string): Promise<boolean> {
    const currentList = await this.getIgnoreList();
    const newList = currentList.filter(item => item !== id);
    return this.setIgnoreList(newList);
  }

  /**
   */
  static async getSettings() {
    const settings = await this.get(STORAGE_KEYS.SETTINGS);
    return { ...DEFAULT_SETTINGS, ...settings };
  }

  /**
   */
  static async setSettings(settings: Partial<StorageSchema['chatgptCleaner_settings']>): Promise<boolean> {
    const currentSettings = await this.getSettings();
    const newSettings = { ...currentSettings, ...settings };
    return this.set(STORAGE_KEYS.SETTINGS, newSettings);
  }

  /**
   */
  static async getLogs() {
    const logs = await this.get(STORAGE_KEYS.LOGS);
    return logs || [];
  }

  /**
   */
  static async addLog(log: StorageSchema['chatgptCleaner_logs'][0]): Promise<boolean> {
    const currentLogs = await this.getLogs();
    const settings = await this.getSettings();
    
    currentLogs.unshift(log);
    
    if (currentLogs.length > settings.maxLogs) {
      currentLogs.splice(settings.maxLogs);
    }
    
    return this.set(STORAGE_KEYS.LOGS, currentLogs);
  }

  /**
   */
  static async clearLogs(): Promise<boolean> {
    return this.set(STORAGE_KEYS.LOGS, []);
  }

  /**
   */
  static async getCache() {
    const cache = await this.get(STORAGE_KEYS.CACHE);
    return cache || {};
  }

  /**
   */
  static async setCache(cache: Partial<StorageSchema['chatgptCleaner_cache']>): Promise<boolean> {
    const currentCache = await this.getCache();
    const newCache = { ...currentCache, ...cache };
    return this.set(STORAGE_KEYS.CACHE, newCache);
  }

  /**
   */
  static async initialize(): Promise<void> {
    const settings = await this.get(STORAGE_KEYS.SETTINGS);
    if (!settings) {
      await this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    
    const ignoreList = await this.get(STORAGE_KEYS.IGNORE_LIST);
    if (!ignoreList) {
      await this.set(STORAGE_KEYS.IGNORE_LIST, []);
    }
    
    const logs = await this.get(STORAGE_KEYS.LOGS);
    if (!logs) {
      await this.set(STORAGE_KEYS.LOGS, []);
    }
  }
}