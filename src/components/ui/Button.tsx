import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'dark-outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-ag-md focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none';
  
  const variantStyles = {
    primary: 'bg-navy-700 text-white hover:bg-navy-800 active:bg-navy-900 border border-transparent shadow-subtle',
    secondary: 'bg-cyan-500 text-white hover:bg-cyan-600 active:bg-cyan-700 border border-transparent shadow-subtle',
    outline: 'bg-white text-navy-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100',
    'dark-outline': 'bg-navy-800/80 text-white border border-slate-400 hover:bg-navy-600 hover:border-slate-200 active:bg-navy-900',
    danger: 'bg-agStatus-danger text-white hover:bg-red-700 active:bg-red-800 border border-transparent shadow-subtle',
    ghost: 'bg-transparent text-navy-700 hover:bg-slate-100 active:bg-slate-200',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 h-8',
    md: 'px-4 py-2 text-sm gap-2 h-10',
    lg: 'px-5 py-2.5 text-base gap-2.5 h-12',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
