import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className = '',
  error = false,
  disabled,
  rows = 3,
  ...props
}, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      disabled={disabled}
      className={`w-full bg-white text-agText-primary text-sm rounded-ag-md border transition-all duration-150 p-3 ${
        error
          ? 'border-agStatus-danger focus:border-agStatus-danger'
          : 'border-slate-300 hover:border-slate-400 focus:border-cyan-500'
      } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''} ${className}`}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';
