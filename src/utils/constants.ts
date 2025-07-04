export const STORAGE_KEYS = {
  IGNORE_LIST: 'chatgptCleaner_ignoreList',
  LOGS: 'chatgptCleaner_logs',
  SETTINGS: 'chatgptCleaner_settings',
  CACHE: 'chatgptCleaner_cache'
} as const;

export const DEFAULT_SETTINGS = {
  hideIgnored: false,
  language: 'en',
  deleteDelay: 1000, // 1 second
  maxLogs: 50
};

export const CONVERSATION_LIMIT = 28; 

export const DELETE_CONFIRMATION_TEXT = 'DELETE';

export const CHATGPT_URL = 'https://chatgpt.com';
export const CHATGPT_DOMAIN = 'chatgpt.com';

export const API_ENDPOINTS = {
  CONVERSATIONS: 'https://chatgpt.com/backend-api/conversations',
  SEARCH: 'https://chatgpt.com/backend-api/conversations/search',
  DELETE: 'https://chatgpt.com/backend-api/conversation',
  SESSION: 'https://chatgpt.com/api/auth/session'
} as const;

export const MESSAGE_TYPES = {
  GET_CONVERSATIONS: 'GET_CONVERSATIONS',
  SEARCH_CONVERSATIONS: 'SEARCH_CONVERSATIONS',
  DELETE_CONVERSATION: 'DELETE_CONVERSATION',
  GET_TOKEN: 'GET_TOKEN',
  CHECK_STATUS: 'CHECK_STATUS'
} as const;

export const OPERATION_TYPES = {
  SELECTED: 'selected',
  PAGE: 'page',
  ALL: 'all'
} as const;