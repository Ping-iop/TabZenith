import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '../utils/cn';
import { Button } from './Button';

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg bg-status-danger-subtle border border-red-500/40 text-red-300 text-sm',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-status-danger flex-shrink-0" />
        <span className="font-medium">{message}</span>
      </div>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          onClick={onRetry}
          className="border-red-500/50 text-red-200 hover:bg-status-danger/20"
        >
          Reintentar
        </Button>
      )}
    </div>
  );
};
