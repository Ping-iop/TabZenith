import React from 'react';
import { Layers, HardDrive, CheckCircle2, Cpu, X } from 'lucide-react';
import { ExecutiveMetrics } from '@/core/domain/metrics.types';
import { useI18n } from '@/core/i18n/I18nContext';
import { KpiMetricCard } from '../molecules/KpiMetricCard';
import { DomainBadge, DOMAIN_CONFIG } from '../molecules/DomainBadge';
import { MarpDomainTaxonomy } from '@/core/domain/classifier.types';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { cn } from '../utils/cn';

interface ExecutiveKpiGridProps {
  metrics: ExecutiveMetrics;
  isClassifying?: boolean;
  selectedDomains?: readonly string[];
  onToggleDomain?: (domain: string) => void;
  onClearDomainFilter?: () => void;
}

export const ExecutiveKpiGrid: React.FC<ExecutiveKpiGridProps> = ({
  metrics,
  isClassifying = false,
  selectedDomains = [],
  onToggleDomain,
  onClearDomainFilter,
}) => {
  const { t } = useI18n();

  const ramFormatted =
    metrics.estimatedRamSavedMb >= 1024
      ? `${(metrics.estimatedRamSavedMb / 1024).toFixed(1)} GB`
      : `${metrics.estimatedRamSavedMb} MB`;

  const topDomain = metrics.domainDistribution[0];

  return (
    <div className="space-y-3">
      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiMetricCard
          title={t('kpi.activeTabs')}
          value={metrics.activeTabsCount}
          subtext={`${metrics.discardedTabsCount} ${t('kpi.frozenInRam')}`}
          icon={<Layers className="w-5 h-5" />}
        />
        <KpiMetricCard
          title={t('kpi.estimatedRamSaved')}
          value={ramFormatted}
          subtext={t('kpi.savedByDiscard')}
          icon={<HardDrive className="w-5 h-5" />}
          variant="success"
        />
        <KpiMetricCard
          title={t('kpi.curationRate')}
          value={`${metrics.curationRatePercent}%`}
          subtext={`${metrics.inboxPendingCount} ${t('kpi.pendingLinks')}`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant={metrics.curationRatePercent >= 70 ? 'success' : 'warning'}
        />
        <KpiMetricCard
          title={t('kpi.layaFocus')}
          value={topDomain ? `${topDomain.percentage}%` : 'N/A'}
          subtext={
            isClassifying
              ? 'Laya AI...'
              : topDomain
              ? `${t('kpi.mainDomain')}: ${topDomain.domain}`
              : 'N/A'
          }
          icon={<Cpu className="w-5 h-5" />}
          variant="info"
        />
      </div>

      {/* Distribución de Taxonomía / Intereses (Botones Interactivos de Filtrado) */}
      {metrics.domainDistribution.length > 0 && (
        <Card className="p-3 bg-surface-card/60">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-content-secondary">
                {t('kpi.interestDistribution')}
              </span>
              {selectedDomains.length > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/30 font-semibold">
                  {t('filter.filteringBy')}: {selectedDomains.map((d) => DOMAIN_CONFIG[d as MarpDomainTaxonomy]?.label || d).join(', ')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedDomains.length > 0 && onClearDomainFilter && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<X className="w-3 h-3 text-status-danger" />}
                  onClick={onClearDomainFilter}
                  className="text-[11px] py-0.5 px-2 h-6 border-red-500/30 text-red-300 hover:bg-red-500/10"
                >
                  {t('filter.clearDomains')}
                </Button>
              )}
              <span className="text-[11px] text-content-muted">
                {metrics.activeTabsCount} {t('kpi.analyzedTabs')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {metrics.domainDistribution.map((item) => {
              const isSelected = selectedDomains.includes(item.domain);
              return (
                <button
                  key={item.domain}
                  type="button"
                  onClick={() => onToggleDomain?.(item.domain)}
                  title={`Filtrar por ${item.domain}`}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all text-left cursor-pointer',
                    isSelected
                      ? 'bg-brand-primary/25 border-brand-primary text-brand-primary ring-1 ring-brand-primary shadow-sm'
                      : 'bg-surface-elevated/70 border-surface-border/80 hover:border-brand-primary/50 text-content-secondary hover:text-content-primary'
                  )}
                >
                  <DomainBadge domain={item.domain} />
                  <span className="text-xs font-bold">
                    {item.percentage}%
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
