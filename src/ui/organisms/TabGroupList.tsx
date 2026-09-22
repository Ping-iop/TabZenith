import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  FolderPlus,
  Layers,
  Globe,
  FolderMinus,
  XCircle,
  ArrowUpDown,
  HardDrive,
  ChevronsDownUp,
  ChevronsUpDown,
} from 'lucide-react';
import { TabItem } from '@/core/domain/tab.types';
import { TabGroup } from '@/core/domain/group.types';
import { MarpDomainTaxonomy } from '@/core/domain/classifier.types';
import { useI18n } from '@/core/i18n/I18nContext';
import { GROUP_COLOR_CLASSES } from '../tokens/colors.tokens';
import { TabItemRow } from '../molecules/TabItemRow';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { EmptyState } from '../atoms/EmptyState';
import { cn } from '../utils/cn';

interface TabGroupListProps {
  tabs: readonly TabItem[];
  groups: readonly TabGroup[];
  tabTaxonomyMap: ReadonlyMap<string, MarpDomainTaxonomy>;
  onActivateTab?: (tabId: string) => void;
  onMoveToGroup: (tabId: string, groupId: string) => void;
  onCreateNewGroupWithTab: (tabId: string) => void;
  onUngroupTab: (tabId: string) => void;
  onSuspendTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onEditGroup: (group: TabGroup) => void;
  onDeleteGroup: (groupId: string, closeTabs: boolean) => void;
  onCreateEmptyGroup: () => void;
  onGroupByTopic?: () => void;
  onGroupByDomain?: () => void;
  isFavorite?: (url: string) => boolean;
  onToggleFavorite?: (url: string) => void;
}

