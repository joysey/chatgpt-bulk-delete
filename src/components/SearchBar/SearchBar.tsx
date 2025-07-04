import React, { useState, useCallback } from 'react';
import { Search, RefreshCw, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { debounce } from 'lodash-es';

interface SearchBarProps {
  searchQuery: string;
  hideIgnored: boolean;
  isLoading: boolean;
  onSearch: (query: string) => void;
  onRefresh: () => void;
  onToggleHideIgnored: (hide: boolean) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  hideIgnored,
  isLoading,
  onSearch,
  onRefresh,
  onToggleHideIgnored
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Only update local state on input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  };

  // Search when clicking button or pressing Enter
  const handleSearch = () => {
    onSearch(localQuery);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    onSearch('');
  };

  const handleRefresh = () => {
    setLocalQuery('');
    onRefresh();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-4">
        {/* Search Input */}
        <div className="flex-1">
          <Input
            placeholder="Search conversations..."
            value={localQuery}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            icon={<Search className="w-4 h-4" />}
            rightIcon={
              localQuery ? (
                <button
                  onClick={handleClearSearch}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : undefined
            }
            disabled={isLoading}
          />
        </div>

        {/* Search Button */}
        <Button
          variant="primary"
          onClick={handleSearch}
          disabled={isLoading || !localQuery}
          loading={isLoading}
          icon={<Search className="w-4 h-4" />}
          className="min-w-[100px]"
        >
          Search
        </Button>

        {/* Refresh Button */}
        <Button
          variant="secondary"
          onClick={handleRefresh}
          disabled={isLoading}
          loading={isLoading}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>

        {/* Hide Ignored Checkbox */}
        <div className="flex items-center">
          <Checkbox
            checked={hideIgnored}
            onChange={onToggleHideIgnored}
            label="Hide Ignored"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Search Status */}
      {searchQuery && (
        <div className="mt-3 text-sm text-gray-600">
          {isLoading ? (
            <span>Searching for "{searchQuery}"...</span>
          ) : (
            <span>
              Search results for "{searchQuery}"
              <button
                onClick={handleClearSearch}
                className="ml-2 text-blue-600 hover:text-blue-700 underline"
              >
                Clear
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};