import React from 'react';
import { Globe, Snowflake, X } from 'lucide-react';
import { TabItem } from '@/core/domain/tab.types';
import { TabGroup } from '@/core/domain/group.types';
import { MarpDomainTaxonomy } from '@/core/domain/classifier.types';
import { DomainBadge } from './DomainBadge';
import { ContextMenu } from './ContextMenu';
import { cn } from '../utils/cn';

interface TabItemRowProps {
  tab: TabItem;
  domainTaxonomy?: MarpDomainTaxonomy;
  availableGroups: readonly TabGroup[];
  onMoveToGroup: (groupId: string) => void;
  onCreateNewGroup: () => void;
  onUngroup: () => void;
  onSuspend: () => void;
  onClose: () => void;
  isSelected?: boolean;
  onToggleSelect?: (selected: boolean) => void;
  showCheckbox?: boolean;
  className?: string;
}

export const TabItemRow: React.FC<TabItemRowProps> = ({
  tab,
  domainTaxonomy,
  availableGroups,
  onMoveToGroup,
  onCreateNewGroup,
  onUngroup,
  onSuspend,
  onClose,
  isSelected = false,
  onToggleSelect,
  showCheckbox = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'group flex items-center justify-between p-2 rounded-lg bg-surface-subtle/70 hover:bg-surface-elevated border border-surface-border/60 transition-all text-sm',
        isSelected ? 'border-brand-primary bg-brand-subtle/20' : '',
        className
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {showCheckbox && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onToggleSelect?.(e.target.checked)}
            className="w-4 h-4 rounded border-surface-border text-brand-primary focus:ring-brand-primary bg-surface-card"
          />
        )}

        {/* Favicon o fallback */}
        <div className="relative flex-shrink-0 w-4 h-4 flex items-center justify-center">
          {tab.favIconUrl ? (
            <img
              src={tab.favIconUrl}
              alt=""
              className="w-4 h-4 rounded-sm object-contain"
              onError={(e) => {
                // Si falla la imagen, ocultar y mostrar icono por defecto
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <Globe className="w-4 h-4 text-content-muted" />
          )}
          {tab.active && (
            <span
              title="Pestaña activa actualmente"
              className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-status-success ring-1 ring-surface-base"
            />
          )}
        </div>

        {/* Título y Dominio */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <a
              href={tab.url}
              target="_blank"
              rel="noreferrer"
              title={tab.title}
              className="font-medium text-content-primary hover:text-brand-primary transition-colors truncate block"
            >
              {tab.title}
            </a>
            {tab.discarded && (
              <span
                title="Pestaña suspendida (RAM liberada)"
                className="flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded"
              >
                <Snowflake className="w-2.5 h-2.5" />
                <span>Pausada</span>
              </span>
            )}
          </div>
          <span className="text-xs text-content-muted truncate block">{tab.domain}</span>
        </div>
      </div>

      {/* Badges de clasificación y menú contextual */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        {domainTaxonomy && <DomainBadge domain={domainTaxonomy} />}
        <ContextMenu
          tabId={tab.id}
          tabUrl={tab.url}
          currentGroupId={tab.groupId}
          availableGroups={availableGroups}
          onMoveToGroup={onMoveToGroup}
          onCreateNewGroup={onCreateNewGroup}
          onUngroup={onUngroup}
          onSuspend={onSuspend}
          onClose={onClose}
          isDiscarded={tab.discarded}
        />
        <button
          onClick={onClose}
          title="Cerrar esta pestaña en Chrome (no afecta fijadas)"
          className="p-1 rounded text-content-muted hover:text-status-danger hover:bg-status-danger-subtle transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
