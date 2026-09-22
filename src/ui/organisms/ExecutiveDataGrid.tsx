import React, { useState, useMemo } from 'react';
import {
  Search,
  Snowflake,
  FolderInput,
  Trash2,
  FileDown,
} from 'lucide-react';
import { TabItem } from '@/core/domain/tab.types';
import { TabGroup } from '@/core/domain/group.types';
import { MarpDomainTaxonomy } from '@/core/domain/classifier.types';
import { useI18n } from '@/core/i18n/I18nContext';
import { DomainBadge } from '../molecules/DomainBadge';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { GROUP_COLOR_CLASSES } from '../tokens/colors.tokens';
import { cn } from '../utils/cn';

interface ExecutiveDataGridProps {
  tabs: readonly TabItem[];
  groups: readonly TabGroup[];
  tabTaxonomyMap: ReadonlyMap<string, MarpDomainTaxonomy>;
  onBatchSuspend: (tabIds: readonly string[]) => void;
  onBatchClose: (tabIds: readonly string[]) => void;
  onBatchMoveToGroup: (tabIds: readonly string[], groupId: string) => void;
}

export const ExecutiveDataGrid: React.FC<ExecutiveDataGridProps> = ({
  tabs,
  groups,
  tabTaxonomyMap,
  onBatchSuspend,
  onBatchClose,
  onBatchMoveToGroup,
}) => {
  const { t } = useI18n();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterText, setFilterText] = useState('');
  const [selectedTargetGroup, setSelectedTargetGroup] = useState<string>('');

  const filteredTabs = useMemo(() => {
    if (!filterText.trim()) return tabs;
    const q = filterText.toLowerCase();
    return tabs.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.url.toLowerCase().includes(q) ||
        t.domain.toLowerCase().includes(q)
    );
  }, [tabs, filterText]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredTabs.map((t) => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectTab = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const exportSelectedToMarkdown = () => {
    const selectedTabs = tabs.filter((t) => selectedIds.has(t.id));
    if (selectedTabs.length === 0) return;

    const mdLines = selectedTabs.map(
      (t) => `- [${t.title}](${t.url}) - \`${t.domain}\``
    );
    const mdContent = `# Enlaces Exportados (${selectedTabs.length})\n\n${mdLines.join(
      '\n'
    )}`;

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pestañas_exportadas_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedCount = selectedIds.size;
  const allSelected = filteredTabs.length > 0 && selectedCount === filteredTabs.length;

  return (
    <div className="space-y-3">
      {/* Barra de Filtro y Búsqueda de la Tabla */}
      <div className="flex items-center justify-between gap-3">
        <Input
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder={t('action.filterPlaceholder')}
          leftIcon={<Search className="w-4 h-4" />}
          className="max-w-md bg-surface-card"
        />
        <span className="text-xs text-content-secondary font-medium">
          {t('action.showingTabs')} {filteredTabs.length} / {tabs.length}
        </span>
      </div>

      {/* Barra Flotante de Acciones Masivas por Lote */}
      {selectedCount > 0 && (
        <div className="p-3 rounded-lg bg-surface-elevated border border-brand-primary shadow-elevated flex items-center justify-between flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-primary">
              {selectedCount} seleccionadas
            </span>
            <div className="h-4 w-px bg-surface-border" />

            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Snowflake className="w-3.5 h-3.5 text-cyan-400" />}
              onClick={() => {
                onBatchSuspend(Array.from(selectedIds));
                setSelectedIds(new Set());
              }}
            >
              Congelar RAM
            </Button>

            <Button
              size="sm"
              variant="secondary"
              leftIcon={<FileDown className="w-3.5 h-3.5 text-emerald-400" />}
              onClick={exportSelectedToMarkdown}
            >
              Exportar Markdown
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedTargetGroup}
              onChange={(e) => setSelectedTargetGroup(e.target.value)}
              className="bg-surface-card text-xs text-content-primary border border-surface-border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="">Seleccionar Grupo Destino...</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>

            <Button
              size="sm"
              variant="primary"
              disabled={!selectedTargetGroup}
              leftIcon={<FolderInput className="w-3.5 h-3.5" />}
              onClick={() => {
                if (selectedTargetGroup) {
                  onBatchMoveToGroup(Array.from(selectedIds), selectedTargetGroup);
                  setSelectedIds(new Set());
                  setSelectedTargetGroup('');
                }
              }}
            >
              Mover
            </Button>

            <Button
              size="sm"
              variant="danger"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => {
                onBatchClose(Array.from(selectedIds));
                setSelectedIds(new Set());
              }}
            >
              Cerrar Pestañas
            </Button>
          </div>
        </div>
      )}

      {/* Tabla Gerencial */}
      <div className="overflow-x-auto rounded-lg border border-surface-border bg-surface-card">
        <table className="w-full text-left text-xs text-content-primary border-collapse">
          <thead className="bg-surface-subtle border-b border-surface-border uppercase font-semibold text-content-secondary tracking-wider">
            <tr>
              <th className="p-3 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-surface-border text-brand-primary focus:ring-brand-primary bg-surface-card"
                />
              </th>
              <th className="p-3">{t('grid.colTitle')}</th>
              <th className="p-3">{t('grid.colDomain')}</th>
              <th className="p-3">{t('grid.colCategory')}</th>
              <th className="p-3">{t('grid.colGroup')}</th>
              <th className="p-3">{t('grid.colRam')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {filteredTabs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-content-muted">
                  {t('action.filterPlaceholder')}
                </td>
              </tr>
            ) : (
              filteredTabs.map((tab) => {
                const isSelected = selectedIds.has(tab.id);
                const taxonomy = tabTaxonomyMap.get(tab.id);
                const group = groups.find((g) => g.id === tab.groupId);
                const colorInfo = group ? GROUP_COLOR_CLASSES[group.color] : null;

                return (
                  <tr
                    key={tab.id}
                    className={cn(
                      'hover:bg-surface-elevated/50 transition-colors',
                      isSelected ? 'bg-brand-subtle/15' : ''
                    )}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => toggleSelectTab(tab.id, e.target.checked)}
                        className="w-4 h-4 rounded border-surface-border text-brand-primary focus:ring-brand-primary bg-surface-card"
                      />
                    </td>
                    <td className="p-3 max-w-xs md:max-w-md">
                      <a
                        href={tab.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-content-primary hover:text-brand-primary truncate block"
                      >
                        {tab.title}
                      </a>
                      <span className="text-[11px] text-content-muted truncate block">
                        {tab.url}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-content-secondary">{tab.domain}</td>
                    <td className="p-3">
                      {taxonomy ? <DomainBadge domain={taxonomy} /> : <span className="text-content-muted">-</span>}
                    </td>
                    <td className="p-3">
                      {group && colorInfo ? (
                        <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px]', colorInfo.badge)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', colorInfo.dot)} />
                          <span>{group.title}</span>
                        </span>
                      ) : (
                        <span className="text-content-muted text-[11px]">{t('grid.noGroup')}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {tab.discarded ? (
                        <span className="inline-flex items-center gap-1 text-cyan-400">
                          <Snowflake className="w-3.5 h-3.5" />
                          <span>{t('grid.statusFrozen')}</span>
                        </span>
                      ) : tab.active ? (
                        <span className="text-emerald-400 font-medium">{t('grid.statusActive')}</span>
                      ) : (
                        <span className="text-content-secondary">{t('grid.statusInRam')}</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
