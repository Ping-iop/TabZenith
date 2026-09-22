import React, { useState } from 'react';
import {
  History,
  RotateCcw,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Search,
  FolderInput,
  Sparkles,
  Copy,
  Check,
  Globe,
  Star,
  ChevronsDownUp,
  ChevronsUpDown,
} from 'lucide-react';
import { SessionSnapshot } from '@/core/domain/session.types';
import { TabItem } from '@/core/domain/tab.types';
import { TabGroup } from '@/core/domain/group.types';
import { GROUP_COLOR_CLASSES } from '../tokens/colors.tokens';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Card } from '../atoms/Card';
import { EmptyState } from '../atoms/EmptyState';
import { container } from '@/core/di/container';
import { useI18n } from '@/core/i18n/I18nContext';
import { cn } from '../utils/cn';

interface SessionsViewProps {
  sessions: readonly SessionSnapshot[];
  onRestore: (session: SessionSnapshot) => void;
  onRestoreGroup?: (group: TabGroup, tabs: readonly TabItem[]) => void;
  onRestoreSelectedTabs?: (tabs: readonly TabItem[]) => void;
  onRemoveTabFromSession?: (sessionId: string, tabId: string) => void;
  onDelete: (sessionId: string) => void;
  onSessionUpdated?: () => void;
  isFavorite?: (url: string) => boolean;
  onToggleFavorite?: (url: string) => void;
}

