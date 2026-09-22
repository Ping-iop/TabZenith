import React from 'react';
import { cn } from '../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevated = false,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-surface-card rounded-lg border border-surface-border text-content-primary transition-all overflow-hidden',
        elevated ? 'shadow-elevated bg-surface-elevated' : 'shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
