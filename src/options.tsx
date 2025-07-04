import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Settings, ShieldOff, History, Heart, Home, Coffee } from 'lucide-react';
import { SearchBar } from '~components/SearchBar/SearchBar';
import { ConversationList } from '~components/ConversationList/ConversationList';
import { ActionBar } from '~components/ActionBar/ActionBar';
import { ProgressModal } from '~components/modals/ProgressModal';
import { DeleteConfirmModal } from '~components/modals/DeleteConfirmModal';
import { IgnoreListModal } from '~components/modals/IgnoreListModal';
import { LogsModal } from '~components/modals/LogsModal';
import { Button } from '~components/ui/Button';
import { useContentScript } from '~hooks/useContentScript';
import { useStorage } from '~hooks/useStorage';
import type { ConversationItem, DeleteProgress, OperationLog } from '~types/conversation';
import { CONVERSATION_LIMIT, OPERATION_TYPES } from '~utils/constants';
import { getRandomDelay, delay, generateRequestId } from '~utils/helpers';
import "~style.css";

import iconImage from "data-base64:/assets/icon.png"

function IndexOptions() {
  const storage = useStorage();
  const contentScript = useContentScript(storage.ignoreList);
  
  // State
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'selected' | 'page' | 'all';
    count: number;
    step: number;
  }>({ isOpen: false, type: 'selected', count: 0, step: 1 });
  
  const [ignoreListModal, setIgnoreListModal] = useState(false);
  const [logsModal, setLogsModal] = useState(false);
  
  const [progressModal, setProgressModal] = useState<{
    isOpen: boolean;
    progress: DeleteProgress;
    onCancel?: () => void;
    isCancelled?: boolean;
  }>({ 
    isOpen: false, 
    progress: {
      total: 0,
      current: 0,
      success: 0,
      failed: 0,
      currentTitle: '',
      isRunning: false,
      canCancel: true
    },
    isCancelled: false
  });

  // Check connection and load initial data
  useEffect(() => {
    document.title='ChatGPT Bulk Delete'
    const initialize = async () => {
      const connected = await contentScript.checkConnection();
      if (connected) {
        await loadConversations();
      }
      setIsInitialized(true);
    };
    
    if (!storage.isLoading) {
      initialize();
    }
  }, [storage.isLoading]);

  // Load conversations
  const loadConversations = useCallback(async (newOffset = 0, query = '') => {
    let result;
    
    if (query.trim()) {
      result = await contentScript.searchConversations(query, newOffset);
    } else {
      result = await contentScript.getConversations(newOffset, CONVERSATION_LIMIT);
    }
    
    if (result) {
      setConversations(result.items);
      setTotal(result.total);
      setOffset(newOffset);
    }
  }, [contentScript]);

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    setSelectedIds([]);
    await loadConversations(0, query);
  }, [loadConversations]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setSearchQuery('');
    setSelectedIds([]);
    await loadConversations(0, '');
  }, [loadConversations]);

  // Handle page change
  const handlePageChange = useCallback(async (newOffset: number) => {
    setSelectedIds([]);
    await loadConversations(newOffset, searchQuery);
  }, [loadConversations, searchQuery]);

  // Handle hide ignored toggle
  const handleToggleHideIgnored = useCallback(async (hide: boolean) => {
    await storage.updateSettings({ hideIgnored: hide });
  }, [storage]);

  // Handle conversation selection
  const handleSelect = useCallback((id: string, selected: boolean) => {
    setSelectedIds(prev => 
      selected 
        ? [...prev, id]
        : prev.filter(selectedId => selectedId !== id)
    );
  }, []);

  // Handle select all
  const handleSelectAll = useCallback((selected: boolean) => {
    const selectableConversations = conversations.filter(conv => !conv.isIgnored);
    setSelectedIds(selected ? selectableConversations.map(conv => conv.id) : []);
  }, [conversations]);

  // Handle ignore toggle
  const handleToggleIgnore = useCallback(async (id: string, ignored: boolean) => {
    if (ignored) {
      await storage.addToIgnoreList(id);
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    } else {
      await storage.removeFromIgnoreList(id);
    }
    
    // Update local state
    setConversations(prev => prev.map(conv => 
      conv.id === id ? { ...conv, isIgnored: ignored } : conv
    ));
  }, [storage]);

  // Delete operations
  const startDeletion = useCallback(async (type: 'selected' | 'page' | 'all', ids: string[]) => {
    const progress: DeleteProgress = {
      total: ids.length,
      current: 0,
      success: 0,
      failed: 0,
      currentTitle: '',
      isRunning: true,
      canCancel: true
    };
    
    setProgressModal({ isOpen: true, progress });
    
    const failures: { id: string; title: string; reason: string }[] = [];
    let cancelled = false;
    
    // Set up cancel handler
    const handleCancel = () => {
      cancelled = true;
      setProgressModal(prev => ({
        ...prev,
        progress: { ...prev.progress, canCancel: false },
        isCancelled: true
      }));
      
      // Close the modal after a short delay to show the cancellation
      setTimeout(() => {
        setProgressModal(prev => ({ 
          ...prev, 
          isOpen: false, 
          onCancel: undefined,
          isCancelled: false 
        }));
      }, 500);
    };
    
    // Store cancel handler in progress modal state
    setProgressModal(prev => ({ 
      ...prev, 
      progress,
      onCancel: handleCancel 
    }));
    
    for (let i = 0; i < ids.length && !cancelled; i++) {
      const id = ids[i];
      const conversation = conversations.find(conv => conv.id === id);
      const title = conversation?.title || 'Unknown conversation';
      
      // Update progress
      setProgressModal(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          current: i + 1,
          currentTitle: title
        }
      }));
      
      try {
        const success = await contentScript.deleteConversation(id);
        
        if (success) {
          setProgressModal(prev => ({
            ...prev,
            progress: { ...prev.progress, success: prev.progress.success + 1 }
          }));
        } else {
          failures.push({ id, title, reason: 'Delete request failed' });
          setProgressModal(prev => ({
            ...prev,
            progress: { ...prev.progress, failed: prev.progress.failed + 1 }
          }));
        }
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Unknown error';
        failures.push({ id, title, reason });
        setProgressModal(prev => ({
          ...prev,
          progress: { ...prev.progress, failed: prev.progress.failed + 1 }
        }));
      }
      
      // Random delay to prevent rate limiting
      if (i < ids.length - 1 && !cancelled) {
        const delayMs = getRandomDelay(storage.settings.deleteDelay * 0.5, storage.settings.deleteDelay * 1.5);
        await delay(delayMs);
      }
    }
    
    // Finalize progress
    setProgressModal(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        isRunning: false,
        canCancel: false,
        currentTitle: ''
      },
      onCancel: undefined, // Clear the cancel handler
      isCancelled: false
    }));
    
    // Get final progress state
    const finalProgress = progressModal.progress;
    
    // Log operation
    const log: OperationLog = {
      id: generateRequestId(),
      type,
      timestamp: new Date().toISOString(),
      total: ids.length,
      success: finalProgress.success,
      failed: finalProgress.failed,
      failures
    };
    
    await storage.addLog(log);
    
    // Refresh conversations
    setTimeout(() => {
      loadConversations(offset, searchQuery);
      setSelectedIds([]);
    }, 1000);
  }, [conversations, contentScript, storage, offset, searchQuery, loadConversations]);

  // Delete handlers
  const handleDeleteSelected = useCallback(() => {
    setDeleteModal({
      isOpen: true,
      type: 'selected',
      count: selectedIds.length,
      step: 1
    });
  }, [selectedIds]);

  const handleDeletePage = useCallback(() => {
    setDeleteModal({
      isOpen: true,
      type: 'page',
      count: conversations.filter(conv => !conv.isIgnored).length,
      step: 1
    });
  }, [conversations]);

  const handleDeleteAll = useCallback(() => {
    setDeleteModal({
      isOpen: true,
      type: 'all',
      count: total - storage.ignoreList.length,
      step: 1
    });
  }, [total, storage.ignoreList]);

  const handleConfirmDelete = useCallback(async () => {
    const { type } = deleteModal;
    let ids: string[] = [];
    
    switch (type) {
      case 'selected':
        ids = selectedIds;
        break;
      case 'page':
        ids = conversations.filter(conv => !conv.isIgnored).map(conv => conv.id);
        break;
      case 'all':
        // For "delete all", we need to get all conversations from all pages
        // This would require multiple API calls in a real implementation
        // For now, we'll use the current conversations as a simplified version
        ids = conversations.filter(conv => !conv.isIgnored).map(conv => conv.id);
        break;
    }
    
    setDeleteModal({ ...deleteModal, isOpen: false });
    await startDeletion(type, ids);
  }, [deleteModal, selectedIds, conversations, startDeletion]);

  const handleDeleteModalNext = useCallback(() => {
    setDeleteModal(prev => ({ ...prev, step: prev.step + 1 }));
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false, type: 'selected', count: 0, step: 1 });
  }, []);

  const handleCloseProgressModal = useCallback(() => {
    // If there's an active cancel handler, call it first
    if (progressModal.onCancel && progressModal.progress.isRunning) {
      progressModal.onCancel();
    }
    setProgressModal(prev => ({ ...prev, isOpen: false }));
  }, [progressModal.onCancel, progressModal.progress.isRunning]);

  // Filter conversations for display
  const displayedConversations = storage.settings.hideIgnored 
    ? conversations.filter(conv => !conv.isIgnored)
    : conversations;

  if (!isInitialized || storage.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  // if (!contentScript.isConnected) {
  //   return (
      
  //   );
  // }

  return (
    <>
    {!contentScript.isConnected &&(
      <div className="pt-10 bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">  
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ChatGPT Not Accessible
          </h2>
          <p className="text-gray-600 mb-6 text-xl">
            Please open ChatGPT in a new tab and make sure you're logged in.<br/>
            <span className="block mt-1 text-blue-600">After logging in, please refresh this page.</span>
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => window.open('https://chatgpt.com', '_blank')}
              variant="primary"
              className="w-full"
            >
              Open ChatGPT
            </Button>
            <Button
              onClick={contentScript.checkConnection}
              variant="secondary"
              className="w-full"
            >
              Check Connection
            </Button>
          </div>
          {contentScript.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {contentScript.error}
            </div>
          )}
        </div>
      </div>
    )}
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center mb-2">
              <img src={iconImage} alt="Prompt Hub Logo" className="w-10 h-10 mr-2 rounded-xl dark:border-slate-700" />
              <h1 className="text-3xl font-bold text-gray-900">
                ChatGPT Batch Delete
              </h1>
            </div>
            <p className="text-gray-600">
              Manage and delete your ChatGPT conversation history
            </p>
          </div>
          <div className="flex justify-center gap-4 mt-2 sm:mt-0">
            <a
              href="https://tools.aluo.app/pay/supportus.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-gray-600 hover:text-red-500 transition-colors"
            >
              <Coffee className="w-5 h-5 text-red-500" />
              <span>By me coffe</span>
            </a>
            <a
              href="https://chatgptsave.notion.site/ChatGPT-Bulk-Delete-Home-22510052f0c8806698dfde021315a12f"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Home className="w-5 h-5 text-blue-500" />
              <span>Project Home</span>
            </a>
            <a
              href="https://github.com/joysey/chatgpt-bulk-delete.git"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-gray-600 hover:text-black transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="20" height="20" className="inline-block"><path d="M17.791,46.836C18.502,46.53,19,45.823,19,45v-5.4c0-0.197,0.016-0.402,0.041-0.61C19.027,38.994,19.014,38.997,19,39 c0,0-3,0-3.6,0c-1.5,0-2.8-0.6-3.4-1.8c-0.7-1.3-1-3.5-2.8-4.7C8.9,32.3,9.1,32,9.7,32c0.6,0.1,1.9,0.9,2.7,2c0.9,1.1,1.8,2,3.4,2 c2.487,0,3.82-0.125,4.622-0.555C21.356,34.056,22.649,33,24,33v-0.025c-5.668-0.182-9.289-2.066-10.975-4.975 c-3.665,0.042-6.856,0.405-8.677,0.707c-0.058-0.327-0.108-0.656-0.151-0.987c1.797-0.296,4.843-0.647,8.345-0.714 c-0.112-0.276-0.209-0.559-0.291-0.849c-3.511-0.178-6.541-0.039-8.187,0.097c-0.02-0.332-0.047-0.663-0.051-0.999 c1.649-0.135,4.597-0.27,8.018-0.111c-0.079-0.5-0.13-1.011-0.13-1.543c0-1.7,0.6-3.5,1.7-5c-0.5-1.7-1.2-5.3,0.2-6.6 c2.7,0,4.6,1.3,5.5,2.1C21,13.4,22.9,13,25,13s4,0.4,5.6,1.1c0.9-0.8,2.8-2.1,5.5-2.1c1.5,1.4,0.7,5,0.2,6.6c1.1,1.5,1.7,3.2,1.6,5 c0,0.484-0.045,0.951-0.11,1.409c3.499-0.172,6.527-0.034,8.204,0.102c-0.002,0.337-0.033,0.666-0.051,0.999 c-1.671-0.138-4.775-0.28-8.359-0.089c-0.089,0.336-0.197,0.663-0.325,0.98c3.546,0.046,6.665,0.389,8.548,0.689 c-0.043,0.332-0.093,0.661-0.151,0.987c-1.912-0.306-5.171-0.664-8.879-0.682C35.112,30.873,31.557,32.75,26,32.969V33 c2.6,0,5,3.9,5,6.6V45c0,0.823,0.498,1.53,1.209,1.836C41.37,43.804,48,35.164,48,25C48,12.318,37.683,2,25,2S2,12.318,2,25 C2,35.164,8.63,43.804,17.791,46.836z"/></svg>
              <span>Open Source</span>
            </a>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-amber-800 mb-1">
                Important: Backup Recommended
              </h3>
              <p className="text-sm text-amber-700">
                Deleted conversations cannot be recovered. We recommend backing up important conversations using{' '}
                <a href="https://chromewebstore.google.com/detail/bknieejaaomeegoflpgcckagimnbbgdp" 
                   target="_blank" 
                   className="underline hover:text-amber-800">
                  Bulk ChatGPT to Notion
                </a>{' '}
                or{' '}
                <a href="https://chromewebstore.google.com/detail/bdkpamdmcgamabdeaeehfmaiaejcdfko" 
                   target="_blank" 
                   className="underline hover:text-amber-800">
                  Bulk ChatGPT to Obsidian
                </a>{' '}
                before proceeding.
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          hideIgnored={storage.settings.hideIgnored}
          isLoading={contentScript.isLoading}
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          onToggleHideIgnored={handleToggleHideIgnored}
        />

        {/* Conversation List */}
        <ConversationList
          conversations={displayedConversations}
          total={total}
          offset={offset}
          selectedIds={selectedIds}
          hideIgnored={storage.settings.hideIgnored}
          isLoading={contentScript.isLoading}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onToggleIgnore={handleToggleIgnore}
          onPageChange={handlePageChange}
        />

        {/* Action Bar */}
        <ActionBar
          selectedCount={selectedIds.length}
          totalOnPage={displayedConversations.filter(conv => !conv.isIgnored).length}
          totalAll={total - storage.ignoreList.length}
          isDeleting={progressModal.progress.isRunning}
          onDeleteSelected={handleDeleteSelected}
          onDeletePage={handleDeletePage}
          onDeleteAll={handleDeleteAll}
          disabled={contentScript.isLoading}
        />

        {/* Footer */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            icon={<ShieldOff className="w-4 h-4" />}
            onClick={() => setIgnoreListModal(true)}
          >
            Manage Ignored ({storage.ignoreList.length})
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            icon={<History className="w-4 h-4" />}
            onClick={() => setLogsModal(true)}
          >
            View Logs ({storage.logs.length})
          </Button>
        </div>
      </div>

      {/* Modals */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        onNextStep={handleDeleteModalNext}
        type={deleteModal.type}
        count={deleteModal.count}
        step={deleteModal.step}
      />

      <ProgressModal
        isOpen={progressModal.isOpen}
        progress={progressModal.progress}
        onCancel={progressModal.onCancel || handleCloseProgressModal}
        isCancelled={progressModal.isCancelled}
      />

      <IgnoreListModal
        isOpen={ignoreListModal}
        onClose={() => setIgnoreListModal(false)}
        ignoreList={storage.ignoreList}
        onRemoveFromIgnoreList={storage.removeFromIgnoreList}
        onClearIgnoreList={storage.clearIgnoreList}
      />

      <LogsModal
        isOpen={logsModal}
        onClose={() => setLogsModal(false)}
        logs={storage.logs}
        onClearLogs={storage.clearLogs}
      />
    </div>
    </>
   
  );
}

export default IndexOptions;
