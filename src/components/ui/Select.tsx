import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string; disabled?: boolean }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  className = '',
  error = false,
  options,
  disabled,
  ...props
}, ref) => {
  return (
    <div className="relative flex items-center w-full">
      <select
        ref={ref}
        disabled={disabled}
        className={`w-full appearance-none bg-white text-agText-primary text-sm rounded-ag-md border transition-all duration-150 py-2 pl-3 pr-9 ${
          error
            ? 'border-agStatus-danger focus:border-agStatus-danger'
            : 'border-slate-300 hover:border-slate-400 focus:border-cyan-500'
        } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 text-slate-400 pointer-events-none flex items-center">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
});

Select.displayName = 'Select';
