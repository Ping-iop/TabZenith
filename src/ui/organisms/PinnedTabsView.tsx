import React, { useState, useMemo } from 'react';
import {
  Pin,
  ShieldCheck,
  Search,
  Globe,
  Snowflake,
  ExternalLink,
  Copy,
  Check,
  HardDrive,
  Star,
} from 'lucide-react';
import { TabItem } from '@/core/domain/tab.types';
import { useI18n } from '@/core/i18n/I18nContext';
import { Input } from '../atoms/Input';
import { Card } from '../atoms/Card';
import { EmptyState } from '../atoms/EmptyState';
import { container } from '@/core/di/container';
import { cn } from '../utils/cn';

interface PinnedTabsViewProps {
  pinnedTabs: readonly TabItem[];
  isFavorite?: (url: string) => boolean;
  onToggleFavorite?: (url: string) => void;
}

export const PinnedTabsView: React.FC<PinnedTabsViewProps> = ({
  pinnedTabs,
  isFavorite,
  onToggleFavorite,
}) => {
  const { t } = useI18n();
  const [filterText, setFilterText] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const filteredTabs = useMemo(() => {
    if (!filterText.trim()) return pinnedTabs;
    const q = filterText.toLowerCase();
    return pinnedTabs.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.url.toLowerCase().includes(q) ||
        t.domain.toLowerCase().includes(q)
    );
  }, [pinnedTabs, filterText]);

  const activeCount = pinnedTabs.filter((t) => !t.discarded).length;
  const discardedCount = pinnedTabs.filter((t) => t.discarded).length;
  const ramUsageMb = activeCount * 150 + discardedCount * 15;
  const formattedRam =
    ramUsageMb >= 1024
      ? `${(ramUsageMb / 1024).toFixed(1)} GB`
      : `${ramUsageMb} MB`;

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 1500);
    } catch {
      // ignore
    }
  };

  if (pinnedTabs.length === 0) {
    return (
      <EmptyState
        icon={<Pin className="w-8 h-8 text-blue-400" />}
        title={t('pinned.empty')}
        description={t('pinned.emptyDesc')}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Aviso de Protección Estricta */}
      <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-blue-300 block">
            {t('pinned.title')} ({pinnedTabs.length})
          </span>
          <p className="text-blue-200/80 mt-0.5">
            {t('pinned.protectedNotice')}
          </p>
        </div>
      </div>

      {/* Cabecera y Buscador */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded-full bg-surface-elevated text-content-secondary font-medium border border-border-default/60 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>Consumo aproximado: ~{formattedRam} RAM</span>
          </span>
        </div>

        <Input
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder={t('action.filterPlaceholder')}
          leftIcon={<Search className="w-3.5 h-3.5 text-brand-primary" />}
          className="w-64 bg-surface-card text-xs"
        />
      </div>

      {/* Listado de Pestañas Fijadas */}
      <Card className="divide-y divide-surface-border/60 bg-surface-card overflow-hidden">
        {filteredTabs.length === 0 ? (
          <div className="p-6 text-center text-xs text-content-muted">
            No se encontraron pestañas fijadas que coincidan con la búsqueda.
          </div>
        ) : (
          filteredTabs.map((tab) => (
            <div
              key={tab.id}
              className="p-3 flex items-center justify-between gap-3 hover:bg-surface-elevated/40 transition-colors text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <Pin className="w-3.5 h-3.5 text-blue-400 fill-blue-400/40" />
                </div>

                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  {tab.favIconUrl ? (
                    <img
                      src={tab.favIconUrl}
                      alt=""
                      className="w-4 h-4 rounded-sm object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Globe className="w-4 h-4 text-content-muted" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => container.browserTabs.createTab(tab.url, true)}
                      title={tab.url}
                      className="font-medium text-content-primary hover:text-brand-primary truncate cursor-pointer block"
                    >
                      {tab.title}
                    </span>
                    {tab.active && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
                        Activa
                      </span>
                    )}
                    {tab.discarded && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-0.5 flex-shrink-0">
                        <Snowflake className="w-2.5 h-2.5" />
                        <span>RAM liberada</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-content-muted truncate block">
                    {tab.url}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[10px] font-mono text-content-secondary px-1.5 py-0.5 rounded bg-surface-subtle border border-surface-border">
                  {tab.domain}
                </span>

                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(tab.url)}
                    title={isFavorite?.(tab.url) ? 'Quitar de favoritos' : 'Marcar como favorita'}
                    className="p-1 rounded text-content-muted hover:text-amber-400 hover:bg-surface-elevated transition-colors"
                  >
                    <Star
                      className={cn(
                        'w-3.5 h-3.5',
                        isFavorite?.(tab.url)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-content-muted'
                      )}
                    />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleCopyUrl(tab.url)}
                  title="Copiar URL"
                  className="p-1 rounded text-content-muted hover:text-content-primary hover:bg-surface-elevated transition-colors"
                >
                  {copiedUrl === tab.url ? (
                    <Check className="w-3.5 h-3.5 text-status-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => container.browserTabs.createTab(tab.url, true)}
                  title="Abrir en Chrome"
                  className="p-1 rounded text-content-muted hover:text-brand-primary hover:bg-surface-elevated transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};
