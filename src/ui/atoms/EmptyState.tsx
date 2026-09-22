import React from 'react';
import { cn } from '../utils/cn';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-surface-border bg-surface-subtle/50',
        className
      )}
    >
      {icon && <div className="mb-3 text-content-muted p-3 bg-surface-card rounded-full">{icon}</div>}
      <h3 className="text-base font-semibold text-content-primary mb-1">{title}</h3>
      <p className="text-sm text-content-secondary max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
