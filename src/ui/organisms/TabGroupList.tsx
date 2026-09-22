import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  FolderPlus,
  Layers,
} from 'lucide-react';
import { TabItem } from '@/core/domain/tab.types';
import { TabGroup } from '@/core/domain/group.types';
import { MarpDomainTaxonomy } from '@/core/domain/classifier.types';
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
  onMoveToGroup: (tabId: string, groupId: string) => void;
  onCreateNewGroupWithTab: (tabId: string) => void;
  onUngroupTab: (tabId: string) => void;
  onSuspendTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onEditGroup: (group: TabGroup) => void;
  onDeleteGroup: (groupId: string, closeTabs: boolean) => void;
  onCreateEmptyGroup: () => void;
}

export const TabGroupList: React.FC<TabGroupListProps> = ({
  tabs,
  groups,
  tabTaxonomyMap,
  onMoveToGroup,
  onCreateNewGroupWithTab,
  onUngroupTab,
  onSuspendTab,
  onCloseTab,
  onEditGroup,
  onDeleteGroup,
  onCreateEmptyGroup,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

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

  return (
    <div className="space-y-4">
      {/* Botón superior de crear grupo vacío */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-content-secondary uppercase tracking-wider">
          Grupos y Pestañas Activas ({tabs.length})
        </h3>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<FolderPlus className="w-3.5 h-3.5 text-brand-primary" />}
          onClick={onCreateEmptyGroup}
        >
          Crear Nuevo Grupo
        </Button>
      </div>

      {/* Grupos creados */}
      {groups.map((group) => {
        const groupTabs = tabs.filter((t) => t.groupId === group.id);
        const isCollapsed = collapsedGroups.has(group.id);
        const colorStyle = GROUP_COLOR_CLASSES[group.color];

        return (
          <Card
            key={group.id}
            className={cn(
              'border-l-4 transition-all',
              colorStyle.border,
              'bg-surface-card/90'
            )}
          >
            {/* Cabecera del Grupo */}
            <div className="flex items-center justify-between p-3 border-b border-surface-border/50 bg-surface-subtle/40">
              <div
                className="flex items-center gap-2 cursor-pointer flex-1 select-none"
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
                <span className="text-xs text-content-muted">
                  ({groupTabs.length} {groupTabs.length === 1 ? 'pestaña' : 'pestañas'})
                </span>
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
                  title="Eliminar grupo (conservar pestañas abiertas)"
                  className="p-1.5 rounded hover:bg-status-danger-subtle text-content-muted hover:text-status-danger transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
                      onMoveToGroup={(gId) => onMoveToGroup(tab.id, gId)}
                      onCreateNewGroup={() => onCreateNewGroupWithTab(tab.id)}
                      onUngroup={() => onUngroupTab(tab.id)}
                      onSuspend={() => onSuspendTab(tab.id)}
                      onClose={() => onCloseTab(tab.id)}
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
        <Card className="border-l-4 border-slate-600 bg-surface-card/60">
          <div className="p-3 border-b border-surface-border/50 bg-surface-subtle/30 flex items-center justify-between">
            <span className="font-semibold text-sm text-content-secondary">
              Pestañas sin Agrupar ({ungroupedTabs.length})
            </span>
            <span className="text-xs text-content-muted">
              Haz clic derecho o en los 3 puntos para organizarlas
            </span>
          </div>
          <div className="p-2 space-y-1.5">
            {ungroupedTabs.map((tab) => (
              <TabItemRow
                key={tab.id}
                tab={tab}
                domainTaxonomy={tabTaxonomyMap.get(tab.id)}
                availableGroups={groups}
                onMoveToGroup={(gId) => onMoveToGroup(tab.id, gId)}
                onCreateNewGroup={() => onCreateNewGroupWithTab(tab.id)}
                onUngroup={() => onUngroupTab(tab.id)}
                onSuspend={() => onSuspendTab(tab.id)}
                onClose={() => onCloseTab(tab.id)}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