export const SessionsView: React.FC<SessionsViewProps> = ({
  sessions,
  onRestore,
  onRestoreGroup,
  onRestoreSelectedTabs,
  onRemoveTabFromSession,
  onDelete,
  onSessionUpdated,
  isFavorite,
  onToggleFavorite,
}) => {
  const { t } = useI18n();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTabIds, setSelectedTabIds] = useState<Set<string>>(new Set());
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isClassifyingSession, setIsClassifyingSession] = useState(false);
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(new Set());

  const handleExportBackup = () => {
    if (sessions.length === 0) return;
    const json = JSON.stringify(sessions, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabzenith_sesiones_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const raw = event.target?.result as string;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const s of parsed) {
            if (s.id && s.tabs) {
              await container.storage.saveSession(s);
            }
          }
          onSessionUpdated?.();
        }
      } catch (err) {
        console.error('Error importando backup de sesiones:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const formatDate = (epoch: number) => {
    return new Date(epoch).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleExpand = (sessionId: string) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
      setSelectedTabIds(new Set());
      setSearchFilter('');
    } else {
      setExpandedSessionId(sessionId);
      setSelectedTabIds(new Set());
      setSearchFilter('');
    }
  };

  const toggleSelectTab = (tabId: string) => {
    setSelectedTabIds((prev) => {
      const next = new Set(prev);
      if (next.has(tabId)) next.delete(tabId);
      else next.add(tabId);
      return next;
    });
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 1500);
    } catch {
      // ignore
    }
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleCollapseAllGroups = (session: SessionSnapshot) => {
    setCollapsedGroupIds(new Set(session.groups.map((g) => g.id)));
  };

  const handleExpandAllGroups = () => {
    setCollapsedGroupIds(new Set());
  };

  // Clasificar sesión existente con Laya Core aplicando regla de sitios únicos a 'Otros'
  const handleAutoClassifySession = async (session: SessionSnapshot) => {
    setIsClassifyingSession(true);
    try {
      const classifications = await container.classifier.classifyBatch(
        session.tabs.map((t) => ({ title: t.title, url: t.url }))
      );

      const categoryBuckets = new Map<string, { color: TabGroup['color']; tabs: TabItem[] }>();

      session.tabs.forEach((tab, index) => {
        const c = classifications[index];
        const groupName = c.suggestedGroupName;
        const bucket = categoryBuckets.get(groupName) || {
          color: c.suggestedColor,
          tabs: [],
        };
        bucket.tabs.push({
          ...tab,
          tags: Array.from(new Set([...tab.tags, c.primaryDomain])),
        });
        categoryBuckets.set(groupName, bucket);
      });

      const finalGroups: TabGroup[] = [];
      const updatedTabs: TabItem[] = [];
      const singleTabs: TabItem[] = [];

      for (const [groupName, bucket] of categoryBuckets.entries()) {
        if (bucket.tabs.length === 1) {
          singleTabs.push(bucket.tabs[0]);
        } else if (bucket.tabs.length > 1) {
          const group: TabGroup = {
            id: `grp_laya_${Math.random().toString(36).slice(2, 8)}`,
            title: groupName,
            color: bucket.color,
            collapsed: false,
            createdAt: Date.now(),
          };
          finalGroups.push(group);
          bucket.tabs.forEach((t) => {
            updatedTabs.push({ ...t, groupId: group.id });
          });
        }
      }

      // Unificar sitios únicos en "Otros" ordenados alfabéticamente
      if (singleTabs.length > 0) {
        singleTabs.sort((a, b) => {
          const dComp = a.domain.localeCompare(b.domain, undefined, { sensitivity: 'base' });
          if (dComp !== 0) return dComp;
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        });

        const othersGroup: TabGroup = {
          id: `grp_laya_otros_${Date.now()}`,
          title: 'Otros',
          color: 'grey',
          collapsed: false,
          createdAt: Date.now(),
        };
        finalGroups.push(othersGroup);
        singleTabs.forEach((t) => {
          updatedTabs.push({ ...t, groupId: othersGroup.id });
        });
      }

      const updatedSession: SessionSnapshot = {
        ...session,
        groups: finalGroups,
        tabs: updatedTabs,
      };

      await container.storage.saveSession(updatedSession);
      onSessionUpdated?.();
    } catch (err) {
      console.error('Error al clasificar sesión:', err);
    } finally {
      setIsClassifyingSession(false);
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-content-secondary uppercase tracking-wider">
            {t('session.title')} (0)
          </h3>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border-default hover:bg-surface-elevated text-xs text-content-secondary hover:text-content-primary font-medium transition-colors">
                <FolderInput className="w-3.5 h-3.5 text-blue-400" />
                Importar Backup JSON
              </span>
            </label>
          </div>
        </div>

        <EmptyState
          icon={<History className="w-8 h-8" />}
          title={t('session.empty')}
          description={t('session.desc')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold text-content-secondary uppercase tracking-wider">
            {t('session.title')} ({sessions.length})
          </h3>
          <span className="text-xs text-content-muted">
            {t('session.desc')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Copy className="w-3.5 h-3.5 text-emerald-400" />}
            onClick={handleExportBackup}
            title="Exportar archivo JSON con todas las sesiones"
            className="text-xs border-slate-700 hover:bg-slate-800"
          >
            Exportar JSON
          </Button>

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-content-secondary hover:text-content-primary font-medium transition-colors">
              <FolderInput className="w-3.5 h-3.5 text-blue-400" />
              Importar JSON
            </span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => {
          const isExpanded = expandedSessionId === session.id;

          // Filtrar pestañas de la sesión según el buscador
          const filteredTabs = session.tabs.filter((t) => {
            if (!searchFilter.trim()) return true;
            const q = searchFilter.toLowerCase();
            return (
              t.title.toLowerCase().includes(q) ||
              t.url.toLowerCase().includes(q) ||
              t.domain.toLowerCase().includes(q)
            );
          });

          // Agrupar las pestañas de esta sesión
          const groupMap = new Map<string, TabGroup>();
          session.groups.forEach((g) => groupMap.set(g.id, g));

          const groupedTabs = new Map<string, TabItem[]>();
          const ungroupedTabs: TabItem[] = [];

          filteredTabs.forEach((tab) => {
            if (tab.groupId && groupMap.has(tab.groupId)) {
              const existing = groupedTabs.get(tab.groupId) || [];
              existing.push(tab);
              groupedTabs.set(tab.groupId, existing);
            } else {
              ungroupedTabs.push(tab);
            }
          });

          return (
            <Card
              key={session.id}
              className={cn(
                'border transition-all overflow-hidden',
                isExpanded
                  ? 'border-brand-primary/60 shadow-elevated bg-surface-card'
                  : 'hover:border-surface-border bg-surface-card/90'
              )}
            >
              {/* Encabezado de Sesión */}
              <div className="p-4 flex items-center justify-between flex-wrap gap-3 border-b border-surface-border/60">
                <div
                  className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-[240px]"
                  onClick={() => toggleExpand(session.id)}
                >
                  <button className="text-content-muted hover:text-content-primary">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-brand-primary" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-content-primary text-sm hover:text-brand-primary transition-colors">
                        {session.name}
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surface-elevated text-brand-primary font-semibold border border-brand-border">
                        {session.tabCount} {t('session.tabCount')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-content-muted mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(session.createdAt)}</span>
                      </span>
                      <span>•</span>
                      <span>
                        {session.groups.length} {t('session.groupCount')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones Globales de la Sesión */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isExpanded ? 'secondary' : 'outline'}
                    onClick={() => toggleExpand(session.id)}
                    className="text-xs"
                  >
                    {isExpanded ? '▲' : '▼'}
                  </Button>

                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    onClick={() => onRestore(session)}
                    className="text-xs"
                  >
                    {t('session.restoreAll')}
                  </Button>

                  <button
                    onClick={() => onDelete(session.id)}
                    title={t('session.delete')}
                    className="p-2 rounded text-content-muted hover:text-status-danger hover:bg-status-danger-subtle transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Vista Expandida: Explorador y Restauración Granular */}
              {isExpanded && (
                <div className="p-4 space-y-4 bg-surface-subtle/30 animate-in fade-in">
                  {/* Barra de Herramientas Interna */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <Input
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder={`Buscar entre las ${session.tabCount} pestañas de esta sesión...`}
                      leftIcon={<Search className="w-4 h-4 text-brand-primary" />}
                      className="max-w-md bg-surface-card text-xs"
                    />

                    <div className="flex items-center gap-2 flex-wrap">
                      {session.groups.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<ChevronsDownUp className="w-3 h-3 text-content-secondary" />}
                            onClick={() => handleCollapseAllGroups(session)}
                            title="Ocultar todas las pestañas de los grupos"
                            className="text-xs py-1 px-2.5 border-surface-border text-content-secondary hover:text-content-primary"
                          >
                            {t('session.collapseAllGroups')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<ChevronsUpDown className="w-3 h-3 text-content-secondary" />}
                            onClick={handleExpandAllGroups}
                            title="Mostrar todas las pestañas de los grupos"
                            className="text-xs py-1 px-2.5 border-surface-border text-content-secondary hover:text-content-primary"
                          >
                            {t('session.expandAllGroups')}
                          </Button>
                        </div>
                      )}

                      {session.groups.length === 0 && (
                        <Button
                          size="sm"
                          variant="secondary"
                          isLoading={isClassifyingSession}
                          leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-primary" />}
                          onClick={() => handleAutoClassifySession(session)}
                          title="Usa Laya Core en CPU para organizar automáticamente las pestañas de esta sesión"
                          className="text-xs"
                        >
                          Clasificar con Laya
                        </Button>
                      )}

                      {selectedTabIds.size > 0 && onRestoreSelectedTabs && (
                        <Button
                          size="sm"
                          variant="primary"
                          leftIcon={<FolderInput className="w-3.5 h-3.5" />}
                          onClick={() => {
                            const selectedTabs = session.tabs.filter((t) =>
                              selectedTabIds.has(t.id)
                            );
                            onRestoreSelectedTabs(selectedTabs);
                            setSelectedTabIds(new Set());
                          }}
                          className="text-xs bg-emerald-600 hover:bg-emerald-500"
                        >
                          Restaurar {selectedTabIds.size} seleccionadas
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Listado de Grupos en la Sesión */}
                  <div className="space-y-3">
                    {Array.from(groupedTabs.entries()).map(([groupId, groupTabs]) => {
                      const group = groupMap.get(groupId);
                      if (!group) return null;
                      const colorInfo = GROUP_COLOR_CLASSES[group.color];
                      const isGroupCollapsed = collapsedGroupIds.has(groupId);

                      return (
                        <div
                          key={groupId}
                          className={cn(
                            'rounded-lg border border-surface-border bg-surface-card/80 p-3 space-y-2'
                          )}
                        >
                          {/* Cabecera del Grupo en Sesión (Interactivo para mostrar u ocultar) */}
                          <div className="flex items-center justify-between border-b border-surface-border/50 pb-2">
                            <div
                              className="flex items-center gap-2 cursor-pointer select-none"
                              onClick={() => toggleGroupCollapse(groupId)}
                              title={isGroupCollapsed ? 'Mostrar pestañas del grupo' : 'Ocultar pestañas del grupo'}
                            >
                              <button
                                type="button"
                                className="text-content-muted hover:text-content-primary"
                              >
                                {isGroupCollapsed ? (
                                  <ChevronRight className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-brand-primary" />
                                )}
                              </button>
                              <span
                                className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', colorInfo.dot)}
                              />
                              <span className="font-semibold text-xs text-content-primary hover:text-brand-primary transition-colors">
                                {group.title}
                              </span>
                              <span className="text-[11px] text-content-muted">
                                ({groupTabs.length} pestañas)
                              </span>
                            </div>

                            {onRestoreGroup && (
                              <Button
                                size="sm"
                                variant="outline"
                                leftIcon={<RotateCcw className="w-3 h-3 text-brand-primary" />}
                                onClick={() => onRestoreGroup(group, groupTabs)}
                                className="text-xs py-1 px-2.5"
                              >
                                Restaurar este Grupo
                              </Button>
                            )}
                          </div>

                          {/* Pestañas del Grupo (Mostrar / Ocultar) */}
                          {!isGroupCollapsed && (
                            <div className="space-y-1.5 pt-1">
                            {groupTabs.map((tab) => (
                              <div
                                key={tab.id}
                                className={cn(
                                  'flex items-center justify-between p-2 rounded-md hover:bg-surface-elevated transition-colors text-xs border border-transparent',
                                  selectedTabIds.has(tab.id)
                                    ? 'bg-brand-subtle/20 border-brand-primary/40'
                                    : 'bg-surface-subtle/40'
                                )}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedTabIds.has(tab.id)}
                                    onChange={() => toggleSelectTab(tab.id)}
                                    className="w-3.5 h-3.5 rounded border-surface-border text-brand-primary focus:ring-brand-primary bg-surface-card"
                                  />
                                  <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                                    {tab.favIconUrl ? (
                                      <img
                                        src={tab.favIconUrl}
                                        alt=""
                                        className="w-3.5 h-3.5 rounded-sm object-contain"
                                        onError={(e) => {
                                          (e.target as HTMLElement).style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <Globe className="w-3.5 h-3.5 text-content-muted" />
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span
                                      className="font-medium text-content-primary truncate block hover:text-brand-primary cursor-pointer"
                                      title={tab.url}
                                      onClick={() => container.browserTabs.createTab(tab.url, true)}
                                    >
                                      {tab.title}
                                    </span>
                                    <span className="text-[10px] text-content-muted truncate block">
                                      {tab.url}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <span className="text-[10px] font-mono text-content-secondary px-1.5 py-0.5 rounded bg-surface-card border border-surface-border">
                                    {tab.domain}
                                  </span>

                                  {onToggleFavorite && (
                                    <button
                                      onClick={() => onToggleFavorite(tab.url)}
                                      title={isFavorite?.(tab.url) ? 'Quitar de favoritos' : 'Marcar como favorita'}
                                      className="p-1 rounded text-content-muted hover:text-amber-400 hover:bg-surface-elevated transition-colors"
                                    >
                                      <Star
                                        className={cn(
                                          'w-3 h-3',
                                          isFavorite?.(tab.url)
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-content-muted'
                                        )}
                                      />
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleCopyUrl(tab.url)}
                                    title="Copiar URL"
                                    className="p-1 rounded text-content-muted hover:text-content-primary hover:bg-surface-elevated transition-colors"
                                  >
                                    {copiedUrl === tab.url ? (
                                      <Check className="w-3 h-3 text-status-success" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>

                                  <button
                                    onClick={() => container.browserTabs.createTab(tab.url, true)}
                                    title="Abrir pestaña individual en Chrome"
                                    className="p-1 rounded text-content-muted hover:text-brand-primary hover:bg-surface-elevated transition-colors"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </button>

                                  {onRemoveTabFromSession && (
                                    <button
                                      onClick={() => onRemoveTabFromSession(session.id, tab.id)}
                                      title="Eliminar solo esta pestaña de la sesión"
                                      className="p-1 rounded text-content-muted hover:text-status-danger hover:bg-status-danger-subtle transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Pestañas sin grupo en la Sesión */}
                    {ungroupedTabs.length > 0 && (
                      <div className="rounded-lg border border-surface-border bg-surface-card/50 p-3 space-y-2">
                        <div className="flex items-center justify-between border-b border-surface-border/50 pb-2">
                          <span className="font-semibold text-xs text-content-secondary">
                            Pestañas Sueltas ({ungroupedTabs.length})
                          </span>
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {ungroupedTabs.map((tab) => (
                            <div
                              key={tab.id}
                              className={cn(
                                'flex items-center justify-between p-2 rounded-md hover:bg-surface-elevated transition-colors text-xs border border-transparent',
                                selectedTabIds.has(tab.id)
                                  ? 'bg-brand-subtle/20 border-brand-primary/40'
                                  : 'bg-surface-subtle/40'
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                                <input
                                  type="checkbox"
                                  checked={selectedTabIds.has(tab.id)}
                                  onChange={() => toggleSelectTab(tab.id)}
                                  className="w-3.5 h-3.5 rounded border-surface-border text-brand-primary focus:ring-brand-primary bg-surface-card"
                                />
                                <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                                  {tab.favIconUrl ? (
                                    <img
                                      src={tab.favIconUrl}
                                      alt=""
                                      className="w-3.5 h-3.5 rounded-sm object-contain"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <Globe className="w-3.5 h-3.5 text-content-muted" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span
                                    className="font-medium text-content-primary truncate block hover:text-brand-primary cursor-pointer"
                                    title={tab.url}
                                    onClick={() => container.browserTabs.createTab(tab.url, true)}
                                  >
                                    {tab.title}
                                  </span>
                                  <span className="text-[10px] text-content-muted truncate block">
                                    {tab.url}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="text-[10px] font-mono text-content-secondary px-1.5 py-0.5 rounded bg-surface-card border border-surface-border">
                                  {tab.domain}
                                </span>

                                {onToggleFavorite && (
                                  <button
                                    onClick={() => onToggleFavorite(tab.url)}
                                    title={isFavorite?.(tab.url) ? 'Quitar de favoritos' : 'Marcar como favorita'}
                                    className="p-1 rounded text-content-muted hover:text-amber-400 hover:bg-surface-elevated transition-colors"
                                  >
                                    <Star
                                      className={cn(
                                        'w-3 h-3',
                                        isFavorite?.(tab.url)
                                          ? 'text-amber-400 fill-amber-400'
                                          : 'text-content-muted'
                                      )}
                                    />
                                  </button>
                                )}

                                <button
                                  onClick={() => handleCopyUrl(tab.url)}
                                  title="Copiar URL"
                                  className="p-1 rounded text-content-muted hover:text-content-primary hover:bg-surface-elevated transition-colors"
                                >
                                  {copiedUrl === tab.url ? (
                                    <Check className="w-3 h-3 text-status-success" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>

                                <button
                                  onClick={() => container.browserTabs.createTab(tab.url, true)}
                                  title="Abrir pestaña individual en Chrome"
                                  className="p-1 rounded text-content-muted hover:text-brand-primary hover:bg-surface-elevated transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </button>

                                {onRemoveTabFromSession && (
                                  <button
                                    onClick={() => onRemoveTabFromSession(session.id, tab.id)}
                                    title="Eliminar de la sesión"
                                    className="p-1 rounded text-content-muted hover:text-status-danger hover:bg-status-danger-subtle transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
