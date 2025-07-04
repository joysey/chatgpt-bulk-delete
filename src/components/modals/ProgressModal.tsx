import React from 'react';
import { XSquare } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import type { DeleteProgress } from '../../types/conversation';

interface ProgressModalProps {
  isOpen: boolean;
  progress: DeleteProgress;
  onCancel: () => void;
  isCancelled?: boolean;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  progress,
  onCancel,
  isCancelled = false
}) => {
  const { total, current, success, failed, currentTitle, isRunning, canCancel } = progress;
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const remaining = total - current;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing by clicking outside
      title="Deleting Conversations"
      size="md"
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div>
          <ProgressBar
            value={percentage}
            label={`Progress (${current}/${total})`}
            variant={failed > 0 ? 'warning' : 'default'}
          />
        </div>

        {/* Current Status */}
        {isRunning && currentTitle && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="text-sm text-blue-800">
              <span className="font-medium">Currently deleting:</span>
              <div className="mt-1 truncate">{currentTitle}</div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="text-2xl font-bold text-green-600">{success}</div>
            <div className="text-sm text-green-700">Success</div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-2xl font-bold text-red-600">{failed}</div>
            <div className="text-sm text-red-700">Failed</div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <div className="text-2xl font-bold text-gray-600">{remaining}</div>
            <div className="text-sm text-gray-700">Remaining</div>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center text-sm text-gray-600">
          {isCancelled ? (
            <span className="text-amber-600 font-medium">Operation cancelled by user.</span>
          ) : isRunning ? (
            <span>Deletion in progress... Please wait.</span>
          ) : (
            <span>
              {failed > 0 
                ? `Completed with ${failed} error${failed > 1 ? 's' : ''}.`
                : 'All conversations deleted successfully!'
              }
            </span>
          )}
        </div>

        {/* Cancel Button */}
        {isRunning && canCancel && (
          <div className="flex justify-center">
            <Button
              variant="secondary"
              onClick={onCancel}
              icon={<XSquare className="w-4 h-4" />}
            >
              Cancel Operation
            </Button>
          </div>
        )}

        {/* Close Button (when completed or cancelled) */}
        {(!isRunning || isCancelled) && (
          <div className="flex justify-center">
            <Button
              variant="primary"
              onClick={onCancel} // Using onCancel as close handler
            >
              Close
            </Button>
          </div>
        )}

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
          <div className="text-sm text-amber-800">
            <span className="font-medium">Important:</span> Do not close this tab or navigate away during the deletion process.
          </div>
        </div>
      </div>
    </Modal>
  );
};