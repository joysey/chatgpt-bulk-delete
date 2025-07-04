import type { ConversationItem } from '../types/conversation';

/**
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 */
export function formatDateTime(timestamp: string | number): string {
  const date = new Date(typeof timestamp === 'string' ? timestamp : timestamp * 1000);
  return date.toLocaleString();
}

/**
 */
export function formatRelativeTime(timestamp: string | number): string {
  const date = new Date(typeof timestamp === 'string' ? timestamp : timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 */
export function getRandomDelay(min: number = 500, max: number = 1500): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 */
export function mergeConversationsWithIgnoreList(
  conversations: any[],
  ignoreList: string[]
): ConversationItem[] {
  const ignoreSet = new Set(ignoreList);
  
  return conversations.map(conv => ({
    id: conv.id,
    title: conv.title || 'Untitled',
    create_time: conv.create_time,
    update_time: conv.update_time,
    isIgnored: ignoreSet.has(conv.id)
  }));
}

/**
 */
export function isValidConversationId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && /^[a-f0-9-]+$/i.test(id);
}

/**
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  startIndex: number;
  endIndex: number;
}

export function calculatePagination(
  total: number,
  offset: number,
  limit: number
): PaginationInfo {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  
  return {
    currentPage,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    startIndex: offset + 1,
    endIndex: Math.min(offset + limit, total)
  };
}

/**
 */
export function isChatGPTPage(): boolean {
  return window.location.hostname === 'chatgpt.com' || 
         window.location.hostname === 'chat.openai.com';
}