import React from 'react';
import { Trash, Trash2, Bomb } from 'lucide-react';
import { Button } from '../ui/Button';

interface ActionBarProps {
  selectedCount: number;
  totalOnPage: number;
  totalAll: number;
  isDeleting: boolean;
  onDeleteSelected: () => void;
  onDeletePage: () => void;
  onDeleteAll: () => void;
  disabled?: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  selectedCount,
  totalOnPage,
  totalAll,
  isDeleting,
  onDeleteSelected,
  onDeletePage,
  onDeleteAll,
  disabled = false
}) => {
  const isDisabled = disabled || isDeleting;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mt-6">
      <div className="flex items-center justify-between">
        {/* Left side - Selection info */}
        <div className="text-sm text-gray-600">
          {selectedCount > 0 ? (
            <span>{selectedCount} conversation{selectedCount > 1 ? 's' : ''} selected</span>
          ) : (
            <span>No conversations selected</span>
          )}
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center space-x-3">
          {/* Delete Selected */}
          <Button
            variant="danger"
            size="sm"
            icon={<Trash className="w-4 h-4" />}
            onClick={onDeleteSelected}
            disabled={isDisabled || selectedCount === 0}
            loading={isDeleting}
          >
            Delete Selected ({selectedCount})
          </Button>

          {/* Delete This Page */}
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={onDeletePage}
            disabled={isDisabled || totalOnPage === 0}
          >
            Delete This Page ({totalOnPage})
          </Button>

          {/* Delete All History */}
          <Button
            variant="danger"
            size="sm"
            icon={<Bomb className="w-4 h-4" />}
            onClick={onDeleteAll}
            disabled={isDisabled || totalAll === 0}
            className="bg-red-700 hover:bg-red-800 border-red-700"
          >
            Delete All History ({totalAll})
          </Button>
        </div>
      </div>

      {/* Warning message when deleting */}
      {isDeleting && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">
                Deletion in progress. Please do not close this tab or navigate away.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};