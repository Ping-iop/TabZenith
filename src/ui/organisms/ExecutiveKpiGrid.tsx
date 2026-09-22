import React from 'react';
import { Layers, HardDrive, CheckCircle2, Cpu } from 'lucide-react';
import { ExecutiveMetrics } from '@/core/domain/metrics.types';
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
          title="Pestañas Activas"
          value={metrics.activeTabsCount}
          subtext={`${metrics.discardedTabsCount} congeladas en RAM`}
          icon={<Layers className="w-5 h-5" />}
        />
        <KpiMetricCard
          title="RAM Ahorrada Estimada"
          value={ramFormatted}
          subtext="Por descarte y guardado en stash"
          icon={<HardDrive className="w-5 h-5" />}
          variant="success"
        />
        <KpiMetricCard
          title="Tasa de Curaduría"
          value={`${metrics.curationRatePercent}%`}
          subtext={`${metrics.inboxPendingCount} enlaces pendientes`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant={metrics.curationRatePercent >= 70 ? 'success' : 'warning'}
        />
        <KpiMetricCard
          title="Enfoque Laya Core"
          value={topDomain ? `${topDomain.percentage}%` : 'N/A'}
          subtext={
            isClassifying
              ? 'Clasificando con IA...'
              : topDomain
              ? `Dominio principal: ${topDomain.domain}`
              : 'Sin pestañas activas'
          }
          icon={<Cpu className="w-5 h-5" />}
          variant="info"
        />
      </div>

      {/* Barra de Distribución Taxonómica Laya */}
      {metrics.domainDistribution.length > 0 && (
        <Card className="p-3 bg-surface-card/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-content-secondary uppercase tracking-wider">
              Distribución de Intereses (Taxonomía Laya CPU)
            </span>
            <span className="text-xs text-content-muted">
              {metrics.activeTabsCount} pestañas analizadas
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
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
