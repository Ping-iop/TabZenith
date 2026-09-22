import { IBrowserTabsPort } from '../ports/browser-tabs.port';
import { ITabStoragePort } from '../ports/tab-storage.port';
import { ITabClassifierPort } from '../ports/tab-classifier.port';
import { SessionSnapshot } from '../domain/session.types';
import { TabItem } from '../domain/tab.types';
import { TabGroup } from '../domain/group.types';
import { ChromeGroupColor } from '@/ui/tokens/colors.tokens';

export class TabGroupService {
  constructor(
    private readonly browserTabs: IBrowserTabsPort,
    private readonly storage: ITabStoragePort,
    private readonly classifier: ITabClassifierPort
  ) {}

  /**
   * Guarda todas las pestañas abiertas actuales en un Snapshot de sesión,
   * organiza y clasifica automáticamente con IA/Laya al momento de guardar,
   * y opcionalmente las cierra en Chrome respetando estrictamente las pestañas fijadas (pinned).
   */
  async stashAllTabs(sessionName?: string, closeAfterSave = false): Promise<SessionSnapshot> {
    const rawTabs = await this.browserTabs.getOpenTabs();
    const existingGroups = await this.browserTabs.getTabGroups();

    if (rawTabs.length === 0) {
      throw new Error('No hay pestañas abiertas para guardar.');
    }

    const name =
      sessionName?.trim() ||
      `Sesión ${new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })}`;

    // 1. Clasificación automática con Laya Core / MARP al momento de guardar
    const classifications = await this.classifier.classifyBatch(
      rawTabs.map((t) => ({ title: t.title, url: t.url }))
    );

    // Mapear grupos existentes por ID
    const groupMap = new Map<string, TabGroup>();
    existingGroups.forEach((g) => groupMap.set(g.id, g));

    // Para pestañas sin grupo previo, generar grupos semánticos automáticamente
    const organizedTabs: TabItem[] = [];
    const autoCreatedGroups = new Map<string, TabGroup>();

    rawTabs.forEach((tab, index) => {
      const classification = classifications[index];
      let targetGroupId = tab.groupId;

      // Si la pestaña no pertenecía a un grupo en Chrome, asignarla a un grupo clasificado por Laya
      if (!targetGroupId || !groupMap.has(targetGroupId)) {
        const catName = classification.suggestedGroupName;
        let autoGroup = autoCreatedGroups.get(catName);
        if (!autoGroup) {
          autoGroup = {
            id: `autogrp_${classification.primaryDomain}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            title: catName,
            color: classification.suggestedColor,
            collapsed: false,
            createdAt: Date.now(),
          };
          autoCreatedGroups.set(catName, autoGroup);
        }
        targetGroupId = autoGroup.id;
      }

      organizedTabs.push({
        ...tab,
        groupId: targetGroupId,
        tags: Array.from(new Set([...tab.tags, classification.primaryDomain])),
      });
    });

    const allGroups = [
      ...Array.from(groupMap.values()),
      ...Array.from(autoCreatedGroups.values()),
    ];

    const snapshot: SessionSnapshot = {
      id: `session_${Date.now()}`,
      name,
      createdAt: Date.now(),
      tabCount: organizedTabs.length,
      windowCount: new Set(organizedTabs.map((t) => t.windowId).filter(Boolean)).size || 1,
      groups: allGroups,
      tabs: organizedTabs,
    };

    await this.storage.saveSession(snapshot);

    // 2. Si se solicita cerrar pestañas, JAMÁS cerrar pestañas fijadas (pinned)
    if (closeAfterSave) {
      const nonPinnedTabIds = rawTabs.filter((t) => !t.pinned).map((t) => t.id);
      if (nonPinnedTabIds.length > 0) {
        await this.browserTabs.closeTabs(nonPinnedTabIds);
      }
    }

    return snapshot;
  }

  /**
   * Restaura una sesión completa en Chrome recreando grupos nativos.
   * Todas las pestañas se restauran CONGELADAS (discarded) para evitar saturación de RAM/CPU.
   */
  async restoreSession(session: SessionSnapshot): Promise<void> {
    const groupMapping = new Map<string, string>(); // idAntiguo -> idNuevoChrome
    const allCreatedTabIds: string[] = [];

    for (const group of session.groups) {
      const tabsForGroup = session.tabs.filter((t) => t.groupId === group.id);
      if (tabsForGroup.length === 0) continue;

      const createdTabIds: string[] = [];
      for (const tab of tabsForGroup) {
        // active: false, discard: true (congelada en RAM)
        const created = await this.browserTabs.createTab(tab.url, false, true);
        createdTabIds.push(created.id);
        allCreatedTabIds.push(created.id);
      }

      const newGroupId = await this.browserTabs.groupTabs(createdTabIds, undefined, {
        title: group.title,
        color: group.color,
      });
      groupMapping.set(group.id, newGroupId);
    }

    const ungroupedTabs = session.tabs.filter(
      (t) => !t.groupId || !groupMapping.has(t.groupId)
    );
    for (const tab of ungroupedTabs) {
      // active: false, discard: true (congelada en RAM)
      const created = await this.browserTabs.createTab(tab.url, false, true);
      allCreatedTabIds.push(created.id);
    }

    // Refuerzo de descarte en bloque para garantizar que no ocupen memoria
    if (allCreatedTabIds.length > 0) {
      await this.browserTabs.discardTabs(allCreatedTabIds);
    }
  }

  /**
   * Restaura ÚNICAMENTE un grupo específico de una sesión archivada (con pestañas congeladas).
   */
  async restoreSpecificGroup(
    group: TabGroup,
    tabs: readonly TabItem[]
  ): Promise<string> {
    const createdTabIds: string[] = [];
    for (const tab of tabs) {
      const created = await this.browserTabs.createTab(tab.url, false, true);
      createdTabIds.push(created.id);
    }

    if (createdTabIds.length === 0) return '';

    const newGroupId = await this.browserTabs.groupTabs(createdTabIds, undefined, {
      title: group.title,
      color: group.color,
    });

    await this.browserTabs.discardTabs(createdTabIds);
    return newGroupId;
  }

  /**
   * Restaura ÚNICAMENTE pestañas individuales seleccionadas (congeladas en RAM).
   */
  async restoreSelectedTabs(tabs: readonly TabItem[]): Promise<void> {
    const createdIds: string[] = [];
    for (const tab of tabs) {
      const created = await this.browserTabs.createTab(tab.url, false, true);
      createdIds.push(created.id);
    }
    if (createdIds.length > 0) {
      await this.browserTabs.discardTabs(createdIds);
    }
  }

  /**
   * Elimina una pestaña específica de una sesión archivada en IndexedDB.
   */
  async removeTabFromSession(sessionId: string, tabId: string): Promise<SessionSnapshot | null> {
    const sessions = await this.storage.getSessions();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return null;

    const updatedTabs = session.tabs.filter((t) => t.id !== tabId);
    // Eliminar grupos que hayan quedado completamente vacíos
    const activeGroupIds = new Set(updatedTabs.map((t) => t.groupId).filter(Boolean));
    const updatedGroups = session.groups.filter((g) => activeGroupIds.has(g.id));

    const updatedSession: SessionSnapshot = {
      ...session,
      tabs: updatedTabs,
      groups: updatedGroups,
      tabCount: updatedTabs.length,
    };

    await this.storage.saveSession(updatedSession);
    return updatedSession;
  }

  /**
   * Ejecuta auto-clasificación en vivo sobre las pestañas abiertas en Chrome.
   * Lógica Incremental: Revisa qué pestañas ya están ordenadas en sus grupos semánticos correspondientes
   * y añade únicamente las pestañas pendientes o desubicadas a los grupos existentes, sin rehacer todo el trabajo.
   */
  async autoClassifyAndGroupOpenTabs(): Promise<{ groupedCount: number; categories: string[] }> {
    const allTabs = await this.browserTabs.getOpenTabs();
    const existingGroups = await this.browserTabs.getTabGroups();

    // Proteger estrictamente pestañas fijadas (pinned): no se agrupan
    const tabs = allTabs.filter((t) => !t.pinned);
    if (tabs.length === 0) return { groupedCount: 0, categories: [] };

    const existingGroupById = new Map<string, TabGroup>();
    const existingGroupByTitle = new Map<string, TabGroup>();
    existingGroups.forEach((g) => {
      existingGroupById.set(g.id, g);
      if (g.title) {
        existingGroupByTitle.set(g.title.trim().toLowerCase(), g);
      }
    });

    const classifications = await this.classifier.classifyBatch(
      tabs.map((t) => ({ title: t.title, url: t.url }))
    );

    // Conteo por categoría para aplicar regla de sitios únicos -> "Otros"
    const categoryCounts = new Map<string, number>();
    tabs.forEach((_, index) => {
      const cat = classifications[index].suggestedGroupName;
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    });

    // Pestañas que necesitan ser agregadas o movidas
    const tabsToAddByTargetTitle = new Map<
      string,
      { color: ChromeGroupColor; tabs: TabItem[] }
    >();

    tabs.forEach((tab, index) => {
      const result = classifications[index];
      const count = categoryCounts.get(result.suggestedGroupName) || 0;
      const targetGroupTitle = count > 1 ? result.suggestedGroupName : 'Otros';
      const targetColor: ChromeGroupColor = targetGroupTitle === 'Otros' ? 'grey' : result.suggestedColor;

      // Comprobar si la pestaña ya está correctamente agrupada
      const currentGroup = tab.groupId ? existingGroupById.get(tab.groupId) : undefined;
      if (
        currentGroup &&
        currentGroup.title.trim().toLowerCase() === targetGroupTitle.trim().toLowerCase()
      ) {
        // La pestaña ya está en el grupo correcto: ¡No tocarla!
        return;
      }

      // Requiere anexarse o agruparse
      const existing = tabsToAddByTargetTitle.get(targetGroupTitle) || {
        color: targetColor,
        tabs: [],
      };
      existing.tabs.push(tab);
      tabsToAddByTargetTitle.set(targetGroupTitle, existing);
    });

    // Si todas las pestañas ya estaban ordenadas, terminar de inmediato
    if (tabsToAddByTargetTitle.size === 0) {
      return {
        groupedCount: tabs.length,
        categories: Array.from(existingGroupByTitle.keys()),
      };
    }

    const createdCategories: string[] = [];

    for (const [targetTitle, data] of tabsToAddByTargetTitle.entries()) {
      const existingGroup = existingGroupByTitle.get(targetTitle.toLowerCase());

      if (existingGroup) {
        // Anexar incrementalmente al grupo ya existente en Chrome
        await this.browserTabs.groupTabs(
          data.tabs.map((t) => t.id),
          existingGroup.id
        );
        createdCategories.push(targetTitle);
      } else {
        // Ordenar alfabéticamente si es "Otros"
        if (targetTitle === 'Otros') {
          data.tabs.sort((a, b) => {
            const dComp = a.domain.localeCompare(b.domain, undefined, { sensitivity: 'base' });
            if (dComp !== 0) return dComp;
            return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
          });
        }

        const newGroupId = await this.browserTabs.groupTabs(
          data.tabs.map((t) => t.id),
          undefined,
          {
            title: targetTitle,
            color: data.color,
          }
        );

        if (newGroupId) {
          existingGroupByTitle.set(targetTitle.toLowerCase(), {
            id: newGroupId,
            title: targetTitle,
            color: data.color,
            collapsed: false,
            createdAt: Date.now(),
          });
        }
        createdCategories.push(targetTitle);
      }
    }

    return {
      groupedCount: tabs.length,
      categories: Array.from(
        new Set([...Array.from(existingGroupByTitle.keys()), ...createdCategories])
      ),
    };
  }

  /**
   * Opción Paralela 1: Agrupar por Tema / Tipo (utilizando Laya Core en CPU)
   */
  async groupByTopic(): Promise<{ groupedCount: number; groupsCreated: number }> {
    const res = await this.autoClassifyAndGroupOpenTabs();
    return {
      groupedCount: res.groupedCount,
      groupsCreated: res.categories.length,
    };
  }

  /**
   * Opción Paralela 2: Agrupar por Dominio Web
   * Lógica Incremental: Solo revisa qué pestañas ya están agrupadas por su dominio y añade
   * según la clasificación a los grupos existentes, sin rehacer todo el trabajo.
   * Sitios con una sola pestaña se consolidan en "Otros" ordenados alfabéticamente.
   */
  async groupByDomain(): Promise<{ groupedCount: number; groupsCreated: number }> {
    const allTabs = await this.browserTabs.getOpenTabs();
    const existingGroups = await this.browserTabs.getTabGroups();

    // Proteger estrictamente pestañas fijadas (pinned): no se agrupan
    const tabs = allTabs.filter((t) => !t.pinned);
    if (tabs.length === 0) return { groupedCount: 0, groupsCreated: 0 };

    const existingGroupById = new Map<string, TabGroup>();
    const existingGroupByTitle = new Map<string, TabGroup>();
    existingGroups.forEach((g) => {
      existingGroupById.set(g.id, g);
      if (g.title) {
        existingGroupByTitle.set(g.title.trim().toLowerCase(), g);
      }
    });

    const domainCounts = new Map<string, number>();
    tabs.forEach((tab) => {
      const d = tab.domain || 'otros';
      domainCounts.set(d, (domainCounts.get(d) || 0) + 1);
    });

    const colors: ChromeGroupColor[] = [
      'blue', 'green', 'purple', 'cyan', 'orange', 'yellow', 'red', 'pink', 'teal', 'indigo', 'violet'
    ];
    let colorIndex = existingGroups.length;

    // Pestañas que necesitan agregarse a grupos nuevos o existentes
    const tabsToAddByDomain = new Map<string, TabItem[]>();

    tabs.forEach((tab) => {
      const d = tab.domain || 'otros';
      const count = domainCounts.get(d) || 0;
      const targetTitle = count > 1 ? d : 'Otros';

      // Comprobar si ya está en el grupo correcto
      const currentGroup = tab.groupId ? existingGroupById.get(tab.groupId) : undefined;
      if (
        currentGroup &&
        currentGroup.title.trim().toLowerCase() === targetTitle.trim().toLowerCase()
      ) {
        // La pestaña ya está en su grupo correspondiente: ¡No tocarla!
        return;
      }

      const list = tabsToAddByDomain.get(targetTitle) || [];
      list.push(tab);
      tabsToAddByDomain.set(targetTitle, list);
    });

    // Si todas las pestañas ya estaban ordenadas
    if (tabsToAddByDomain.size === 0) {
      return {
        groupedCount: tabs.length,
        groupsCreated: existingGroups.length,
      };
    }

    let createdCount = 0;

    for (const [targetTitle, domainTabs] of tabsToAddByDomain.entries()) {
      if (domainTabs.length === 0) continue;

      const existingGroup = existingGroupByTitle.get(targetTitle.toLowerCase());

      if (existingGroup) {
        // Anexar incrementalmente al grupo existente
        await this.browserTabs.groupTabs(
          domainTabs.map((t) => t.id),
          existingGroup.id
        );
      } else {
        // Ordenar alfabéticamente si es "Otros"
        if (targetTitle === 'Otros') {
          domainTabs.sort((a, b) => {
            const dComp = a.domain.localeCompare(b.domain, undefined, { sensitivity: 'base' });
            if (dComp !== 0) return dComp;
            return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
          });
        }

        const color = targetTitle === 'Otros' ? 'grey' : colors[colorIndex % colors.length];
        colorIndex++;

        const newGroupId = await this.browserTabs.groupTabs(
          domainTabs.map((t) => t.id),
          undefined,
          {
            title: targetTitle,
            color,
          }
        );

        if (newGroupId) {
          existingGroupByTitle.set(targetTitle.toLowerCase(), {
            id: newGroupId,
            title: targetTitle,
            color,
            collapsed: false,
            createdAt: Date.now(),
          });
        }
        createdCount++;
      }
    }

    return {
      groupedCount: tabs.length,
      groupsCreated: existingGroups.length + createdCount,
    };
  }

  async moveTabToGroup(
    tabId: string,
    targetGroupId: string,
    newGroupInfo?: { title: string; color: ChromeGroupColor }
  ): Promise<void> {
    await this.browserTabs.groupTabs([tabId], targetGroupId, newGroupInfo);
  }

  async ungroupTab(tabId: string): Promise<void> {
    await this.browserTabs.ungroupTabs([tabId]);
  }

  async suspendTabs(tabIds: readonly string[]): Promise<void> {
    await this.browserTabs.discardTabs(tabIds);
  }
}
