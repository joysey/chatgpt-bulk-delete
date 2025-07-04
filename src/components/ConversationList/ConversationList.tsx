import React, { useMemo } from 'react';
import { Checkbox } from '../ui/Checkbox';
import { Spinner } from '../ui/Spinner';
import { ConversationRow } from './ConversationRow';
import { Pagination } from './Pagination';
import type { ConversationItem } from '../../types/conversation';

interface ConversationListProps {
  conversations: ConversationItem[];
  total: number;
  offset: number;
  selectedIds: string[];
  hideIgnored: boolean;
  isLoading: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onToggleIgnore: (id: string, ignored: boolean) => void;
  onPageChange: (newOffset: number) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  total,
  offset,
  selectedIds,
  hideIgnored,
  isLoading,
  onSelect,
  onSelectAll,
  onToggleIgnore,
  onPageChange
}) => {
  const displayedConversations = useMemo(() => {
    return hideIgnored 
      ? conversations.filter(conv => !conv.isIgnored)
      : conversations;
  }, [conversations, hideIgnored]);

  const selectableConversations = useMemo(() => {
    return displayedConversations.filter(conv => !conv.isIgnored);
  }, [displayedConversations]);

  const selectAllState = useMemo(() => {
    if (selectableConversations.length === 0) {
      return { checked: false, indeterminate: false };
    }
    
    const selectedCount = selectableConversations.filter(conv => 
      selectedIds.includes(conv.id)
    ).length;
    
    if (selectedCount === 0) {
      return { checked: false, indeterminate: false };
    } else if (selectedCount === selectableConversations.length) {
      return { checked: true, indeterminate: false };
    } else {
      return { checked: false, indeterminate: true };
    }
  }, [selectableConversations, selectedIds]);

  const handleSelectAll = (checked: boolean) => {
    onSelectAll(checked);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600">Loading conversations...</span>
      </div>
    );
  }

  if (displayedConversations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">
          {hideIgnored ? 'No visible conversations' : 'No conversations found'}
        </div>
        <div className="text-gray-400 text-sm">
          {hideIgnored 
            ? 'All conversations are in the ignore list' 
            : 'Try refreshing or check your ChatGPT account'
          }
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left w-12">
                <Checkbox
                  checked={selectAllState.checked}
                  indeterminate={selectAllState.indeterminate}
                  onChange={handleSelectAll}
                  disabled={selectableConversations.length === 0}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                Title
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-32">
                Created
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedConversations.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedIds.includes(conversation.id)}
                onSelect={onSelect}
                onToggleIgnore={onToggleIgnore}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        total={total}
        offset={offset}
        onPageChange={onPageChange}
        disabled={isLoading}
      />
    </div>
  );
};