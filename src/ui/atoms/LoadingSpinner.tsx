import React from 'react';
import { cn } from '../utils/cn';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div
      role="status"
      aria-label="Cargando"
      className={cn(
        'inline-block animate-spin rounded-full border-solid border-content-secondary border-t-brand-primary',
        sizeClasses[size],
        className
      )}
    />
  );
};
