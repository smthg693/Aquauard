import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  error = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}, ref) => {
  return (
    <div className="relative flex items-center w-full">
      {leftIcon && (
        <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
          {leftIcon}
        </div>
      )}
      <input
        ref={ref}
        disabled={disabled}
        className={`w-full bg-white text-agText-primary text-sm rounded-ag-md border transition-all duration-150 py-2 ${
          leftIcon ? 'pl-9' : 'pl-3'
        } ${rightIcon ? 'pr-9' : 'pr-3'} ${
          error
            ? 'border-agStatus-danger focus:border-agStatus-danger focus:ring-agStatus-danger'
            : 'border-slate-300 hover:border-slate-400 focus:border-cyan-500'
        } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''} ${className}`}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 text-slate-400 flex items-center">
          {rightIcon}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';
