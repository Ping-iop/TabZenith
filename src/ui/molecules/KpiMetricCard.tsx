import React from 'react';
import { Card } from '../atoms/Card';
import { cn } from '../utils/cn';

interface KpiMetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
}

export const KpiMetricCard: React.FC<KpiMetricCardProps> = ({
  title,
  value,
  subtext,
  icon,
  variant = 'default',
  className,
}) => {
  const iconVariantStyles = {
    default: 'bg-brand-subtle text-brand-primary border-brand-border',
    success: 'bg-status-success-subtle text-emerald-400 border-emerald-500/30',
    warning: 'bg-status-warning-subtle text-amber-400 border-amber-500/30',
    info: 'bg-status-info-subtle text-cyan-400 border-cyan-500/30',
  };

  return (
    <Card className={cn('p-4 flex items-center justify-between', className)}>
      <div className="space-y-1">
        <p className="text-xs font-medium text-content-secondary uppercase tracking-wider">
          {title}
        </p>
        <p className="text-2xl font-bold text-content-primary">{value}</p>
        {subtext && <p className="text-xs text-content-muted">{subtext}</p>}
      </div>
      <div
        className={cn(
          'p-3 rounded-xl border flex items-center justify-center flex-shrink-0',
          iconVariantStyles[variant]
        )}
      >
        {icon}
      </div>
    </Card>
  );
};
