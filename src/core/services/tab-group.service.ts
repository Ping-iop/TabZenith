import { IBrowserTabsPort } from '../ports/browser-tabs.port';
import { ITabStoragePort } from '../ports/tab-storage.port';
import { ITabClassifierPort } from '../ports/tab-classifier.port';
import { SessionSnapshot } from '../domain/session.types';
import { ChromeGroupColor } from '@/ui/tokens/colors.tokens';

export class TabGroupService {
  constructor(
    private readonly browserTabs: IBrowserTabsPort,
    private readonly storage: ITabStoragePort,
    private readonly classifier: ITabClassifierPort
  ) {}

  /**
   * Guarda todas las pestañas abiertas actuales en un Snapshot de sesión
   * y opcionalmente las cierra en Chrome para recuperar RAM inmediatamente.
   */
  async stashAllTabs(sessionName?: string, closeAfterSave = false): Promise<SessionSnapshot> {
    const tabs = await this.browserTabs.getOpenTabs();
    const groups = await this.browserTabs.getTabGroups();

    if (tabs.length === 0) {
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

    const snapshot: SessionSnapshot = {
      id: `session_${Date.now()}`,
      name,
      createdAt: Date.now(),
      tabCount: tabs.length,
      windowCount: new Set(tabs.map((t) => t.windowId).filter(Boolean)).size || 1,
      groups: [...groups],
      tabs: [...tabs],
    };

    await this.storage.saveSession(snapshot);

    if (closeAfterSave) {
      const idsToClose = tabs.map((t) => t.id);
      await this.browserTabs.closeTabs(idsToClose);
    }

    return snapshot;
  }

  /**
   * Restaura una sesión guardada abriendo sus pestañas y recreando los grupos nativos de Chrome.
   */
  async restoreSession(session: SessionSnapshot): Promise<void> {
    const groupMapping = new Map<string, string>(); // idAntiguo -> idNuevoChrome

    // 1. Recrear grupos en Chrome si existen
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

    // 2. Abrir pestañas sin grupo
    const ungroupedTabs = session.tabs.filter(
      (t) => !t.groupId || !groupMapping.has(t.groupId)
    );
    for (const tab of ungroupedTabs) {
      await this.browserTabs.createTab(tab.url, false);
    }
  }

  /**
   * Ejecuta clasificación automática sobre pestañas abiertas usando el motor (Laya Core / MARP)
   * y las agrupa automáticamente en Chrome por su dominio semántico.
   */
  async autoClassifyAndGroupOpenTabs(): Promise<{ groupedCount: number; categories: string[] }> {
    const tabs = await this.browserTabs.getOpenTabs();
    if (tabs.length === 0) return { groupedCount: 0, categories: [] };

    // Clasificar en lote
    const classifications = await this.classifier.classifyBatch(
      tabs.map((t) => ({ title: t.title, url: t.url }))
    );

    // Agrupar por categoría sugerida
    const groupsMap = new Map<string, { color: ChromeGroupColor; tabIds: string[] }>();

    tabs.forEach((tab, index) => {
      const result = classifications[index];
      const categoryTitle = result.suggestedGroupName;
      const existing = groupsMap.get(categoryTitle) || {
        color: result.suggestedColor,
        tabIds: [],
      };
      existing.tabIds.push(tab.id);
      groupsMap.set(categoryTitle, existing);
    });

    // Crear grupos nativos en Chrome
    const createdCategories: string[] = [];
    for (const [categoryTitle, data] of groupsMap.entries()) {
      if (data.tabIds.length > 0) {
        await this.browserTabs.groupTabs(data.tabIds, undefined, {
          title: categoryTitle,
          color: data.color,
        });
        createdCategories.push(categoryTitle);
      }
    }

    return {
      groupedCount: tabs.length,
      categories: createdCategories,
    };
  }

  /**
   * Mueve una pestaña a un grupo existente o a uno nuevo.
   */
  async moveTabToGroup(
    tabId: string,
    targetGroupId: string,
    newGroupInfo?: { title: string; color: ChromeGroupColor }
  ): Promise<void> {
    await this.browserTabs.groupTabs([tabId], targetGroupId, newGroupInfo);
  }

  /**
   * Extrae una pestaña de su grupo.
   */
  async ungroupTab(tabId: string): Promise<void> {
    await this.browserTabs.ungroupTabs([tabId]);
  }

  /**
   * Congela / Suspende pestañas para liberar memoria RAM.
   */
  async suspendTabs(tabIds: readonly string[]): Promise<void> {
    await this.browserTabs.discardTabs(tabIds);
  }
}
