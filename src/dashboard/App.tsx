import React, { useState, useEffect, useMemo } from 'react';
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
  Star,
  Pin,
  Copy,
} from 'lucide-react';
import { useTabs } from '@/core/hooks/useTabs';
import { useSessions } from '@/core/hooks/useSessions';
import { useInbox } from '@/core/hooks/useInbox';
import { useFavorites } from '@/core/hooks/useFavorites';
import { useExecutiveDashboard } from '@/core/hooks/useExecutiveDashboard';
import { useSmartSearch } from '@/core/hooks/useSmartSearch';
import { useI18n } from '@/core/i18n/I18nContext';
import { LanguageSelector } from '@/ui/molecules/LanguageSelector';

import { ExecutiveKpiGrid } from '@/ui/organisms/ExecutiveKpiGrid';
import { ExecutiveActionsBar } from '@/ui/organisms/ExecutiveActionsBar';
import { ExecutiveDataGrid } from '@/ui/organisms/ExecutiveDataGrid';
import { TabGroupList } from '@/ui/organisms/TabGroupList';
import { FavoritesView } from '@/ui/organisms/FavoritesView';
import { PinnedTabsView } from '@/ui/organisms/PinnedTabsView';
import { LinkInboxPanel } from '@/ui/organisms/LinkInboxPanel';
import { SessionsView } from '@/ui/organisms/SessionsView';
import { GroupManagementModal } from '@/ui/organisms/GroupManagementModal';
import { SearchResultsView } from '@/ui/organisms/SearchResultsView';

import { Input } from '@/ui/atoms/Input';
import { TabGroup } from '@/core/domain/group.types';
import { ChromeGroupColor } from '@/ui/tokens/colors.tokens';
import { container } from '@/core/di/container';

type ActiveView =
  | 'command_center'
  | 'groups_tabs'
  | 'favorites'
  | 'pinned'
  | 'inbox'
  | 'sessions';

export const DashboardApp: React.FC = () => {
  const { t } = useI18n();
  const [activeView, setActiveView] = useState<ActiveView>('command_center');
  const [isLayaConnected, setIsLayaConnected] = useState<boolean | null>(null);
  const [selectedDomainFilters, setSelectedDomainFilters] = useState<string[]>([]);

  // Hooks de lógica desacoplada
  const { favorites, favoriteCount, toggleFavorite, isFavorite } = useFavorites();
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

  // Filtrado por dominios seleccionados
  const handleToggleDomainFilter = (domain: string) => {
    setSelectedDomainFilters((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  const handleClearDomainFilters = () => {
    setSelectedDomainFilters([]);
  };

  const displayedTabs = useMemo(() => {
    if (selectedDomainFilters.length === 0) return tabs;
    return tabs.filter((t) => selectedDomainFilters.includes(t.domain));
  }, [tabs, selectedDomainFilters]);

  const pinnedTabs = useMemo(() => {
    return tabs.filter((t) => t.pinned);
  }, [tabs]);

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

  const EXTENSION_ID = 'oigehliembpnijhhigpeofedoilbgaaj';
  const DASHBOARD_CHROME_URL = `chrome-extension://${EXTENSION_ID}/dashboard.html`;
  const [copiedExtensionUrl, setCopiedExtensionUrl] = useState(false);
  const [openExtensionStatus, setOpenExtensionStatus] = useState<string | null>(null);

  const handleCopyExtensionUrl = () => {
    navigator.clipboard.writeText(DASHBOARD_CHROME_URL).then(() => {
      setCopiedExtensionUrl(true);
      setTimeout(() => setCopiedExtensionUrl(false), 3000);
    }).catch(() => {});
  };

  const handleOpenRealExtension = () => {
    setOpenExtensionStatus(null);
    // Intentar abrirlo a través de la mensajería del Service Worker (externally_connectable)
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      try {
        chrome.runtime.sendMessage(EXTENSION_ID, { action: 'open_dashboard' }, (response) => {
          if (chrome.runtime.lastError || !response?.success) {
            handleCopyExtensionUrl();
            setOpenExtensionStatus('¡URL copiada! Pégala en la barra de Chrome o ábrelo desde el popup.');
          } else {
            setOpenExtensionStatus('¡Abriendo pestaña nativa en Chrome!');
            setTimeout(() => setOpenExtensionStatus(null), 3000);
          }
        });
        return;
      } catch {
        // Fallback
      }
    }
    handleCopyExtensionUrl();
    setOpenExtensionStatus('¡URL copiada! Pégala en una pestaña nueva de Chrome.');
  };

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
                onClick={() => setActiveView('favorites')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeView === 'favorites'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface-elevated'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{t('nav.favorites')} ({favoriteCount})</span>
              </button>

              <button
                onClick={() => setActiveView('pinned')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeView === 'pinned'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface-elevated'
                }`}
              >
                <Pin className="w-3.5 h-3.5 text-blue-400 fill-blue-400/40" />
                <span>{t('nav.pinned')} ({pinnedTabs.length})</span>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenRealExtension}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary text-content-primary text-xs font-semibold hover:bg-brand-primary/90 transition-colors shadow-sm cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t('mockBanner.btnOpenReal')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyExtensionUrl}
                  title="Copiar URL directa de la extensión"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs text-amber-100 transition-colors cursor-pointer"
                >
                  {copiedExtensionUrl ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-status-success" />
                      <span className="text-status-success font-medium">¡Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-300" />
                      <span>Copiar URL</span>
                    </>
                  )}
                </button>
              </div>
              {openExtensionStatus && (
                <span className="text-[11px] text-amber-200 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 animate-in fade-in">
                  {openExtensionStatus}
                </span>
              )}
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
            <ExecutiveKpiGrid
              metrics={metrics}
              isClassifying={isClassifying}
              selectedDomains={selectedDomainFilters}
              onToggleDomain={handleToggleDomainFilter}
              onClearDomainFilter={handleClearDomainFilters}
            />

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
              tabs={displayedTabs}
              groups={groups}
              tabTaxonomyMap={tabTaxonomyMap}
              onBatchSuspend={suspendTabs}
              onBatchClose={closeTabs}
              onBatchMoveToGroup={(tabIds, groupId) => {
                tabIds.forEach((tId) => moveTabToGroup(tId, groupId));
              }}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        )}

        {/* Vista 2: Grupos y Pestañas Abiertas */}
        {activeView === 'groups_tabs' && (
          <TabGroupList
            tabs={displayedTabs}
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
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {/* Vista 3: Pestañas Favoritas */}
        {activeView === 'favorites' && (
          <FavoritesView
            openTabs={tabs}
            favoriteUrls={favorites}
            onToggleFavorite={toggleFavorite}
            onCloseTab={(tabId) => closeTabs([tabId])}
            onSuspendTab={(tabId) => suspendTabs([tabId])}
          />
        )}

        {/* Vista 4: Pestañas Fijadas (Pinned) */}
        {activeView === 'pinned' && (
          <PinnedTabsView
            pinnedTabs={pinnedTabs}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {/* Vista 5: Panel de Curaduría de Enlaces (Inbox con Filtro por Fechas) */}
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

        {/* Vista 6: Historial de Sesiones Guardadas (Stash) */}
        {activeView === 'sessions' && (
          <SessionsView
            sessions={sessions}
            onRestore={restoreSession}
            onRestoreGroup={restoreSpecificGroup}
            onRestoreSelectedTabs={restoreSelectedTabs}
            onRemoveTabFromSession={removeTabFromSession}
            onDelete={deleteSession}
            onSessionUpdated={refreshSessions}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
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
