import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DELETE_CONFIRMATION_TEXT } from '../../utils/constants';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'selected' | 'page' | 'all';
  count: number;
  step: number; // 1, 2, or 3 for multiple confirmations
  onNextStep: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  count,
  step,
  onNextStep
}) => {
  const [confirmationText, setConfirmationText] = useState('');

  const getTitle = () => {
    switch (type) {
      case 'selected':
        return 'Confirm Deletion';
      case 'page':
        return step === 1 ? 'Delete This Page' : 'Final Confirmation';
      case 'all':
        return step === 1 ? 'Delete All History' : step === 2 ? 'Are You Sure?' : 'Final Confirmation Required';
      default:
        return 'Confirm Deletion';
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'selected':
        return `Are you sure you want to permanently delete the ${count} selected conversation${count > 1 ? 's' : ''}? This action cannot be undone.`;
      case 'page':
        if (step === 1) {
          return `This will delete all ${count} conversations on this page. Are you sure you want to continue?`;
        }
        return `This action is irreversible. Please confirm again to delete all conversations on this page.`;
      case 'all':
        if (step === 1) {
          return `This will delete ALL ${count} conversations in your ChatGPT history (excluding ignored conversations). This action cannot be undone.`;
        } else if (step === 2) {
          return `You are about to permanently delete ALL your conversation history. This is a destructive action that cannot be reversed. Are you absolutely certain?`;
        }
        return `This will delete ALL conversations not on the ignore list. To proceed, please type "${DELETE_CONFIRMATION_TEXT}" in the box below.`;
      default:
        return '';
    }
  };

  const getConfirmText = () => {
    if (type === 'all' && step === 3) {
      return 'Confirm Deletion';
    }
    return step === 1 ? 'Continue' : 'Confirm Deletion';
  };

  const isConfirmDisabled = () => {
    if (type === 'all' && step === 3) {
      return confirmationText !== DELETE_CONFIRMATION_TEXT;
    }
    return false;
  };

  const handleConfirm = () => {
    if (type === 'selected' || (type === 'page' && step === 2) || (type === 'all' && step === 3)) {
      onConfirm();
    } else {
      onNextStep();
    }
  };

  const handleClose = () => {
    setConfirmationText('');
    onClose();
  };

  const needsMultipleSteps = (type === 'page' || type === 'all') && step < (type === 'all' ? 3 : 2);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getTitle()}
      size="md"
    >
      <div className="space-y-6">
        {/* Warning Icon */}
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-gray-600">{getMessage()}</p>
        </div>

        {/* Text Confirmation Input (for "delete all" final step) */}
        {type === 'all' && step === 3 && (
          <div>
            <Input
              label={`Type "${DELETE_CONFIRMATION_TEXT}" to confirm:`}
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={DELETE_CONFIRMATION_TEXT}
              className="text-center font-mono"
            />
          </div>
        )}

        {/* Step Indicator for multiple confirmations */}
        {needsMultipleSteps && (
          <div className="flex justify-center">
            <div className="text-sm text-gray-500">
              Step {step} of {type === 'all' ? 3 : 2}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirm}
            disabled={isConfirmDisabled()}
          >
            {getConfirmText()}
          </Button>
        </div>

        {/* Additional Warning */}
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-800">
            <span className="font-medium">Warning:</span> Deleted conversations cannot be recovered. 
            Consider using a backup extension before proceeding.
          </div>
        </div>
      </div>
    </Modal>
  );
};