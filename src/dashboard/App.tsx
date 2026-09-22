import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Layers,
  Inbox,
  History,
  Search,
  Sparkles,
  Cpu,
  CheckCircle,
  X,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { useTabs } from '@/core/hooks/useTabs';
import { useSessions } from '@/core/hooks/useSessions';
import { useInbox } from '@/core/hooks/useInbox';
import { useExecutiveDashboard } from '@/core/hooks/useExecutiveDashboard';
import { useSmartSearch } from '@/core/hooks/useSmartSearch';
import { useI18n } from '@/core/i18n/I18nContext';
import { LanguageSelector } from '@/ui/molecules/LanguageSelector';

import { ExecutiveKpiGrid } from '@/ui/organisms/ExecutiveKpiGrid';
import { ExecutiveActionsBar } from '@/ui/organisms/ExecutiveActionsBar';
import { ExecutiveDataGrid } from '@/ui/organisms/ExecutiveDataGrid';
import { TabGroupList } from '@/ui/organisms/TabGroupList';
import { LinkInboxPanel } from '@/ui/organisms/LinkInboxPanel';
import { SessionsView } from '@/ui/organisms/SessionsView';
import { GroupManagementModal } from '@/ui/organisms/GroupManagementModal';
import { SearchResultsView } from '@/ui/organisms/SearchResultsView';

import { Input } from '@/ui/atoms/Input';
import { TabGroup } from '@/core/domain/group.types';
import { ChromeGroupColor } from '@/ui/tokens/colors.tokens';
import { container } from '@/core/di/container';

type ActiveView = 'command_center' | 'groups_tabs' | 'inbox' | 'sessions';

