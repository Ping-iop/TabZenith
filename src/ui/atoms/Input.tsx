import React from 'react';
import { cn } from '../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  error,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  return (
    <div className="w-full">
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-content-muted">
            {leftIcon}
          </div>
        )}
        <input
          disabled={disabled}
          className={cn(
            'w-full bg-surface-subtle text-content-primary border border-surface-border rounded-md px-3 py-2 text-sm transition-colors placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-surface-border-focus focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon ? 'pl-9' : '',
            rightIcon ? 'pr-9' : '',
            error ? 'border-status-danger focus:ring-status-danger' : '',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 flex items-center text-content-muted">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-status-danger">{error}</p>}
    </div>
  );
};
