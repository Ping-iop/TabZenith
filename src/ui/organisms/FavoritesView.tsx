import React, { useState, useMemo } from 'react';
import {
  Star,
  ExternalLink,
  Search,
  Globe,
  Snowflake,
  Trash2,
  Copy,
  Check,
  FolderOpen,
} from 'lucide-react';
import { TabItem } from '@/core/domain/tab.types';
import { useI18n } from '@/core/i18n/I18nContext';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Card } from '../atoms/Card';
import { EmptyState } from '../atoms/EmptyState';
import { container } from '@/core/di/container';

interface FavoritesViewProps {
  openTabs: readonly TabItem[];
  favoriteUrls: Set<string>;
  onToggleFavorite: (url: string) => void;
  onCloseTab?: (tabId: string) => void;
  onSuspendTab?: (tabId: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  openTabs,
  favoriteUrls,
  onToggleFavorite,
  onCloseTab,
  onSuspendTab,
}) => {
  const { t } = useI18n();
  const [filterText, setFilterText] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Mapear pestañas abiertas por URL
  const openTabMap = useMemo(() => {
    const map = new Map<string, TabItem>();
    openTabs.forEach((tab) => {
      map.set(tab.url, tab);
    });
    return map;
  }, [openTabs]);

  // Lista de URLs favoritas
  const favoriteList = useMemo(() => {
    return Array.from(favoriteUrls).map((url) => {
      const openTab = openTabMap.get(url);
      let domain = '';
      try {
        domain = new URL(url).hostname.replace(/^www\./, '');
      } catch {
        domain = 'link';
      }

      return {
        url,
        title: openTab?.title || url,
        domain: openTab?.domain || domain,
        favIconUrl: openTab?.favIconUrl,
        isOpen: Boolean(openTab),
        tabId: openTab?.id,
        discarded: openTab?.discarded ?? false,
      };
    });
  }, [favoriteUrls, openTabMap]);

  // Filtrado por buscador
  const filteredFavorites = useMemo(() => {
    if (!filterText.trim()) return favoriteList;
    const q = filterText.toLowerCase();
    return favoriteList.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        item.domain.toLowerCase().includes(q)
    );
  }, [favoriteList, filterText]);

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 1500);
    } catch {
      // ignore
    }
  };

  const handleOpenAllFavorites = async () => {
    for (const item of filteredFavorites) {
      if (!item.isOpen) {
        await container.browserTabs.createTab(item.url, false);
      }
    }
  };

  if (favoriteUrls.size === 0) {
    return (
      <EmptyState
        icon={<Star className="w-8 h-8 text-amber-400" />}
        title={t('favorites.empty')}
        description={t('favorites.emptyDesc')}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabecera y Barra de Búsqueda */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-content-secondary uppercase tracking-wider">
              {t('favorites.title')} ({favoriteUrls.size})
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-medium border border-amber-500/30 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{favoriteList.filter((f) => f.isOpen).length} abiertas</span>
            </span>
          </div>
          <span className="text-xs text-content-muted">
            {t('favorites.desc')}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder={t('action.filterPlaceholder')}
            leftIcon={<Search className="w-3.5 h-3.5 text-brand-primary" />}
            className="w-56 bg-surface-card text-xs"
          />

          <Button
            size="sm"
            variant="outline"
            leftIcon={<FolderOpen className="w-3.5 h-3.5 text-amber-400" />}
            onClick={handleOpenAllFavorites}
            className="text-xs"
          >
            {t('favorites.openAll')}
          </Button>
        </div>
      </div>

      {/* Listado de Pestañas Favoritas */}
      <Card className="divide-y divide-surface-border/60 bg-surface-card overflow-hidden">
        {filteredFavorites.length === 0 ? (
          <div className="p-6 text-center text-xs text-content-muted">
            No se encontraron favoritos que coincidan con la búsqueda.
          </div>
        ) : (
          filteredFavorites.map((item) => (
            <div
              key={item.url}
              className="p-3 flex items-center justify-between gap-3 hover:bg-surface-elevated/40 transition-colors text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Botón de desmarcar favorito */}
                <button
                  type="button"
                  onClick={() => onToggleFavorite(item.url)}
                  title="Quitar de favoritos"
                  className="p-1 rounded text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Star className="w-4 h-4 fill-amber-400" />
                </button>

                {/* Favicon */}
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  {item.favIconUrl ? (
                    <img
                      src={item.favIconUrl}
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

                {/* Título y URL */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => {
                        if (item.isOpen && item.tabId) {
                          container.browserTabs.activateTab(item.tabId);
                        } else {
                          container.browserTabs.createTab(item.url, true);
                        }
                      }}
                      title={item.isOpen ? `Ir a esta pestaña en Chrome: ${item.title}` : `Abrir en Chrome: ${item.title}`}
                      className="font-medium text-content-primary hover:text-brand-primary truncate cursor-pointer block"
                    >
                      {item.title}
                    </span>
                    {item.isOpen && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
                        Abierta
                      </span>
                    )}
                    {item.discarded && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-0.5 flex-shrink-0">
                        <Snowflake className="w-2.5 h-2.5" />
                        <span>RAM liberada</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-content-muted truncate block">
                    {item.url}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[10px] font-mono text-content-secondary px-1.5 py-0.5 rounded bg-surface-subtle border border-surface-border">
                  {item.domain}
                </span>

                <button
                  type="button"
                  onClick={() => handleCopyUrl(item.url)}
                  title="Copiar URL"
                  className="p-1 rounded text-content-muted hover:text-content-primary hover:bg-surface-elevated transition-colors"
                >
                  {copiedUrl === item.url ? (
                    <Check className="w-3.5 h-3.5 text-status-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (item.isOpen && item.tabId) {
                      container.browserTabs.activateTab(item.tabId);
                    } else {
                      container.browserTabs.createTab(item.url, true);
                    }
                  }}
                  title={item.isOpen ? 'Ir a esta pestaña en Chrome' : 'Abrir en Chrome'}
                  className="p-1 rounded text-content-muted hover:text-brand-primary hover:bg-surface-elevated transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                {item.tabId && !item.discarded && onSuspendTab && (
                  <button
                    type="button"
                    onClick={() => onSuspendTab(item.tabId!)}
                    title="Congelar pestaña (liberar RAM)"
                    className="p-1 rounded text-content-muted hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                  >
                    <Snowflake className="w-3.5 h-3.5" />
                  </button>
                )}

                {item.tabId && onCloseTab && (
                  <button
                    type="button"
                    onClick={() => onCloseTab(item.tabId!)}
                    title="Cerrar pestaña abierta en Chrome"
                    className="p-1 rounded text-content-muted hover:text-status-danger hover:bg-status-danger-subtle transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};
