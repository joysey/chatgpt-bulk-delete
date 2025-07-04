import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { calculatePagination } from '../../utils/helpers';
import { CONVERSATION_LIMIT } from '../../utils/constants';

interface PaginationProps {
  total: number;
  offset: number;
  limit?: number;
  onPageChange: (newOffset: number) => void;
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  total,
  offset,
  limit = CONVERSATION_LIMIT,
  onPageChange,
  disabled = false
}) => {
  const pagination = calculatePagination(total, offset, limit);
  const { currentPage, totalPages, hasNext, hasPrev, startIndex, endIndex } = pagination;

  const handleFirst = () => {
    if (hasPrev && !disabled) {
      onPageChange(0);
    }
  };

  const handlePrev = () => {
    if (hasPrev && !disabled) {
      onPageChange(Math.max(0, offset - limit));
    }
  };

  const handleNext = () => {
    if (hasNext && !disabled) {
      onPageChange(offset + limit);
    }
  };

  const handleLast = () => {
    if (hasNext && !disabled) {
      const lastPageOffset = Math.max(0, Math.floor((total - 1) / limit) * limit);
      onPageChange(lastPageOffset);
    }
  };

  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-4 text-sm text-gray-500">
        No conversations found
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
      {/* Results info */}
      <div className="text-sm text-gray-700">
        Showing {startIndex} to {endIndex} of {total} conversations
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFirst}
          disabled={!hasPrev || disabled}
          icon={<ChevronsLeft className="w-4 h-4" />}
          className="px-2"
        >
          First
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrev}
          disabled={!hasPrev || disabled}
          icon={<ChevronLeft className="w-4 h-4" />}
          className="px-2"
        >
          Prev
        </Button>

        <div className="flex items-center space-x-2 px-3">
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={!hasNext || disabled}
          className="px-2"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLast}
          disabled={!hasNext || disabled}
          className="px-2"
        >
          Last
          <ChevronsRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};