export const TabGroupList: React.FC<TabGroupListProps> = ({
  tabs,
  groups,
  tabTaxonomyMap,
  onActivateTab,
  onMoveToGroup,
  onCreateNewGroupWithTab,
  onUngroupTab,
  onSuspendTab,
  onCloseTab,
  onEditGroup,
  onDeleteGroup,
  onCreateEmptyGroup,
  onGroupByTopic,
  onGroupByDomain,
  isFavorite,
  onToggleFavorite,
}) => {
  const { t } = useI18n();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [isSortedAlpha, setIsSortedAlpha] = useState(false);

  const displayedGroups = useMemo(() => {
    if (!isSortedAlpha) return groups;
    return [...groups].sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
    );
  }, [groups, isSortedAlpha]);

  const toggleCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const areAllCollapsed = groups.length > 0 && groups.every((g) => collapsedGroups.has(g.id));

  const toggleCollapseAll = () => {
    if (areAllCollapsed) {
      setCollapsedGroups(new Set());
    } else {
      setCollapsedGroups(new Set(groups.map((g) => g.id)));
    }
  };

  if (tabs.length === 0) {
    return (
      <EmptyState
        icon={<Layers className="w-8 h-8" />}
        title="No hay pestañas abiertas"
        description="Abre pestañas en tu navegador o restaura una sesión guardada desde el panel lateral."
      />
    );
  }

  const ungroupedTabs = tabs.filter((t) => !t.groupId);
  const ungroupedActive = ungroupedTabs.filter((t) => !t.discarded).length;
  const ungroupedDiscarded = ungroupedTabs.filter((t) => t.discarded).length;
  const ungroupedMemMb = (ungroupedActive * 150) + (ungroupedDiscarded * 15);
  const formattedUngroupedMem = ungroupedMemMb >= 1024
    ? `${(ungroupedMemMb / 1024).toFixed(1)} GB`
    : `${ungroupedMemMb} MB`;

  return (
    <div className="space-y-4">
      {/* Barra de Acciones de Agrupación Superior */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-content-secondary uppercase tracking-wider">
          {t('nav.groupsTabs')} ({groups.length} grupos • {tabs.length} pestañas)
        </h3>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Botón Colapsar / Expandir Todos los Grupos */}
          {groups.length > 0 && (
            <Button
              size="sm"
              variant={areAllCollapsed ? 'primary' : 'outline'}
              leftIcon={
                areAllCollapsed ? (
                  <ChevronsUpDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronsDownUp className="w-3.5 h-3.5" />
                )
              }
              onClick={toggleCollapseAll}
              className="text-xs"
              title={areAllCollapsed ? t('groups.expandAll') : t('groups.collapseAll')}
            >
              {areAllCollapsed ? t('groups.expandAll') : t('groups.collapseAll')}
            </Button>
          )}

          {/* Botón de Orden Alfabético A-Z */}
          <Button
            size="sm"
            variant={isSortedAlpha ? 'primary' : 'outline'}
            leftIcon={<ArrowUpDown className="w-3.5 h-3.5" />}
            onClick={() => setIsSortedAlpha((prev) => !prev)}
            className="text-xs"
            title="Alternar orden alfabético A-Z / orden original"
          >
            {isSortedAlpha ? t('groups.sortAlpha') : t('groups.sortDefault')}
          </Button>

          {onGroupByTopic && (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Layers className="w-3.5 h-3.5 text-purple-400" />}
              onClick={onGroupByTopic}
              className="text-xs"
              title="Agrupar automáticamente por categorías y temas de Laya Core"
            >
              {t('action.groupByTopic')}
            </Button>
          )}

          {onGroupByDomain && (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Globe className="w-3.5 h-3.5 text-emerald-400" />}
              onClick={onGroupByDomain}
              className="text-xs"
              title="Agrupar automáticamente por dominio web de origen"
            >
              {t('action.groupByDomain')}
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            leftIcon={<FolderPlus className="w-3.5 h-3.5 text-brand-primary" />}
            onClick={onCreateEmptyGroup}
            className="text-xs"
          >
            {t('groups.createGroup')}
          </Button>
        </div>
      </div>

      {/* Grupos creados */}
      {displayedGroups.map((group) => {
        const groupTabs = tabs.filter((t) => t.groupId === group.id);
        const isCollapsed = collapsedGroups.has(group.id);
        const colorStyle = GROUP_COLOR_CLASSES[group.color];

        const activeCount = groupTabs.filter((t) => !t.discarded).length;
        const discardedCount = groupTabs.filter((t) => t.discarded).length;
        const memoryMb = (activeCount * 150) + (discardedCount * 15);
        const formattedMemory = memoryMb >= 1024
          ? `${(memoryMb / 1024).toFixed(1)} GB`
          : `${memoryMb} MB`;

        return (
          <Card
            key={group.id}
            className={cn(
              'border-l-4 transition-all overflow-visible',
              colorStyle.border,
              'bg-surface-card/90'
            )}
          >
            {/* Cabecera del Grupo */}
            <div className="flex items-center justify-between p-3 border-b border-surface-border/50 bg-surface-subtle/40">
              <div
                className="flex items-center gap-2 cursor-pointer flex-1 select-none flex-wrap"
                onClick={() => toggleCollapse(group.id)}
              >
                <button
                  aria-label={isCollapsed ? 'Expandir grupo' : 'Colapsar grupo'}
                  className="text-content-muted hover:text-content-primary"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <span className={cn('w-2.5 h-2.5 rounded-full', colorStyle.dot)} />
                <span className="font-semibold text-sm text-content-primary">
                  {group.title}
                </span>

                {/* Indicador de cantidad de pestañas y memoria ocupada */}
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-elevated text-content-secondary font-medium border border-border-default/60">
                    {groupTabs.length} {groupTabs.length === 1 ? 'pestaña' : 'pestañas'}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono font-medium border border-cyan-500/30 flex items-center gap-1"
                    title={`Memoria ocupada estimada: ${formattedMemory} (${activeCount} en RAM, ${discardedCount} congeladas)`}
                  >
                    <HardDrive className="w-3 h-3 text-cyan-400" />
                    <span>~{formattedMemory}</span>
                  </span>
                </div>
              </div>

              {/* Acciones de Grupo */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onEditGroup(group)}
                  title="Renombrar o cambiar color del grupo"
                  className="p-1.5 rounded hover:bg-surface-elevated text-content-muted hover:text-content-primary transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteGroup(group.id, false)}
                  title="Desagrupar (conservar pestañas abiertas en el navegador)"
                  className="p-1.5 rounded hover:bg-surface-elevated text-content-muted hover:text-content-primary transition-colors"
                >
                  <FolderMinus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteGroup(group.id, true)}
                  title="Cerrar todas las pestañas de este grupo en Chrome (no afecta fijadas)"
                  className="p-1.5 rounded hover:bg-status-danger-subtle text-content-muted hover:text-status-danger transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pestañas del Grupo */}
            {!isCollapsed && (
              <div className="p-2 space-y-1.5">
                {groupTabs.length === 0 ? (
                  <p className="text-xs text-content-muted text-center py-3">
                    Grupo vacío. Mueve pestañas aquí desde su menú contextual.
                  </p>
                ) : (
                  groupTabs.map((tab) => (
                    <TabItemRow
                      key={tab.id}
                      tab={tab}
                      domainTaxonomy={tabTaxonomyMap.get(tab.id)}
                      availableGroups={groups}
                      onActivate={onActivateTab ? () => onActivateTab(tab.id) : undefined}
                      onMoveToGroup={(gId) => onMoveToGroup(tab.id, gId)}
                      onCreateNewGroup={() => onCreateNewGroupWithTab(tab.id)}
                      onUngroup={() => onUngroupTab(tab.id)}
                      onSuspend={() => onSuspendTab(tab.id)}
                      onClose={() => onCloseTab(tab.id)}
                      isFavorite={isFavorite ? isFavorite(tab.url) : false}
                      onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(tab.url) : undefined}
                    />
                  ))
                )}
              </div>
            )}
          </Card>
        );
      })}

      {/* Pestañas sueltas (sin grupo) */}
      {ungroupedTabs.length > 0 && (
        <Card className="border-l-4 border-slate-600 bg-surface-card/60 overflow-visible">
          <div className="p-3 border-b border-surface-border/50 bg-surface-subtle/30 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-content-secondary">
                {t('grid.noGroup')} ({ungroupedTabs.length})
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono font-medium border border-cyan-500/30 flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-cyan-400" />
                <span>~{formattedUngroupedMem}</span>
              </span>
            </div>
            <span className="text-xs text-content-muted">
              {t('action.groupByTopic')} / {t('action.groupByDomain')}
            </span>
          </div>
          <div className="p-2 space-y-1.5">
            {ungroupedTabs.map((tab) => (
              <TabItemRow
                key={tab.id}
                tab={tab}
                domainTaxonomy={tabTaxonomyMap.get(tab.id)}
                availableGroups={groups}
                onActivate={onActivateTab ? () => onActivateTab(tab.id) : undefined}
                onMoveToGroup={(gId) => onMoveToGroup(tab.id, gId)}
                onCreateNewGroup={() => onCreateNewGroupWithTab(tab.id)}
                onUngroup={() => onUngroupTab(tab.id)}
                onSuspend={() => onSuspendTab(tab.id)}
                onClose={() => onCloseTab(tab.id)}
                isFavorite={isFavorite ? isFavorite(tab.url) : false}
                onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(tab.url) : undefined}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
