import React, { useState } from 'react';
import { Trash2, ExternalLink, Search } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { truncateText } from '../../utils/helpers';

interface IgnoreListModalProps {
  isOpen: boolean;
  onClose: () => void;
  ignoreList: string[];
  onRemoveFromIgnoreList: (id: string) => void;
  onClearIgnoreList: () => void;
}

export const IgnoreListModal: React.FC<IgnoreListModalProps> = ({
  isOpen,
  onClose,
  ignoreList,
  onRemoveFromIgnoreList,
  onClearIgnoreList
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter ignore list based on search
  const filteredList = ignoreList.filter(id => 
    id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemove = (id: string) => {
    onRemoveFromIgnoreList(id);
  };

  const handleClearAll = () => {
    if (window.confirm(`Are you sure you want to remove all ${ignoreList.length} conversations from the ignore list?`)) {
      onClearIgnoreList();
    }
  };

  const handleOpenConversation = (id: string) => {
    const url = `https://chatgpt.com/c/${id}`;
    window.open(url, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ignored Conversations (${ignoreList.length})`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Search and Actions */}
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <Input
              placeholder="Search ignored conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          
          {ignoreList.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          )}
        </div>

        {/* List */}
        {filteredList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {ignoreList.length === 0 ? (
              <div>
                <p className="text-lg mb-2">No ignored conversations</p>
                <p className="text-sm">Conversations you ignore will appear here and won't be deleted during batch operations.</p>
              </div>
            ) : (
              <p>No conversations match your search.</p>
            )}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <div className="divide-y divide-gray-200">
              {filteredList.map((id) => (
                <div key={id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {truncateText(id, 50)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Conversation ID
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {/* Open conversation */}
                      <button
                        onClick={() => handleOpenConversation(id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Open conversation"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      
                      {/* Remove from ignore list */}
                      <button
                        onClick={() => handleRemove(id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove from ignore list"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {searchQuery ? (
              <span>Showing {filteredList.length} of {ignoreList.length} ignored conversations</span>
            ) : (
              <span>{ignoreList.length} ignored conversation{ignoreList.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};