export const DashboardApp: React.FC = () => {
  const { t } = useI18n();
  const [activeView, setActiveView] = useState<ActiveView>('command_center');
  const [isLayaConnected, setIsLayaConnected] = useState<boolean | null>(null);

  // Hooks de lógica desacoplada
  const {
    tabs,
    groups,
    closeTabs,
    suspendTabs,
    moveTabToGroup,
    ungroupTabs,
    updateGroup,
    deleteGroup,
  } = useTabs();

  const {
    sessions,
    stashCurrentSession,
    restoreSession,
    restoreSpecificGroup,
    restoreSelectedTabs,
    removeTabFromSession,
    deleteSession,
    refresh: refreshSessions,
  } = useSessions();

  const {
    links: inboxLinks,
    filter: inboxFilter,
    setFilter: setInboxFilter,
    addLinksFromText,
    toggleReviewed,
    archiveLink,
    deleteLink,
    openLink,
  } = useInbox();

  const {
    metrics,
    isClassifying,
    isGrouping,
    actionFeedback,
    clearFeedback,
    manualClassify,
    groupByTopic,
    groupByDomain,
    freezeInactiveTabs,
    deduplicateTabs,
    tabTaxonomyMap,
  } = useExecutiveDashboard();

  const { query, setQuery, searchResults, hasQuery } = useSmartSearch(tabs, inboxLinks);

  // Estados de modales
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupModalMode, setGroupModalMode] = useState<'create' | 'edit'>('create');
  const [editingGroup, setEditingGroup] = useState<TabGroup | null>(null);
  const [pendingTabForNewGroup, setPendingTabForNewGroup] = useState<string | null>(null);

  // Comprobar salud de Laya Core en CPU
  useEffect(() => {
    container.classifier.isAvailable().then(setIsLayaConnected);
  }, []);

  // Handlers para grupos
  const handleOpenCreateGroup = (tabId?: string) => {
    setGroupModalMode('create');
    setEditingGroup(null);
    setPendingTabForNewGroup(tabId || null);
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (group: TabGroup) => {
    setGroupModalMode('edit');
    setEditingGroup(group);
    setIsGroupModalOpen(true);
  };

  const handleSaveGroupModal = async (title: string, color: ChromeGroupColor) => {
    if (groupModalMode === 'create') {
      if (pendingTabForNewGroup) {
        await moveTabToGroup(pendingTabForNewGroup, undefined, { title, color });
        setPendingTabForNewGroup(null);
      } else {
        // Crear grupo con la primera pestaña activa o sin pestañas
        const firstTab = tabs[0];
        if (firstTab) {
          await moveTabToGroup(firstTab.id, undefined, { title, color });
        }
      }
    } else if (editingGroup) {
      await updateGroup(editingGroup.id, title, color);
    }
  };

  const isChromeEnv = typeof chrome !== 'undefined' && Boolean(chrome.tabs?.query);

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      {/* Barra de Navegación Superior */}
      <header className="sticky top-0 z-40 bg-surface-card/90 backdrop-blur-md border-b border-surface-border px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo y Estado del Ecosistema */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-primary to-blue-600 text-white shadow-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-content-primary">
                  {t('header.title')}
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-subtle text-brand-primary border border-brand-border">
                  {t('header.badge')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-content-muted">
                <span className="flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isChromeEnv ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <span>{isChromeEnv ? t('header.env.chrome') : t('header.env.mock')}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1" title="Laya Core Multilingual CPU (port 8092)">
                  <Cpu className="w-3 h-3 text-brand-primary" />
                  <span>
                    {isLayaConnected === null
                      ? t('header.laya.connecting')
                      : isLayaConnected
                      ? t('header.laya.connected')
                      : t('header.laya.heuristic')}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Buscador Inteligente Central */}
          <div className="flex-1 max-w-md relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('header.searchPlaceholder')}
              leftIcon={<Search className="w-4 h-4 text-brand-primary" />}
              className="bg-surface-subtle"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-2.5 text-content-muted hover:text-content-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Menú de Vistas y Selector de Idioma */}
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1 bg-surface-subtle p-1 rounded-lg border border-surface-border">
              <button
                onClick={() => setActiveView('command_center')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeView === 'command_center'
                    ? 'bg-brand-primary text-content-primary shadow-sm'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface-elevated'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{t('nav.commandCenter')}</span>
              </button>

              <button
                onClick={() => setActiveView('groups_tabs')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeView === 'groups_tabs'
                    ? 'bg-brand-primary text-content-primary shadow-sm'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface-elevated'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t('nav.groupsTabs')} ({groups.length})</span>
              </button>

              <button
                onClick={() => setActiveView('inbox')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeView === 'inbox'
                    ? 'bg-brand-primary text-content-primary shadow-sm'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface-elevated'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>{t('nav.inbox')} ({inboxLinks.length})</span>
              </button>

              <button
                onClick={() => setActiveView('sessions')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeView === 'sessions'
                    ? 'bg-brand-primary text-content-primary shadow-sm'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface-elevated'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>{t('nav.sessions')} ({sessions.length})</span>
              </button>
            </nav>

            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Banner de Aviso de Servidor Local de Desarrollo vs Extensión Real */}
        {!isChromeEnv && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm text-amber-300">{t('mockBanner.title')}</h3>
                <p className="text-xs text-amber-200/80 mt-0.5 max-w-3xl">{t('mockBanner.desc')}</p>
                <p className="text-[11px] text-amber-300/70 mt-1">{t('mockBanner.shortcutHint')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="chrome-extension://oigehliembpnijhhigpeofedoilbgaaj/dashboard.html"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary text-content-primary text-xs font-semibold hover:bg-brand-primary/90 transition-colors shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t('mockBanner.btnOpenReal')}</span>
              </a>
            </div>
          </div>
        )}
        {/* Banner de Feedback de Acciones Ejecutivas */}
        {actionFeedback && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-status-success-subtle border border-emerald-500/40 text-emerald-300 text-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-status-success flex-shrink-0" />
              <span>{actionFeedback}</span>
            </div>
            <button
              onClick={clearFeedback}
              className="p-1 rounded hover:bg-emerald-500/20 text-emerald-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Vista Superpuesta de Resultados de Búsqueda si hay query */}
        {hasQuery && (
          <SearchResultsView
            results={searchResults}
            query={query}
            onOpenUrl={(url) => container.browserTabs.createTab(url, true)}
          />
        )}

        {/* Vista 1: Centro de Mando Ejecutivo (Command Center) */}
        {activeView === 'command_center' && (
          <div className="space-y-6">
            <ExecutiveKpiGrid metrics={metrics} isClassifying={isClassifying} />

            <ExecutiveActionsBar
              onClassify={manualClassify}
              onGroupByTopic={groupByTopic}
              onGroupByDomain={groupByDomain}
              onFreezeInactive={freezeInactiveTabs}
              onDeduplicate={deduplicateTabs}
              onStashSession={() => stashCurrentSession()}
              isClassifying={isClassifying}
              isGrouping={isGrouping}
            />

            <ExecutiveDataGrid
              tabs={tabs}
              groups={groups}
              tabTaxonomyMap={tabTaxonomyMap}
              onBatchSuspend={suspendTabs}
              onBatchClose={closeTabs}
              onBatchMoveToGroup={(tabIds, groupId) => {
                tabIds.forEach((tId) => moveTabToGroup(tId, groupId));
              }}
            />
          </div>
        )}

        {/* Vista 2: Grupos y Pestañas Abiertas */}
        {activeView === 'groups_tabs' && (
          <TabGroupList
            tabs={tabs}
            groups={groups}
            tabTaxonomyMap={tabTaxonomyMap}
            onMoveToGroup={(tabId, groupId) => moveTabToGroup(tabId, groupId)}
            onCreateNewGroupWithTab={(tabId) => handleOpenCreateGroup(tabId)}
            onUngroupTab={(tabId) => ungroupTabs([tabId])}
            onSuspendTab={(tabId) => suspendTabs([tabId])}
            onCloseTab={(tabId) => closeTabs([tabId])}
            onEditGroup={handleOpenEditGroup}
            onDeleteGroup={deleteGroup}
            onCreateEmptyGroup={() => handleOpenCreateGroup()}
            onGroupByTopic={groupByTopic}
            onGroupByDomain={groupByDomain}
          />
        )}

        {/* Vista 3: Panel de Curaduría de Enlaces (Inbox con Filtro por Fechas) */}
        {activeView === 'inbox' && (
          <LinkInboxPanel
            links={inboxLinks}
            filter={inboxFilter}
            onFilterChange={setInboxFilter}
            onAddLinks={addLinksFromText}
            onToggleReviewed={toggleReviewed}
            onArchive={archiveLink}
            onDelete={deleteLink}
            onOpenLink={openLink}
          />
        )}

        {/* Vista 4: Historial de Sesiones Guardadas (Stash) */}
        {activeView === 'sessions' && (
          <SessionsView
            sessions={sessions}
            onRestore={restoreSession}
            onRestoreGroup={restoreSpecificGroup}
            onRestoreSelectedTabs={restoreSelectedTabs}
            onRemoveTabFromSession={removeTabFromSession}
            onDelete={deleteSession}
            onSessionUpdated={refreshSessions}
          />
        )}
      </main>

      {/* Modal de Gestión de Grupos */}
      <GroupManagementModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSave={handleSaveGroupModal}
        mode={groupModalMode}
        initialTitle={editingGroup?.title || ''}
        initialColor={editingGroup?.color || 'blue'}
      />
    </div>
  );
};
