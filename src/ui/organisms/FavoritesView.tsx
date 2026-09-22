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
  FolderPlus,
  Folder,
  X,
} from 'lucide-react';
import { TabItem } from '@/core/domain/tab.types';
import { useI18n } from '@/core/i18n/I18nContext';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Card } from '../atoms/Card';
import { EmptyState } from '../atoms/EmptyState';
import { container } from '@/core/di/container';
import {
  InspirationFolder,
  FavoriteEntry,
  INSPIRATION_FOLDER_COLORS,
} from '@/core/domain/favorites.types';
import { cn } from '../utils/cn';

interface FavoritesViewProps {
  openTabs: readonly TabItem[];
  favoriteUrls: Set<string>;
  entries?: Map<string, FavoriteEntry>;
  folders?: readonly InspirationFolder[];
  onToggleFavorite: (url: string) => void;
  onSetTabFolder?: (url: string, folderId?: string) => void;
  onCreateFolder?: (name: string, color?: string) => Promise<any>;
  onDeleteFolder?: (folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, name: string, color?: string) => Promise<void>;
  onCloseTab?: (tabId: string) => void;
  onSuspendTab?: (tabId: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  openTabs,
  favoriteUrls,
  entries = new Map(),
  folders = [],
  onToggleFavorite,
  onSetTabFolder,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder: _onRenameFolder,
  onCloseTab: _onCloseTab,
  onSuspendTab: _onSuspendTab,
}) => {
  const { t } = useI18n();
  const [filterText, setFilterText] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all'); // 'all', 'none', or folder id
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Estado para creación de nueva carpeta
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('purple');

  // Mapear pestañas abiertas por URL
  const openTabMap = useMemo(() => {
    const map = new Map<string, TabItem>();
    openTabs.forEach((tab) => {
      map.set(tab.url, tab);
    });
    return map;
  }, [openTabs]);

  // Lista de URLs favoritas con sus metadatos de carpeta
  const favoriteList = useMemo(() => {
    return Array.from(favoriteUrls).map((url) => {
      const openTab = openTabMap.get(url);
      const entry = entries.get(url);
      let domain = '';
      try {
        domain = new URL(url).hostname.replace(/^www\./, '');
      } catch {
        domain = 'link';
      }

      return {
        url,
        title: entry?.title || openTab?.title || url,
        domain: openTab?.domain || domain,
        favIconUrl: openTab?.favIconUrl,
        isOpen: Boolean(openTab),
        tabId: openTab?.id,
        discarded: openTab?.discarded ?? false,
        folderId: entry?.folderId,
      };
    });
  }, [favoriteUrls, openTabMap, entries]);

  // Filtrado por carpeta y buscador
  const filteredFavorites = useMemo(() => {
    return favoriteList.filter((item) => {
      // Filtro de carpeta
      if (selectedFolderId !== 'all') {
        if (selectedFolderId === 'none') {
          if (item.folderId) return false;
        } else if (item.folderId !== selectedFolderId) {
          return false;
        }
      }

      // Filtro de texto
      if (!filterText.trim()) return true;
      const q = filterText.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        item.domain.toLowerCase().includes(q)
      );
    });
  }, [favoriteList, selectedFolderId, filterText]);

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 1500);
    } catch {
      // ignore
    }
  };

  const handleOpenAllInFolder = async () => {
    for (const item of filteredFavorites) {
      if (!item.isOpen) {
        await container.browserTabs.createTab(item.url, false);
      }
    }
  };

  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !onCreateFolder) return;
    await onCreateFolder(newFolderName.trim(), newFolderColor);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const getFolderColorConfig = (colorId: string) => {
    return (
      INSPIRATION_FOLDER_COLORS.find((c) => c.id === colorId) ||
      INSPIRATION_FOLDER_COLORS[0]
    );
  };

  return (
    <div className="space-y-4">
      {/* Cabecera Principal */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-content-primary flex items-center gap-2">
            <span>{t('favorites.title')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              {favoriteUrls.size} {favoriteUrls.size === 1 ? t('common.tabSingular') : t('common.tabPlural')}
            </span>
          </h2>
          <p className="text-xs text-content-muted mt-0.5">
            {t('favorites.desc')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {filteredFavorites.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FolderOpen className="w-3.5 h-3.5 text-brand-primary" />}
              onClick={handleOpenAllInFolder}
              className="text-xs"
              title={t('favorites.openAll')}
            >
              {t('favorites.openAll')} ({filteredFavorites.length})
            </Button>
          )}

          <Button
            size="sm"
            variant="primary"
            leftIcon={<FolderPlus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreatingFolder(true)}
            className="text-xs"
          >
            Nueva Carpeta Temática
          </Button>
        </div>
      </div>

      {/* Modal / Diálogo para crear Carpeta de Inspiración */}
      {isCreatingFolder && (
        <Card className="p-4 bg-surface-card border-brand-primary/40 shadow-xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-surface-border pb-2">
            <span className="text-xs font-bold text-content-primary flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-brand-primary" />
              <span>Crear Carpeta de Inspiración</span>
            </span>
            <button
              onClick={() => setIsCreatingFolder(false)}
              className="p-1 rounded text-content-muted hover:text-content-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateFolderSubmit} className="space-y-3">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Ej: UI & Diseño, Ideas de Producto, Papers IA..."
              className="text-xs"
              autoFocus
            />

            <div>
              <label className="text-[11px] font-semibold text-content-secondary block mb-1.5">
                Color de Identificación
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {INSPIRATION_FOLDER_COLORS.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setNewFolderColor(col.id)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-all',
                      newFolderColor === col.id
                        ? `${col.bg} ${col.border} ${col.text} ring-2 ring-brand-primary font-bold`
                        : 'bg-surface-subtle border-surface-border text-content-secondary hover:text-content-primary'
                    )}
                  >
                    <span className={cn('w-2 h-2 rounded-full', col.dot)} />
                    <span>{col.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setIsCreatingFolder(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" variant="primary" className="text-xs">
                Guardar Carpeta
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Barra de Carpetas Temáticas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {/* Tab: Todos */}
        <button
          type="button"
          onClick={() => setSelectedFolderId('all')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer font-medium',
            selectedFolderId === 'all'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold shadow-sm'
              : 'bg-surface-card border-surface-border text-content-secondary hover:text-content-primary'
          )}
        >
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('inbox.filterAll')} ({favoriteList.length})</span>
        </button>

        {/* Tab: Sin Carpeta */}
        <button
          type="button"
          onClick={() => setSelectedFolderId('none')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer font-medium',
            selectedFolderId === 'none'
              ? 'bg-brand-primary/20 text-brand-primary border-brand-primary/40 font-bold shadow-sm'
              : 'bg-surface-card border-surface-border text-content-secondary hover:text-content-primary'
          )}
        >
          <Folder className="w-3.5 h-3.5 text-content-muted" />
          <span>{t('grid.noGroup')} ({favoriteList.filter((f) => !f.folderId).length})</span>
        </button>

        {/* Carpetas personalizadas */}
        {folders.map((fld) => {
          const count = favoriteList.filter((f) => f.folderId === fld.id).length;
          const isSelected = selectedFolderId === fld.id;
          const col = getFolderColorConfig(fld.color);

          return (
            <div
              key={fld.id}
              className={cn(
                'group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer',
                isSelected
                  ? `${col.bg} ${col.border} ${col.text} font-bold shadow-sm ring-1 ring-brand-primary/30`
                  : 'bg-surface-card border-surface-border text-content-secondary hover:text-content-primary'
              )}
            >
              <button
                type="button"
                onClick={() => setSelectedFolderId(fld.id)}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <span className={cn('w-2 h-2 rounded-full', col.dot)} />
                <span>{fld.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>

              {onDeleteFolder && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`¿Eliminar la carpeta "${fld.name}"? Los enlaces no se borrarán.`)) {
                      onDeleteFolder(fld.id);
                      if (selectedFolderId === fld.id) setSelectedFolderId('all');
                    }
                  }}
                  title="Eliminar esta carpeta"
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-status-danger transition-opacity ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Buscador de Enlaces */}
      <div className="relative">
        <Input
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Buscar enlaces en esta carpeta..."
          leftIcon={<Search className="w-4 h-4 text-brand-primary" />}
          className="text-xs bg-surface-card"
        />
        {filterText && (
          <button
            onClick={() => setFilterText('')}
            className="absolute right-3 top-2.5 text-content-muted hover:text-content-primary cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Lista de Favoritos e Inspiración */}
      {filteredFavorites.length === 0 ? (
        <EmptyState
          icon={<Star className="w-8 h-8 text-amber-400" />}
          title={
            selectedFolderId !== 'all'
              ? 'No hay enlaces en esta carpeta temática'
              : 'No hay enlaces favoritos guardados'
          }
          description="Agrega enlaces a tu biblioteca haciendo clic en la estrella (⭐) de cualquier pestaña o grupo."
        />
      ) : (
        <Card className="divide-y divide-surface-border overflow-hidden bg-surface-card">
          {filteredFavorites.map((item) => {
            const currentFolder = folders.find((f) => f.id === item.folderId);
            const folderColor = currentFolder
              ? getFolderColorConfig(currentFolder.color)
              : null;

            return (
              <div
                key={item.url}
                className="flex items-center justify-between p-3 hover:bg-surface-elevated/40 transition-colors gap-3 text-xs"
              >
                {/* Icono e Info */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
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

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
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

                      {/* Selector / Badge de Carpeta Temática */}
                      {onSetTabFolder && (
                        <select
                          value={item.folderId || 'none'}
                          onChange={(e) => onSetTabFolder(item.url, e.target.value)}
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full border cursor-pointer font-medium outline-none transition-all',
                            folderColor
                              ? `${folderColor.bg} ${folderColor.border} ${folderColor.text}`
                              : 'bg-surface-subtle text-content-muted border-surface-border'
                          )}
                          title="Cambiar carpeta temática"
                        >
                          <option value="none">Sin Carpeta</option>
                          {folders.map((fld) => (
                            <option key={fld.id} value={fld.id}>
                              📁 {fld.name}
                            </option>
                          ))}
                        </select>
                      )}

                      {item.isOpen && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
                          {t('grid.statusActive')}
                        </span>
                      )}
                      {item.discarded && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-0.5 flex-shrink-0">
                          <Snowflake className="w-2.5 h-2.5" />
                          <span>{t('grid.statusFrozen')}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-content-muted truncate block">
                      {item.url}
                    </span>
                  </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] font-mono text-content-secondary px-1.5 py-0.5 rounded bg-surface-subtle border border-surface-border">
                    {item.domain}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopyUrl(item.url)}
                    title={t('context.copyUrl')}
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
                    title={item.isOpen ? `${t('context.goToTab')}: ${item.title}` : `Chrome: ${item.title}`}
                    className="p-1 rounded text-content-muted hover:text-brand-primary hover:bg-surface-elevated transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleFavorite(item.url)}
                    title="Quitar de favoritos"
                    className="p-1 rounded text-amber-400 hover:text-status-danger hover:bg-status-danger-subtle transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
};
