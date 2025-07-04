import React, { useState } from 'react';
import { Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { OperationLog } from '../../types/conversation';
import { formatDateTime } from '../../utils/helpers';

interface LogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: OperationLog[];
  onClearLogs: () => void;
}

export const LogsModal: React.FC<LogsModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs
}) => {
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);

  const handleClearLogs = () => {
    if (window.confirm(`Are you sure you want to clear all ${logs.length} log entries?`)) {
      onClearLogs();
    }
  };

  const getOperationTypeLabel = (type: string) => {
    switch (type) {
      case 'selected': return 'Selected Conversations';
      case 'page': return 'Page Conversations';
      case 'all': return 'All Conversations';
      default: return 'Unknown Operation';
    }
  };

  const getStatusColor = (log: OperationLog) => {
    if (log.failed === 0) return 'text-green-600';
    if (log.success === 0) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getStatusIcon = (log: OperationLog) => {
    if (log.failed === 0) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (log.success === 0) return <AlertCircle className="w-4 h-4 text-red-600" />;
    return <AlertCircle className="w-4 h-4 text-yellow-600" />;
  };

  if (selectedLog) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => setSelectedLog(null)}
        title="Operation Details"
        size="lg"
      >
        <div className="space-y-6">
          {/* Operation Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Operation:</span>
                <div className="text-gray-900">{getOperationTypeLabel(selectedLog.type)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Date:</span>
                <div className="text-gray-900">{formatDateTime(selectedLog.timestamp)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total:</span>
                <div className="text-gray-900">{selectedLog.total}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Success Rate:</span>
                <div className={getStatusColor(selectedLog)}>
                  {selectedLog.total > 0 
                    ? `${Math.round((selectedLog.success / selectedLog.total) * 100)}%`
                    : '0%'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{selectedLog.success}</div>
              <div className="text-sm text-green-700">Successful</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{selectedLog.failed}</div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{selectedLog.total}</div>
              <div className="text-sm text-gray-700">Total</div>
            </div>
          </div>

          {/* Failures */}
          {selectedLog.failures.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Failed Operations ({selectedLog.failures.length})
              </h3>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                <div className="divide-y divide-gray-200">
                  {selectedLog.failures.map((failure, index) => (
                    <div key={index} className="p-4">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {failure.title}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        ID: {failure.id}
                      </div>
                      <div className="text-sm text-red-600">
                        {failure.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={() => setSelectedLog(null)}
            >
              Back to Logs
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Operation Logs (${logs.length})`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Header Actions */}
        {logs.length > 0 && (
          <div className="flex justify-end">
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={handleClearLogs}
            >
              Clear All Logs
            </Button>
          </div>
        )}

        {/* Logs List */}
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg mb-2">No operation logs</p>
            <p className="text-sm">Deletion operations will be logged here for your reference.</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <div className="divide-y divide-gray-200">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(log)}
                        <span className="text-sm font-medium text-gray-900">
                          {getOperationTypeLabel(log.type)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDateTime(log.timestamp)}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-900">
                        {log.success}/{log.total} successful
                      </div>
                      {log.failed > 0 && (
                        <div className="text-xs text-red-600">
                          {log.failed} failed
                        </div>
                      )}
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
            {logs.length} operation{logs.length !== 1 ? 's' : ''} logged
          </div>
          
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};