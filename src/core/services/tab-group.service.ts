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
   */
  async restoreSession(session: SessionSnapshot): Promise<void> {
    const groupMapping = new Map<string, string>(); // idAntiguo -> idNuevoChrome

    for (const group of session.groups) {
      const tabsForGroup = session.tabs.filter((t) => t.groupId === group.id);
      if (tabsForGroup.length === 0) continue;

      const createdTabIds: string[] = [];
      for (const tab of tabsForGroup) {
        const created = await this.browserTabs.createTab(tab.url, false);
        createdTabIds.push(created.id);
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
      await this.browserTabs.createTab(tab.url, false);
    }
  }

  /**
   * Restaura ÚNICAMENTE un grupo específico de una sesión archivada.
   */
  async restoreSpecificGroup(
    group: TabGroup,
    tabs: readonly TabItem[]
  ): Promise<string> {
    const createdTabIds: string[] = [];
    for (const tab of tabs) {
      const created = await this.browserTabs.createTab(tab.url, false);
      createdTabIds.push(created.id);
    }

    if (createdTabIds.length === 0) return '';

    return await this.browserTabs.groupTabs(createdTabIds, undefined, {
      title: group.title,
      color: group.color,
    });
  }

  /**
   * Restaura ÚNICAMENTE pestañas individuales seleccionadas.
   */
  async restoreSelectedTabs(tabs: readonly TabItem[]): Promise<void> {
    for (const tab of tabs) {
      await this.browserTabs.createTab(tab.url, false);
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
   */
  async autoClassifyAndGroupOpenTabs(): Promise<{ groupedCount: number; categories: string[] }> {
    const allTabs = await this.browserTabs.getOpenTabs();
    // Proteger estrictamente pestañas fijadas (pinned): no se agrupan
    const tabs = allTabs.filter((t) => !t.pinned);
    if (tabs.length === 0) return { groupedCount: 0, categories: [] };

    const classifications = await this.classifier.classifyBatch(
      tabs.map((t) => ({ title: t.title, url: t.url }))
    );

    const groupsMap = new Map<string, { color: ChromeGroupColor; tabs: TabItem[] }>();

    tabs.forEach((tab, index) => {
      const result = classifications[index];
      const categoryTitle = result.suggestedGroupName;
      const existing = groupsMap.get(categoryTitle) || {
        color: result.suggestedColor,
        tabs: [],
      };
      existing.tabs.push(tab);
      groupsMap.set(categoryTitle, existing);
    });

    const singleTabs: TabItem[] = [];
    const createdCategories: string[] = [];

    for (const [categoryTitle, data] of groupsMap.entries()) {
      if (data.tabs.length === 1) {
        singleTabs.push(data.tabs[0]);
      } else if (data.tabs.length > 1) {
        await this.browserTabs.groupTabs(
          data.tabs.map((t) => t.id),
          undefined,
          {
            title: categoryTitle,
            color: data.color,
          }
        );
        createdCategories.push(categoryTitle);
      }
    }

    // Regla de sitios únicos: agruparlos en "Otros" ordenados alfabéticamente
    if (singleTabs.length > 0) {
      singleTabs.sort((a, b) => {
        const dComp = a.domain.localeCompare(b.domain, undefined, { sensitivity: 'base' });
        if (dComp !== 0) return dComp;
        return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      });

      await this.browserTabs.groupTabs(
        singleTabs.map((t) => t.id),
        undefined,
        {
          title: 'Otros',
          color: 'grey',
        }
      );
      createdCategories.push('Otros');
    }

    return {
      groupedCount: tabs.length,
      categories: createdCategories,
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
   * Cuando hay un solo website por dominio, no se crea un grupo individual;
   * se consolidan en "Otros" ordenados alfabéticamente.
   */
  async groupByDomain(): Promise<{ groupedCount: number; groupsCreated: number }> {
    const allTabs = await this.browserTabs.getOpenTabs();
    // Proteger estrictamente pestañas fijadas (pinned): no se agrupan
    const tabs = allTabs.filter((t) => !t.pinned);
    if (tabs.length === 0) return { groupedCount: 0, groupsCreated: 0 };

    const domainMap = new Map<string, TabItem[]>();
    tabs.forEach((tab) => {
      const d = tab.domain || 'otros';
      const existing = domainMap.get(d) || [];
      existing.push(tab);
      domainMap.set(d, existing);
    });

    const singleTabs: TabItem[] = [];
    const multiTabDomains = new Map<string, TabItem[]>();

    for (const [domain, domainTabs] of domainMap.entries()) {
      if (domainTabs.length === 1) {
        singleTabs.push(domainTabs[0]);
      } else {
        multiTabDomains.set(domain, domainTabs);
      }
    }

    const colors: ChromeGroupColor[] = [
      'blue', 'green', 'purple', 'cyan', 'orange', 'yellow', 'red', 'pink', 'teal', 'indigo', 'violet'
    ];
    let colorIndex = 0;
    let createdCount = 0;

    for (const [domain, domainTabs] of multiTabDomains.entries()) {
      if (domainTabs.length > 0) {
        const color = colors[colorIndex % colors.length];
        colorIndex++;
        await this.browserTabs.groupTabs(
          domainTabs.map((t) => t.id),
          undefined,
          {
            title: domain,
            color,
          }
        );
        createdCount++;
      }
    }

    // Unificar sitios de 1 pestaña en "Otros" ordenados alfabéticamente
    if (singleTabs.length > 0) {
      singleTabs.sort((a, b) => {
        const dComp = a.domain.localeCompare(b.domain, undefined, { sensitivity: 'base' });
        if (dComp !== 0) return dComp;
        return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      });

      await this.browserTabs.groupTabs(
        singleTabs.map((t) => t.id),
        undefined,
        {
          title: 'Otros',
          color: 'grey',
        }
      );
      createdCount++;
    }

    return {
      groupedCount: tabs.length,
      groupsCreated: createdCount,
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
