import type { OperationLog } from './conversation';

export interface StorageSchema {
  'chatgptCleaner_ignoreList': string[];
  'chatgptCleaner_logs': OperationLog[];
  'chatgptCleaner_settings': AppSettings;
  'chatgptCleaner_cache': CacheData;
}

export interface AppSettings {
  hideIgnored: boolean;
  language: string;
  deleteDelay: number; 
  maxLogs: number; 
}

export interface CacheData {
  token?: string;
  tokenExpiry?: number;
  lastSync?: string;
}

export type StorageKey = keyof StorageSchema;