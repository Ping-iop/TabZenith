import React from 'react';
import { cn } from '../utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
}) => {
  const variantStyles = {
    default: 'bg-surface-elevated text-content-secondary border-surface-border',
    success: 'bg-status-success-subtle text-emerald-400 border-emerald-500/30',
    warning: 'bg-status-warning-subtle text-amber-400 border-amber-500/30',
    danger: 'bg-status-danger-subtle text-red-400 border-red-500/30',
    info: 'bg-status-info-subtle text-cyan-400 border-cyan-500/30',
    brand: 'bg-brand-subtle text-brand-primary border-brand-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border truncate max-w-[200px]',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
