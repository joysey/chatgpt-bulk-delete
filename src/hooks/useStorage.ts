import { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storage';
import type { OperationLog } from '../types/conversation';

interface UseStorageReturn {
  ignoreList: string[];
  logs: OperationLog[];
  settings: {
    hideIgnored: boolean;
    language: string;
    deleteDelay: number;
    maxLogs: number;
  };
  isLoading: boolean;
  addToIgnoreList: (id: string) => Promise<void>;
  removeFromIgnoreList: (id: string) => Promise<void>;
  clearIgnoreList: () => Promise<void>;
  addLog: (log: OperationLog) => Promise<void>;
  clearLogs: () => Promise<void>;
  updateSettings: (newSettings: Partial<typeof settings>) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useStorage(): UseStorageReturn {
  const [ignoreList, setIgnoreList] = useState<string[]>([]);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [settings, setSettings] = useState({
    hideIgnored: false,
    language: 'en',
    deleteDelay: 1000,
    maxLogs: 50
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [ignoreListData, logsData, settingsData] = await Promise.all([
        StorageService.getIgnoreList(),
        StorageService.getLogs(),
        StorageService.getSettings()
      ]);
      
      setIgnoreList(ignoreListData);
      setLogs(logsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to load storage data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const addToIgnoreList = useCallback(async (id: string) => {
    const success = await StorageService.addToIgnoreList(id);
    if (success) {
      setIgnoreList(prev => prev.includes(id) ? prev : [...prev, id]);
    }
  }, []);

  const removeFromIgnoreList = useCallback(async (id: string) => {
    const success = await StorageService.removeFromIgnoreList(id);
    if (success) {
      setIgnoreList(prev => prev.filter(item => item !== id));
    }
  }, []);

  const clearIgnoreList = useCallback(async () => {
    const success = await StorageService.setIgnoreList([]);
    if (success) {
      setIgnoreList([]);
    }
  }, []);

  const addLog = useCallback(async (log: OperationLog) => {
    const success = await StorageService.addLog(log);
    if (success) {
      setLogs(prev => [log, ...prev.slice(0, settings.maxLogs - 1)]);
    }
  }, [settings.maxLogs]);

  const clearLogs = useCallback(async () => {
    const success = await StorageService.clearLogs();
    if (success) {
      setLogs([]);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<typeof settings>) => {
    const success = await StorageService.setSettings(newSettings);
    if (success) {
      setSettings(prev => ({ ...prev, ...newSettings }));
    }
  }, []);

  useEffect(() => {
    StorageService.initialize().then(() => {
      loadData();
    });
  }, [loadData]);

  return {
    ignoreList,
    logs,
    settings,
    isLoading,
    addToIgnoreList,
    removeFromIgnoreList,
    clearIgnoreList,
    addLog,
    clearLogs,
    updateSettings,
    refreshData
  };
}