import React from 'react';
import { Layers, HardDrive, CheckCircle2, Cpu } from 'lucide-react';
import { ExecutiveMetrics } from '@/core/domain/metrics.types';
import { useI18n } from '@/core/i18n/I18nContext';
import { KpiMetricCard } from '../molecules/KpiMetricCard';
import { DomainBadge } from '../molecules/DomainBadge';
import { Card } from '../atoms/Card';

interface ExecutiveKpiGridProps {
  metrics: ExecutiveMetrics;
  isClassifying?: boolean;
}

export const ExecutiveKpiGrid: React.FC<ExecutiveKpiGridProps> = ({
  metrics,
  isClassifying = false,
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

      {/* Distribución de Taxonomía / Intereses */}
      {metrics.domainDistribution.length > 0 && (
        <Card className="p-3 bg-surface-card/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-content-secondary">
              {t('kpi.interestDistribution')}
            </span>
            <span className="text-[11px] text-content-muted">
              {metrics.activeTabsCount} {t('kpi.analyzedTabs')}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {metrics.domainDistribution.map((item) => (
              <div key={item.domain} className="flex items-center gap-1.5">
                <DomainBadge domain={item.domain} />
                <span className="text-xs font-semibold text-content-secondary">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
