import { SupportedLanguage, TranslationKey } from './i18n.types';

export const TRANSLATIONS: Record<SupportedLanguage, Record<TranslationKey, string>> = {
  es: {
    // Header
    'header.title': 'TabZenith',
    'header.badge': 'Gerencial',
    'header.env.chrome': 'Chrome MV3 (Real)',
    'header.env.mock': 'Entorno Mock',
    'header.laya.connecting': 'Conectando Laya...',
    'header.laya.connected': 'Laya Core (CPU)',
    'header.laya.heuristic': 'Laya Heurístico (CPU)',
    'header.searchPlaceholder': 'Búsqueda inteligente difusa (título, URL, tema)...',

    // Nav
    'nav.commandCenter': 'Centro de Mando',
    'nav.groupsTabs': 'Grupos y Pestañas',
    'nav.favorites': 'Favoritos',
    'nav.pinned': 'Fijadas',
    'nav.inbox': 'Curaduría',
    'nav.sessions': 'Sesiones',

    // Filters
    'filter.clearDomains': 'Borrar filtro de dominios',
    'filter.filteringBy': 'Filtrando por',
    'filter.tabsCount': 'pestañas visibles',

    // Favorites View
    'favorites.title': 'Pestañas Favoritas',
    'favorites.desc': 'Accede rápidamente a tus pestañas marcadas con estrella en cualquier momento.',
    'favorites.empty': 'No tienes pestañas favoritas aún',
    'favorites.emptyDesc': 'Haz clic en el icono de estrella (⭐) en cualquier pestaña del tablero para fijarla como favorita.',
    'favorites.openAll': 'Abrir Todas en Chrome',

    // Pinned View
    'pinned.title': 'Pestañas Fijadas (Pinned Tabs)',
    'pinned.desc': 'Pestañas ancladas en tu navegador Chrome. Cuentan con inmunidad total contra cierres masivos o deduplicaciones.',
    'pinned.empty': 'No hay pestañas fijadas',
    'pinned.emptyDesc': 'Haz clic derecho en una pestaña en Chrome y selecciona "Fijar" para anclarla.',
    'pinned.protectedNotice': 'Protección Estricta: Las pestañas fijadas nunca son cerradas, agrupadas ni modificadas por acciones automatizadas.',

    // KPIs
    'kpi.activeTabs': 'Pestañas Activas',
    'kpi.frozenInRam': 'congeladas en RAM',
    'kpi.estimatedRamSaved': 'RAM Ahorrada Estimada',
    'kpi.savedByDiscard': 'Por descarte y guardado en stash',
    'kpi.curationRate': 'Tasa de Curaduría',
    'kpi.pendingLinks': 'enlaces pendientes',
    'kpi.layaFocus': 'Enfoque Laya Core',
    'kpi.mainDomain': 'Dominio principal',
    'kpi.interestDistribution': 'Distribución de Intereses (Taxonomía Laya CPU)',
    'kpi.analyzedTabs': 'pestañas analizadas',

    // Actions
    'action.classifyLaya': 'Clasificar (Laya)',
    'action.groupByTopic': 'Por Tema / Tipo',
    'action.groupByDomain': 'Por Dominio',
    'action.freezeInactive': 'Congelar Inactivas',
    'action.deduplicate': 'Deduplicar',
    'action.saveAllStash': 'Guardar Todo (Stash)',
    'action.stashSaved': '¡Sesión guardada en stash correctamente!',
    'action.freezeSuccess': 'RAM liberada con éxito.',
    'action.dedupSuccess': 'Pestañas duplicadas depuradas.',
    'action.filterPlaceholder': 'Filtrar por título, URL o dominio...',
    'action.showingTabs': 'Mostrando pestañas',

    // DataGrid
    'grid.colTitle': 'Título y URL',
    'grid.colDomain': 'Dominio',
    'grid.colCategory': 'Categoría (Laya)',
    'grid.colGroup': 'Grupo',
    'grid.colRam': 'Estado RAM',
    'grid.statusActive': 'Activa en uso',
    'grid.statusInRam': 'En memoria RAM',
    'grid.statusFrozen': 'Congelada',
    'grid.noGroup': 'Sin grupo',
    'grid.batchSuspend': 'Congelar seleccionadas',
    'grid.batchClose': 'Cerrar seleccionadas',
    'grid.batchMove': 'Mover a grupo',

    // Sessions
    'session.title': 'Historial de Sesiones Archivadas',
    'session.desc': 'Explora, clasifica y restaura pestañas o grupos individuales sin necesidad de restaurar toda la sesión.',
    'session.empty': 'No hay sesiones archivadas. Guarda tus pestañas abiertas con el botón "Guardar Todo (Stash)".',
    'session.restoreAll': 'Restaurar Sesión Completa',
    'session.restoreGroup': 'Restaurar Grupo',
    'session.restoreSelected': 'Restaurar Seleccionadas',
    'session.delete': 'Eliminar Sesión',
    'session.removeTab': 'Eliminar de sesión',
    'session.tabCount': 'pestañas',
    'session.groupCount': 'grupos',
    'session.confirmDelete': '¿Estás seguro de que deseas eliminar esta sesión archivada?',
    'session.collapseAllGroups': 'Colapsar todos los grupos',
    'session.expandAllGroups': 'Expandir todos los grupos',

    // Inbox
    'inbox.title': 'Bandeja de Curaduría de Enlaces',
    'inbox.desc': 'Filtra y clasifica enlaces guardados por rangos de fecha para revisarlos más tarde.',
    'inbox.filterAll': 'Todos',
    'inbox.filterToday': 'Hoy',
    'inbox.filterWeek': 'Esta semana',
    'inbox.filterMonth': 'Este mes',
    'inbox.filterCustom': 'Personalizado',
    'inbox.addPlaceholder': 'Pega una o varias URLs (separadas por saltos de línea)...',
    'inbox.addBtn': 'Añadir Enlaces',
    'inbox.empty': 'No hay enlaces en la bandeja de curaduría para este rango de fecha.',
    'inbox.reviewed': 'Revisado',
    'inbox.pending': 'Pendiente',
    'inbox.archive': 'Archivar',
    'inbox.delete': 'Eliminar',
    'inbox.open': 'Abrir enlace',

    // Groups View
    'groups.createGroup': 'Nuevo Grupo',
    'groups.noGroups': 'No hay grupos creados actualmente.',
    'groups.rename': 'Renombrar / Editar',
    'groups.deleteGroup': 'Eliminar Grupo',
    'groups.ungroup': 'Desagrupar',
    'groups.suspend': 'Suspender',
    'groups.close': 'Cerrar',
    'groups.emptyGroup': 'Grupo vacío',
    'groups.sortAlpha': 'Ordenar A-Z',
    'groups.sortDefault': 'Orden de Chrome',
    'groups.memoryUsage': 'RAM estimada',
    'groups.others': 'Otros',

    // Modals
    'modal.createTitle': 'Crear Nuevo Grupo de Pestañas',
    'modal.editTitle': 'Editar Grupo de Pestañas',
    'modal.groupName': 'Nombre del Grupo',
    'modal.groupColor': 'Color Semántico (16 colores)',
    'modal.cancel': 'Cancelar',
    'modal.save': 'Guardar Cambios',

    // Mock Banner
    'mockBanner.title': 'Servidor de Desarrollo Local Detectado',
    'mockBanner.desc': 'Estás visualizando TabZenith desde el servidor web local HTTP (127.0.0.1:5173). Por seguridad de Chrome, las páginas web comunes no pueden acceder a tus pestañas reales ni compartir storage con la extensión.',
    'mockBanner.btnOpenReal': 'Abrir Dashboard Real en Chrome',
    'mockBanner.shortcutHint': '💡 Usa el acceso directo actualizado en el Escritorio o ábrelo desde el popup de la extensión para gestionar tus pestañas reales.',
  },

  en: {
    // Header
    'header.title': 'TabZenith',
    'header.badge': 'Executive',
    'header.env.chrome': 'Chrome MV3 (Live)',
    'header.env.mock': 'Mock Environment',
    'header.laya.connecting': 'Connecting Laya...',
    'header.laya.connected': 'Laya Core (CPU)',
    'header.laya.heuristic': 'Laya Heuristic (CPU)',
    'header.searchPlaceholder': 'Fuzzy smart search (title, URL, topic)...',

    // Nav
    'nav.commandCenter': 'Command Center',
    'nav.groupsTabs': 'Groups & Tabs',
    'nav.favorites': 'Favorites',
    'nav.pinned': 'Pinned',
    'nav.inbox': 'Curation Inbox',
    'nav.sessions': 'Sessions',

    // Filters
    'filter.clearDomains': 'Clear domain filter',
    'filter.filteringBy': 'Filtering by',
    'filter.tabsCount': 'tabs visible',

    // Favorites View
    'favorites.title': 'Favorite Tabs',
    'favorites.desc': 'Quickly access your starred tabs at any time.',
    'favorites.empty': 'No favorite tabs yet',
    'favorites.emptyDesc': 'Click the star icon (⭐) on any tab to mark it as a favorite.',
    'favorites.openAll': 'Open All in Chrome',

    // Pinned View
    'pinned.title': 'Pinned Tabs',
    'pinned.desc': 'Tabs pinned in your Chrome browser. Protected against mass closes and deduplication.',
    'pinned.empty': 'No pinned tabs',
    'pinned.emptyDesc': 'Right-click a tab in Chrome and select "Pin" to anchor it.',
    'pinned.protectedNotice': 'Strict Protection: Pinned tabs are never closed, grouped or altered by automated actions.',

    // KPIs
    'kpi.activeTabs': 'Active Tabs',
    'kpi.frozenInRam': 'frozen in RAM',
    'kpi.estimatedRamSaved': 'Estimated RAM Saved',
    'kpi.savedByDiscard': 'Through tab discarding & stash',
    'kpi.curationRate': 'Curation Rate',
    'kpi.pendingLinks': 'pending links',
    'kpi.layaFocus': 'Laya Core Focus',
    'kpi.mainDomain': 'Primary domain',
    'kpi.interestDistribution': 'Interest Distribution (Laya CPU Taxonomy)',
    'kpi.analyzedTabs': 'tabs analyzed',

    // Actions
    'action.classifyLaya': 'Classify (Laya)',
    'action.groupByTopic': 'By Topic / Type',
    'action.groupByDomain': 'By Domain',
    'action.freezeInactive': 'Freeze Inactive',
    'action.deduplicate': 'Deduplicate',
    'action.saveAllStash': 'Save All (Stash)',
    'action.stashSaved': 'Session saved to stash successfully!',
    'action.freezeSuccess': 'RAM freed successfully.',
    'action.dedupSuccess': 'Duplicate tabs cleaned up.',
    'action.filterPlaceholder': 'Filter by title, URL or domain...',
    'action.showingTabs': 'Showing tabs',

    // DataGrid
    'grid.colTitle': 'Title & URL',
    'grid.colDomain': 'Domain',
    'grid.colCategory': 'Category (Laya)',
    'grid.colGroup': 'Group',
    'grid.colRam': 'RAM Status',
    'grid.statusActive': 'Active in use',
    'grid.statusInRam': 'In RAM memory',
    'grid.statusFrozen': 'Frozen',
    'grid.noGroup': 'No group',
    'grid.batchSuspend': 'Freeze selected',
    'grid.batchClose': 'Close selected',
    'grid.batchMove': 'Move to group',

    // Sessions
    'session.title': 'Archived Sessions History',
    'session.desc': 'Inspect, classify and restore individual tabs or groups without having to restore the entire session.',
    'session.empty': 'No archived sessions yet. Save your open tabs using "Save All (Stash)".',
    'session.restoreAll': 'Restore Entire Session',
    'session.restoreGroup': 'Restore Group',
    'session.restoreSelected': 'Restore Selected',
    'session.delete': 'Delete Session',
    'session.removeTab': 'Remove from session',
    'session.tabCount': 'tabs',
    'session.groupCount': 'groups',
    'session.confirmDelete': 'Are you sure you want to delete this archived session?',
    'session.collapseAllGroups': 'Collapse all groups',
    'session.expandAllGroups': 'Expand all groups',

    // Inbox
    'inbox.title': 'Link Curation Inbox',
    'inbox.desc': 'Filter and organize saved links by date ranges for later review.',
    'inbox.filterAll': 'All',
    'inbox.filterToday': 'Today',
    'inbox.filterWeek': 'This week',
    'inbox.filterMonth': 'This month',
    'inbox.filterCustom': 'Custom',
    'inbox.addPlaceholder': 'Paste one or more URLs (separated by newlines)...',
    'inbox.addBtn': 'Add Links',
    'inbox.empty': 'No links in the curation inbox for this date range.',
    'inbox.reviewed': 'Reviewed',
    'inbox.pending': 'Pending',
    'inbox.archive': 'Archive',
    'inbox.delete': 'Delete',
    'inbox.open': 'Open link',

    // Groups View
    'groups.createGroup': 'New Group',
    'groups.noGroups': 'No groups created currently.',
    'groups.rename': 'Rename / Edit',
    'groups.deleteGroup': 'Delete Group',
    'groups.ungroup': 'Ungroup',
    'groups.suspend': 'Suspend',
    'groups.close': 'Close',
    'groups.emptyGroup': 'Empty group',
    'groups.sortAlpha': 'Sort A-Z',
    'groups.sortDefault': 'Chrome Order',
    'groups.memoryUsage': 'Est. RAM',
    'groups.others': 'Others',

    // Modals
    'modal.createTitle': 'Create New Tab Group',
    'modal.editTitle': 'Edit Tab Group',
    'modal.groupName': 'Group Name',
    'modal.groupColor': 'Semantic Color (16 colors)',
    'modal.cancel': 'Cancel',
    'modal.save': 'Save Changes',

    // Mock Banner
    'mockBanner.title': 'Local Development Server Detected',
    'mockBanner.desc': 'You are viewing TabZenith from the local HTTP web server (127.0.0.1:5173). Due to Chrome security policies, regular web pages cannot access your live Chrome tabs or share extension storage.',
    'mockBanner.btnOpenReal': 'Open Live Dashboard in Chrome',
    'mockBanner.shortcutHint': '💡 Use the updated Desktop shortcut or open from the extension popup to manage your live tabs.',
  },

  ru: {
    // Header
    'header.title': 'TabZenith',
    'header.badge': 'Управленческий',
    'header.env.chrome': 'Chrome MV3 (Реальный)',
    'header.env.mock': 'Макет-среда (Mock)',
    'header.laya.connecting': 'Подключение Laya...',
    'header.laya.connected': 'Laya Core (CPU)',
    'header.laya.heuristic': 'Laya Эвристика (CPU)',
    'header.searchPlaceholder': 'Умный нечёткий поиск (заголовок, URL, тема)...',

    // Nav
    'nav.commandCenter': 'Центр управления',
    'nav.groupsTabs': 'Группы и вкладки',
    'nav.favorites': 'Избранное',
    'nav.pinned': 'Закрепленные',
    'nav.inbox': 'Курация ссылок',
    'nav.sessions': 'Сессии',

    // Filters
    'filter.clearDomains': 'Очистить фильтр доменов',
    'filter.filteringBy': 'Фильтрация по',
    'filter.tabsCount': 'вкладок видно',

    // Favorites View
    'favorites.title': 'Избранные вкладки',
    'favorites.desc': 'Быстрый доступ к отмеченным звёздочкой вкладкам в любое время.',
    'favorites.empty': 'Нет избранных вкладок',
    'favorites.emptyDesc': 'Нажмите на звёздочку (⭐) на любой вкладке, чтобы добавить её в избранное.',
    'favorites.openAll': 'Открыть все в Chrome',

    // Pinned View
    'pinned.title': 'Закреплённые вкладки (Pinned)',
    'pinned.desc': 'Закреплённые вкладки в браузере Chrome. Защищены от массового закрытия и удаления дубликатов.',
    'pinned.empty': 'Нет закреплённых вкладок',
    'pinned.emptyDesc': 'Нажмите правой кнопкой мыши по вкладке в Chrome и выберите "Закрепить".',
    'pinned.protectedNotice': 'Строгая защита: Закреплённые вкладки никогда не закрываются и не изменяются автоматическими действиями.',

    // KPIs
    'kpi.activeTabs': 'Активные вкладки',
    'kpi.frozenInRam': 'заморожено в RAM',
    'kpi.estimatedRamSaved': 'Экономия RAM',
    'kpi.savedByDiscard': 'За счёт заморозки и архивации',
    'kpi.curationRate': 'Степень курации',
    'kpi.pendingLinks': 'ссылок ожидает',
    'kpi.layaFocus': 'Фокус Laya Core',
    'kpi.mainDomain': 'Основной домен',
    'kpi.interestDistribution': 'Распределение интересов (Laya CPU)',
    'kpi.analyzedTabs': 'вкладок проанализировано',

    // Actions
    'action.classifyLaya': 'Классифицировать (Laya)',
    'action.groupByTopic': 'По теме / типу',
    'action.groupByDomain': 'По домену',
    'action.freezeInactive': 'Заморозить неактивные',
    'action.deduplicate': 'Удалить дубликаты',
    'action.saveAllStash': 'Сохранить всё (Stash)',
    'action.stashSaved': 'Сессия успешно сохранена в архив!',
    'action.freezeSuccess': 'RAM успешно освобождена.',
    'action.dedupSuccess': 'Дубликаты вкладок очищены.',
    'action.filterPlaceholder': 'Фильтр по названию, URL или домену...',
    'action.showingTabs': 'Показано вкладок',

    // DataGrid
    'grid.colTitle': 'Заголовок и URL',
    'grid.colDomain': 'Домен',
    'grid.colCategory': 'Категория (Laya)',
    'grid.colGroup': 'Группа',
    'grid.colRam': 'Статус RAM',
    'grid.statusActive': 'Активна',
    'grid.statusInRam': 'В памяти RAM',
    'grid.statusFrozen': 'Заморожена',
    'grid.noGroup': 'Без группы',
    'grid.batchSuspend': 'Заморозить выбранные',
    'grid.batchClose': 'Закрыть выбранные',
    'grid.batchMove': 'Переместить в группу',

    // Sessions
    'session.title': 'История сохранённых сессий',
    'session.desc': 'Просматривайте, классифицируйте и восстанавливайте отдельные вкладки или группы без полной сессии.',
    'session.empty': 'Архивных сессий нет. Сохраните открытые вкладки кнопкой "Сохранить всё (Stash)".',
    'session.restoreAll': 'Восстановить всю сессию',
    'session.restoreGroup': 'Восстановить группу',
    'session.restoreSelected': 'Восстановить выбранные',
    'session.delete': 'Удалить сессию',
    'session.removeTab': 'Удалить из сессии',
    'session.tabCount': 'вкладок',
    'session.groupCount': 'групп',
    'session.confirmDelete': 'Вы уверены, что хотите удалить эту архивную сессию?',
    'session.collapseAllGroups': 'Свернуть все группы',
    'session.expandAllGroups': 'Развернуть все группы',

    // Inbox
    'inbox.title': 'Входящие для курации ссылок',
    'inbox.desc': 'Фильтруйте и классифицируйте сохранённые ссылки по датам для последующего изучения.',
    'inbox.filterAll': 'Все',
    'inbox.filterToday': 'Сегодня',
    'inbox.filterWeek': 'На этой неделе',
    'inbox.filterMonth': 'В этом месяце',
    'inbox.filterCustom': 'Выбрать диапазон',
    'inbox.addPlaceholder': 'Вставьте один или несколько URL (по одному на строку)...',
    'inbox.addBtn': 'Добавить ссылки',
    'inbox.empty': 'Входящих ссылок за выбранный период нет.',
    'inbox.reviewed': 'Просмотрено',
    'inbox.pending': 'Ожидает',
    'inbox.archive': 'В архив',
    'inbox.delete': 'Удалить',
    'inbox.open': 'Открыть ссылку',

    // Groups View
    'groups.createGroup': 'Новая группа',
    'groups.noGroups': 'Групп пока нет.',
    'groups.rename': 'Переименовать / Изменить',
    'groups.deleteGroup': 'Удалить группу',
    'groups.ungroup': 'Разгруппировать',
    'groups.suspend': 'Приостановить',
    'groups.close': 'Закрыть',
    'groups.emptyGroup': 'Пустая группа',
    'groups.sortAlpha': 'По алфавиту А-Я',
    'groups.sortDefault': 'Порядок Chrome',
    'groups.memoryUsage': 'Память RAM',
    'groups.others': 'Другие',

    // Modals
    'modal.createTitle': 'Создать новую группу вкладок',
    'modal.editTitle': 'Редактировать группу вкладок',
    'modal.groupName': 'Название группы',
    'modal.groupColor': 'Семантический цвет (16 цветов)',
    'modal.cancel': 'Отмена',
    'modal.save': 'Сохранить изменения',

    // Mock Banner
    'mockBanner.title': 'Обнаружен локальный сервер разработки',
    'mockBanner.desc': 'Вы просматриваете TabZenith через локальный HTTP-сервер (127.0.0.1:5173). Из соображений безопасности Chrome обычные веб-страницы не имеют доступа к реальным вкладкам браузера.',
    'mockBanner.btnOpenReal': 'Открыть рабочий Dashboard в Chrome',
    'mockBanner.shortcutHint': '💡 Запустите ярлык на Рабочем столе или откройте окно через всплывающее меню расширения.',
  },

  zh: {
    // Header
    'header.title': 'TabZenith',
    'header.badge': '管理控制台',
    'header.env.chrome': 'Chrome MV3 (实时)',
    'header.env.mock': '模拟环境 (Mock)',
    'header.laya.connecting': '正在连接 Laya...',
    'header.laya.connected': 'Laya Core (CPU本地)',
    'header.laya.heuristic': 'Laya 启发式 (CPU)',
    'header.searchPlaceholder': '智能模糊搜索 (标题、网址、分类主题)...',

    // Nav
    'nav.commandCenter': '指挥中心',
    'nav.groupsTabs': '分组与标签页',
    'nav.favorites': '收藏夹',
    'nav.pinned': '固定标签',
    'nav.inbox': '链接策展箱',
    'nav.sessions': '会话归档',

    // Filters
    'filter.clearDomains': '清除域名过滤',
    'filter.filteringBy': '过滤条件',
    'filter.tabsCount': '个可见标签页',

    // Favorites View
    'favorites.title': '收藏标签页',
    'favorites.desc': '随时快速访问您加星标的重点标签页。',
    'favorites.empty': '暂无收藏的标签页',
    'favorites.emptyDesc': '点击任意标签页上的星标图标 (⭐) 即可将其添加到收藏夹。',
    'favorites.openAll': '在 Chrome 中打开全部',

    // Pinned View
    'pinned.title': '固定标签页 (Pinned Tabs)',
    'pinned.desc': '在 Chrome 浏览器中固定的标签页。免受批量关闭和重复清理的影响。',
    'pinned.empty': '暂无固定标签页',
    'pinned.emptyDesc': '在 Chrome 标签页上右键单击并选择“固定”以将其锁定。',
    'pinned.protectedNotice': '严格保护：固定标签页绝不会被自动化操作关闭、重新分组或更改。',

    // KPIs
    'kpi.activeTabs': '活跃标签页',
    'kpi.frozenInRam': '已在RAM中冻结',
    'kpi.estimatedRamSaved': '预估节省内存',
    'kpi.savedByDiscard': '通过休眠与归档释放',
    'kpi.curationRate': '策展完成率',
    'kpi.pendingLinks': '条待处理链接',
    'kpi.layaFocus': 'Laya Core 关注领域',
    'kpi.mainDomain': '主要领域',
    'kpi.interestDistribution': '兴趣领域分布 (Laya CPU 分类器)',
    'kpi.analyzedTabs': '个标签已分析',

    // Actions
    'action.classifyLaya': 'AI分类 (Laya)',
    'action.groupByTopic': '按主题/类型分组',
    'action.groupByDomain': '按域名分组',
    'action.freezeInactive': '冻结闲置标签',
    'action.deduplicate': '清理重复标签',
    'action.saveAllStash': '全部归档 (Stash)',
    'action.stashSaved': '所有会话已成功归档！',
    'action.freezeSuccess': '内存已成功释放。',
    'action.dedupSuccess': '重复标签页已完成清理。',
    'action.filterPlaceholder': '输入标题、URL 或域名进行过滤...',
    'action.showingTabs': '正在显示标签页',

    // DataGrid
    'grid.colTitle': '标题与网址',
    'grid.colDomain': '主域名',
    'grid.colCategory': '智能分类 (Laya)',
    'grid.colGroup': '所属分组',
    'grid.colRam': '内存状态',
    'grid.statusActive': '正在使用',
    'grid.statusInRam': '常驻内存',
    'grid.statusFrozen': '已休眠冻结',
    'grid.noGroup': '未分组',
    'grid.batchSuspend': '休眠所选标签',
    'grid.batchClose': '关闭所选标签',
    'grid.batchMove': '移至分组',

    // Sessions
    'session.title': '已归档会话历史',
    'session.desc': '细粒度探索、分类并恢复单条标签页或分组，无需强行恢复全部标签。',
    'session.empty': '暂无已归档会话。点击“全部归档 (Stash)”保存当前打开的标签页。',
    'session.restoreAll': '完整恢复会话',
    'session.restoreGroup': '仅恢复该分组',
    'session.restoreSelected': '恢复选中项',
    'session.delete': '删除此会话',
    'session.removeTab': '从会话中移除',
    'session.tabCount': '个标签页',
    'session.groupCount': '个分组',
    'session.confirmDelete': '确定要彻底删除该归档会话吗？',
    'session.collapseAllGroups': '折叠所有分组',
    'session.expandAllGroups': '展开所有分组',

    // Inbox
    'inbox.title': '链接策展收集箱',
    'inbox.desc': '按时间范围筛选并管理收藏的网址，便于日后深度研读。',
    'inbox.filterAll': '全部',
    'inbox.filterToday': '今天',
    'inbox.filterWeek': '本周',
    'inbox.filterMonth': '本月',
    'inbox.filterCustom': '自定义时间',
    'inbox.addPlaceholder': '粘贴一个或多个网址 (每行一个)...',
    'inbox.addBtn': '添加链接',
    'inbox.empty': '当前日期范围内没有待策展的链接。',
    'inbox.reviewed': '已阅',
    'inbox.pending': '待读',
    'inbox.archive': '归档',
    'inbox.delete': '删除',
    'inbox.open': '在新标签页打开',

    // Groups View
    'groups.createGroup': '新建分组',
    'groups.noGroups': '当前没有任何标签分组。',
    'groups.rename': '重命名/修改',
    'groups.deleteGroup': '解散/删除分组',
    'groups.ungroup': '移出分组',
    'groups.suspend': '休眠分组',
    'groups.close': '关闭分组',
    'groups.emptyGroup': '空分组',
    'groups.sortAlpha': '按名称 A-Z 排序',
    'groups.sortDefault': '浏览器原始顺序',
    'groups.memoryUsage': '预估内存',
    'groups.others': '其他',

    // Modals
    'modal.createTitle': '创建新标签页分组',
    'modal.editTitle': '编辑标签页分组',
    'modal.groupName': '分组名称',
    'modal.groupColor': '色彩标记 (16种语义色彩)',
    'modal.cancel': '取消',
    'modal.save': '保存更改',

    // Mock Banner
    'mockBanner.title': '当前处于本地开发服务器模式',
    'mockBanner.desc': '您正在从本地 HTTP 服务 (127.0.0.1:5173) 查看 TabZenith。由于 Chrome 安全沙箱限制，普通网页无法读取真实的浏览器标签页。',
    'mockBanner.btnOpenReal': '在 Chrome 中打开真实扩展控制台',
    'mockBanner.shortcutHint': '💡 请使用桌面快捷方式或点击 Chrome 扩展栏图标中的“打开管理控制台”。',
  },
};
