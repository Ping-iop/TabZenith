import React from 'react';
import {
  RotateCcw,
  Trash2,
  ExternalLink,
  History,
  Globe,
  Sparkles,
  Layers,
} from 'lucide-react';
import { ClosedTabItem } from '@/core/domain/closed-tab.types';
import { useI18n } from '@/core/i18n/I18nContext';

interface ClosedTabsViewProps {
  readonly closedTabs: readonly ClosedTabItem[];
  readonly onRestoreTab: (tab: ClosedTabItem) => Promise<void>;
  readonly onRestoreAll: () => Promise<void>;
  readonly onClearHistory: () => Promise<void>;
}

export const ClosedTabsView: React.FC<ClosedTabsViewProps> = ({
  closedTabs,
  onRestoreTab,
  onRestoreAll,
  onClearHistory,
}) => {
  const { t } = useI18n();

  const formatRelativeTime = (timestamp: number): string => {
    const diff = Math.max(0, Date.now() - timestamp);
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `hace ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="space-y-6">
      {/* Encabezado de la Vista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card p-6 rounded-2xl border border-surface-border">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-content-primary">
                {t('closedTabs.title')}
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-surface-subtle border border-surface-border text-content-secondary">
                {closedTabs.length}
              </span>
            </div>
            <p className="text-sm text-content-muted mt-1">
              {t('closedTabs.desc')}
            </p>
          </div>
        </div>

        {closedTabs.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={onRestoreAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-primary text-content-primary text-xs font-semibold hover:bg-brand-primary/90 transition-colors shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('closedTabs.restoreAll')}</span>
            </button>
            <button
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-subtle hover:bg-surface-elevated text-content-muted hover:text-status-danger border border-surface-border text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('closedTabs.clearHistory')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Lista de Pestañas Cerradas */}
      {closedTabs.length === 0 ? (
        <div className="text-center py-16 bg-surface-card/40 rounded-2xl border border-surface-border/60">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-surface-subtle flex items-center justify-center text-content-muted">
            <History className="w-6 h-6 opacity-60" />
          </div>
          <h3 className="text-base font-semibold text-content-primary">
            {t('closedTabs.emptyTitle')}
          </h3>
          <p className="text-xs text-content-muted max-w-sm mx-auto mt-1">
            {t('closedTabs.emptyDesc')}
          </p>
        </div>
      ) : (
        <div className="bg-surface-card rounded-2xl border border-surface-border divide-y divide-surface-border/60 overflow-hidden">
          {closedTabs.map((item) => (
            <div
              key={item.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-surface-subtle/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {item.favIconUrl ? (
                  <img
                    src={item.favIconUrl}
                    alt=""
                    className="w-4 h-4 rounded shrink-0 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Globe className="w-4 h-4 text-content-muted shrink-0" />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-content-primary truncate">
                      {item.title}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        item.reason === 'deduplicate'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-surface-subtle text-content-muted border border-surface-border'
                      }`}
                    >
                      {item.reason === 'deduplicate'
                        ? t('closedTabs.reasonDeduplicate')
                        : t('closedTabs.reasonManual')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-content-muted truncate">
                    <span className="text-brand-primary/80 font-mono text-[11px]">
                      {item.domain}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-md">{item.url}</span>
                    <span>•</span>
                    <span className="shrink-0">{formatRelativeTime(item.closedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Botón Undo / Reabrir */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onRestoreTab(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/30 text-xs font-semibold transition-colors cursor-pointer"
                  title="Reabrir pestaña en el navegador"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('closedTabs.btnUndo')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
