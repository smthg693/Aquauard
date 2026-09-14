import React from 'react';

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  error,
  helperText,
  required = false,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-xs font-semibold text-agText-secondary uppercase tracking-wider"
        >
          {label}
          {required && <span className="text-agStatus-danger ml-1">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-agStatus-danger font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-agText-muted">{helperText}</p>
      ) : null}
    </div>
  );
};
