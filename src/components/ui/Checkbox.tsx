import React from 'react';
import { Check, Minus } from 'lucide-react';

interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  label,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <label className={`inline-flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />
        <div className={`
          w-4 h-4 border-2 rounded flex items-center justify-center transition-colors
          ${checked || indeterminate 
            ? 'bg-blue-600 border-blue-600' 
            : 'bg-white border-gray-300'
          }
          ${disabled 
            ? 'opacity-50' 
            : 'hover:border-blue-500'
          }
        `}>
          {indeterminate ? (
            <Minus className="w-3 h-3 text-white" />
          ) : checked ? (
            <Check className="w-3 h-3 text-white" />
          ) : null}
        </div>
      </div>
      
      {label && (
        <span className={`ml-2 text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {label}
        </span>
      )}
    </label>
  );
};