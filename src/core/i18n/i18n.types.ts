export type SupportedLanguage = 'es' | 'en' | 'ru' | 'zh';

export interface LanguageOption {
  readonly code: SupportedLanguage;
  readonly label: string;
  readonly flag: string;
}

export const SUPPORTED_LANGUAGES: readonly LanguageOption[] = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
] as const;

export type TranslationKey =
  // Header
  | 'header.title'
  | 'header.badge'
  | 'header.env.chrome'
  | 'header.env.mock'
  | 'header.laya.connecting'
  | 'header.laya.connected'
  | 'header.laya.heuristic'
  | 'header.searchPlaceholder'
  // Nav
  | 'nav.commandCenter'
  | 'nav.groupsTabs'
  | 'nav.favorites'
  | 'nav.pinned'
  | 'nav.inbox'
  | 'nav.sessions'
  // Filters
  | 'filter.clearDomains'
  | 'filter.filteringBy'
  | 'filter.tabsCount'
  // Favorites View
  | 'favorites.title'
  | 'favorites.desc'
  | 'favorites.empty'
  | 'favorites.emptyDesc'
  | 'favorites.openAll'
  // Pinned View
  | 'pinned.title'
  | 'pinned.desc'
  | 'pinned.empty'
  | 'pinned.emptyDesc'
  | 'pinned.protectedNotice'
  // KPIs
  | 'kpi.activeTabs'
  | 'kpi.frozenInRam'
  | 'kpi.estimatedRamSaved'
  | 'kpi.savedByDiscard'
  | 'kpi.curationRate'
  | 'kpi.pendingLinks'
  | 'kpi.layaFocus'
  | 'kpi.mainDomain'
  | 'kpi.interestDistribution'
  | 'kpi.analyzedTabs'
  // Actions
  | 'action.classifyLaya'
  | 'action.groupByTopic'
  | 'action.groupByDomain'
  | 'action.freezeInactive'
  | 'action.deduplicate'
  | 'action.saveAllStash'
  | 'action.stashSaved'
  | 'action.freezeSuccess'
  | 'action.dedupSuccess'
  | 'action.filterPlaceholder'
  | 'action.showingTabs'
  // DataGrid
  | 'grid.colTitle'
  | 'grid.colDomain'
  | 'grid.colCategory'
  | 'grid.colGroup'
  | 'grid.colRam'
  | 'grid.statusActive'
  | 'grid.statusInRam'
  | 'grid.statusFrozen'
  | 'grid.noGroup'
  | 'grid.batchSuspend'
  | 'grid.batchClose'
  | 'grid.batchMove'
  // Sessions
  | 'session.title'
  | 'session.desc'
  | 'session.empty'
  | 'session.restoreAll'
  | 'session.restoreGroup'
  | 'session.restoreSelected'
  | 'session.delete'
  | 'session.removeTab'
  | 'session.tabCount'
  | 'session.groupCount'
  | 'session.confirmDelete'
  | 'session.collapseAllGroups'
  | 'session.expandAllGroups'
  // Inbox
  | 'inbox.title'
  | 'inbox.desc'
  | 'inbox.filterAll'
  | 'inbox.filterToday'
  | 'inbox.filterWeek'
  | 'inbox.filterMonth'
  | 'inbox.filterCustom'
  | 'inbox.addPlaceholder'
  | 'inbox.addBtn'
  | 'inbox.empty'
  | 'inbox.reviewed'
  | 'inbox.pending'
  | 'inbox.archive'
  | 'inbox.delete'
  | 'inbox.open'
  // Groups View
  | 'groups.createGroup'
  | 'groups.noGroups'
  | 'groups.rename'
  | 'groups.deleteGroup'
  | 'groups.ungroup'
  | 'groups.suspend'
  | 'groups.close'
  | 'groups.emptyGroup'
  | 'groups.sortAlpha'
  | 'groups.sortDefault'
  | 'groups.memoryUsage'
  | 'groups.others'
  // Modals
  | 'modal.createTitle'
  | 'modal.editTitle'
  | 'modal.groupName'
  | 'modal.groupColor'
  | 'modal.cancel'
  | 'modal.save'
  // Mock Banner
  | 'mockBanner.title'
  | 'mockBanner.desc'
  | 'mockBanner.btnOpenReal'
  | 'mockBanner.shortcutHint';
