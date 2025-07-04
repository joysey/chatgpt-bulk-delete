import React from 'react';
import { ExternalLink, Lock, Unlock } from 'lucide-react';
import { Checkbox } from '../ui/Checkbox';
import type { ConversationItem } from '../../types/conversation';
import { formatRelativeTime, truncateText } from '../../utils/helpers';

interface ConversationRowProps {
  conversation: ConversationItem;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onToggleIgnore: (id: string, ignored: boolean) => void;
}

export const ConversationRow: React.FC<ConversationRowProps> = ({
  conversation,
  isSelected,
  onSelect,
  onToggleIgnore
}) => {
  const handleCheckboxChange = (checked: boolean) => {
    onSelect(conversation.id, checked);
  };

  const handleToggleIgnore = () => {
    onToggleIgnore(conversation.id, !conversation.isIgnored);
  };

  const handleOpenConversation = () => {
    const url = `https://chatgpt.com/c/${conversation.id}`;
    window.open(url, '_blank');
  };

  const rowOpacity = conversation.isIgnored ? 'opacity-50' : 'opacity-100';

  return (
    <tr className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${rowOpacity}`}>
      {/* Checkbox */}
      <td className="px-4 py-3 w-12">
        <Checkbox
          checked={isSelected}
          onChange={handleCheckboxChange}
          disabled={conversation.isIgnored}
        />
      </td>

      {/* Title */}
      <td className="px-4 py-3 flex-1">
        <div className="flex items-center space-x-3">
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-medium truncate ${
              conversation.isIgnored ? 'text-gray-400' : 'text-gray-900'
            }`}>
              {truncateText(conversation.title, 60)}
            </h3>
          </div>
        </div>
      </td>

      {/* Created At */}
      <td className="px-4 py-3 w-32">
        <span className={`text-sm ${
          conversation.isIgnored ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {formatRelativeTime(conversation.create_time)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 w-24">
        <div className="flex items-center space-x-2">
          {/* Open in new tab */}
          <button
            onClick={handleOpenConversation}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Open conversation in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Toggle ignore */}
          <button
            onClick={handleToggleIgnore}
            className={`p-1 transition-colors ${
              conversation.isIgnored
                ? 'text-yellow-600 hover:text-yellow-700'
                : 'text-gray-400 hover:text-yellow-600'
            }`}
            title={conversation.isIgnored ? 'Remove from ignore list' : 'Add to ignore list'}
          >
            {conversation.isIgnored ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
};