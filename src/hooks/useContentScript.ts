import { useCallback, useEffect, useState } from 'react';
import { MessagingService } from '../services/messaging';
import type { ConversationItem } from '../types/conversation';
import { mergeConversationsWithIgnoreList } from '../utils/helpers';

interface UseContentScriptReturn {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  checkConnection: () => Promise<boolean>;
  getConversations: (offset?: number, limit?: number) => Promise<{ items: ConversationItem[]; total: number } | null>;
  searchConversations: (query: string, offset?: number) => Promise<{ items: ConversationItem[]; total: number } | null>;
  deleteConversation: (id: string) => Promise<boolean>;
}

export function useContentScript(ignoreList: string[] = []): UseContentScriptReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      console.log('start checkConnection')
      setError(null);
      const response = await MessagingService.checkStatus();
      console.log('options:', response)
      if (response.success && response.data) {
        const data = response.data as { isLoggedIn: boolean; hasAccess: boolean };
        const connected = data.isLoggedIn && data.hasAccess;
        setIsConnected(connected);
        return connected;
      }
      setIsConnected(false);
      return false;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMsg);
      setIsConnected(false);
      return false;
    }
  }, []);

  const getConversations = useCallback(async (offset = 0, limit = 28) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await MessagingService.getConversations(offset, limit);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get conversations');
      }

      const data = response.data as { items: any[]; total: number };
      const conversations = mergeConversationsWithIgnoreList(data.items, ignoreList);
      
      return {
        items: conversations,
        total: data.total || 0
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get conversations';
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [ignoreList]);

  const searchConversations = useCallback(async (query: string, offset = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await MessagingService.searchConversations(query, offset);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Search failed');
      }

      const data = response.data as { items: any[]; total: number };
      const conversations = mergeConversationsWithIgnoreList(data.items, ignoreList);
      
      return {
        items: conversations,
        total: data.total || conversations.length
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Search failed';
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [ignoreList]);

  const deleteConversation = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await MessagingService.deleteConversation(id);
      
      if (!response.success) {
        throw new Error(response.error || 'Delete failed');
      }

      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMsg);
      return false;
    }
  }, []);

  useEffect(() => {
    MessagingService.initialize();
  }, []);

  return {
    isConnected,
    isLoading,
    error,
    checkConnection,
    getConversations,
    searchConversations,
    deleteConversation
  };
}