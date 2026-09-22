import React from 'react';
import { Calendar, Filter } from 'lucide-react';
import { DateRangePreset, DateRangeFilterState } from '@/core/domain/inbox.types';
import { Button } from '../atoms/Button';
import { cn } from '../utils/cn';

interface DateRangeFilterProps {
  filter: DateRangeFilterState;
  onChange: (filter: DateRangeFilterState) => void;
  className?: string;
}

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'today', label: 'Hoy' },
  { id: 'yesterday', label: 'Ayer' },
  { id: 'last7days', label: 'Últimos 7 días' },
  { id: 'last30days', label: 'Últimos 30 días' },
  { id: 'custom', label: 'Personalizado' },
];

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  filter,
  onChange,
  className,
}) => {
  const handlePresetClick = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      onChange({
        preset: 'custom',
        startDate: filter.startDate || Date.now() - 7 * 24 * 60 * 60 * 1000,
        endDate: filter.endDate || Date.now(),
      });
      return;
    }
    onChange({ preset });
  };

  const handleCustomDateChange = (type: 'start' | 'end', dateStr: string) => {
    if (!dateStr) return;
    const epoch = new Date(dateStr).getTime();
    onChange({
      ...filter,
      preset: 'custom',
      startDate: type === 'start' ? epoch : filter.startDate,
      endDate: type === 'end' ? epoch : filter.endDate,
    });
  };

  const toInputDate = (epoch?: number) => {
    if (!epoch) return '';
    const d = new Date(epoch);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-content-muted flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Rango:</span>
        </span>
        {PRESETS.map((p) => {
          const isActive = filter.preset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handlePresetClick(p.id)}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-md transition-colors border',
                isActive
                  ? 'bg-brand-primary text-content-primary border-brand-primary shadow-sm'
                  : 'bg-surface-subtle text-content-secondary border-surface-border hover:bg-surface-elevated hover:text-content-primary'
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {filter.preset === 'custom' && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-subtle border border-surface-border text-xs">
          <Calendar className="w-4 h-4 text-brand-primary" />
          <div className="flex items-center gap-2">
            <label className="text-content-muted">Desde:</label>
            <input
              type="date"
              value={toInputDate(filter.startDate)}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
              className="bg-surface-card border border-surface-border rounded px-2 py-1 text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-content-muted">Hasta:</label>
            <input
              type="date"
              value={toInputDate(filter.endDate)}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
              className="bg-surface-card border border-surface-border rounded px-2 py-1 text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onChange({ preset: 'all' })}
            className="text-xs py-1"
          >
            Limpiar
          </Button>
        </div>
      )}
    </div>
  );
};
