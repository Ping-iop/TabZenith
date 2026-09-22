import { IBrowserTabsPort } from '../ports/browser-tabs.port';
import { TabItem } from '../domain/tab.types';
import { TabGroup } from '../domain/group.types';
import { ChromeGroupColor, toNativeChromeTabGroupColor } from '@/ui/tokens/colors.tokens';

export class ChromeBrowserTabsAdapter implements IBrowserTabsPort {
  async getOpenTabs(): Promise<readonly TabItem[]> {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      return [];
    }

    const tabs = await chrome.tabs.query({});
    return tabs.map((tab) => {
      let domain = '';
      try {
        if (tab.url) {
          const parsed = new URL(tab.url);
          domain = parsed.hostname.replace(/^www\./, '');
        }
      } catch {
        domain = 'local';
      }

      return {
        id: String(tab.id ?? Math.random()),
        chromeTabId: tab.id,
        url: tab.url || '',
        title: tab.title || tab.url || 'Sin título',
        favIconUrl: tab.favIconUrl,
        groupId: tab.groupId && tab.groupId !== -1 ? String(tab.groupId) : undefined,
        chromeGroupId: tab.groupId && tab.groupId !== -1 ? tab.groupId : undefined,
        windowId: tab.windowId,
        index: tab.index,
        active: Boolean(tab.active),
        pinned: Boolean(tab.pinned),
        discarded: Boolean(tab.discarded),
        domain,
        tags: [],
        createdAt: Date.now(),
      };
    });
  }

  async getTabGroups(): Promise<readonly TabGroup[]> {
    if (typeof chrome === 'undefined' || !chrome.tabGroups) {
      return [];
    }

    const groups = await chrome.tabGroups.query({});
    return groups.map((g) => ({
      id: String(g.id),
      chromeGroupId: g.id,
      title: g.title || 'Grupo sin título',
      color: (g.color as ChromeGroupColor) || 'grey',
      collapsed: Boolean(g.collapsed),
      createdAt: Date.now(),
    }));
  }

  async createTab(url: string, active = true, discard = false): Promise<TabItem> {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      throw new Error('Chrome API no disponible en este entorno.');
    }

    const tab = await chrome.tabs.create({ url, active: discard ? false : active });

    // Si se solicita congelada para optimizar RAM al restaurar sesiones masivas
    if (discard && tab.id && chrome.tabs.discard) {
      const tabId = tab.id;
      try {
        await chrome.tabs.discard(tabId);
      } catch {
        // Si el navegador requiere que complete la carga inicial antes de descartar
        const onUpdateListener = (
          updatedId: number,
          changeInfo: chrome.tabs.TabChangeInfo
        ) => {
          if (updatedId === tabId && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(onUpdateListener);
            chrome.tabs.discard(tabId).catch(() => {});
          }
        };
        chrome.tabs.onUpdated.addListener(onUpdateListener);
        setTimeout(() => {
          try {
            chrome.tabs.onUpdated.removeListener(onUpdateListener);
            chrome.tabs.discard(tabId).catch(() => {});
          } catch {
            // Ignorar
          }
        }, 12000);
      }
    }

    return {
      id: String(tab.id),
      chromeTabId: tab.id,
      url: tab.url || url,
      title: tab.title || url,
      favIconUrl: tab.favIconUrl,
      groupId: tab.groupId && tab.groupId !== -1 ? String(tab.groupId) : undefined,
      chromeGroupId: tab.groupId && tab.groupId !== -1 ? tab.groupId : undefined,
      windowId: tab.windowId,
      index: tab.index,
      active: Boolean(tab.active),
      pinned: Boolean(tab.pinned),
      discarded: Boolean(discard),
      domain: new URL(url).hostname.replace(/^www\./, ''),
      tags: [],
      createdAt: Date.now(),
    };
  }

  async closeTabs(tabIds: readonly string[]): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.tabs) return;

    const openTabs = await chrome.tabs.query({});
    const tabMap = new Map(openTabs.map((t) => [t.id, t]));

    // Filtrar IDs para JAMÁS cerrar pestañas fijadas (pinned)
    const safeNumericIds: number[] = [];
    for (const strId of tabIds) {
      const numId = Number(strId);
      if (Number.isNaN(numId)) continue;
      const tab = tabMap.get(numId);
      if (tab && !tab.pinned) {
        safeNumericIds.push(numId);
      }
    }

    if (safeNumericIds.length === 0) return;

    // Si cerrar estas pestañas dejaría la ventana vacía (provocando el cierre de Chrome),
    // abrimos primero el dashboard o una pestaña limpia para mantener Chrome activo.
    const nonPinnedTabs = openTabs.filter((t) => !t.pinned);
    if (safeNumericIds.length >= nonPinnedTabs.length) {
      const dashboardUrl = chrome.runtime?.getURL
        ? chrome.runtime.getURL('dashboard.html')
        : 'chrome://newtab';
      const isDashboardAlreadyOpen = openTabs.some(
        (t) => t.url && t.url.includes('dashboard.html')
      );
      if (!isDashboardAlreadyOpen) {
        await chrome.tabs.create({ url: dashboardUrl, active: true });
      }
    }

    await chrome.tabs.remove(safeNumericIds);
  }

  async discardTabs(tabIds: readonly string[]): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.tabs?.discard) return;

    const numericIds = tabIds
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));

    for (const tabId of numericIds) {
      try {
        await chrome.tabs.discard(tabId);
      } catch (err) {
        console.warn(`No se pudo suspender la pestaña ${tabId}:`, err);
      }
    }
  }

  async groupTabs(
    tabIds: readonly string[],
    groupId?: string,
    groupDetails?: { title: string; color: ChromeGroupColor }
  ): Promise<string> {
    if (typeof chrome === 'undefined' || !chrome.tabs?.group) {
      throw new Error('Chrome tabGroups API no disponible.');
    }

    const numericTabIds = tabIds
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));

    if (numericTabIds.length === 0) {
      return '';
    }

    // Consultar el estado real e instantáneo de las pestañas en Chrome
    const currentTabs = await chrome.tabs.query({});
    const currentTabMap = new Map(currentTabs.map((t) => [t.id, t]));

    // Filtrar estrictamente solo aquellas pestañas que siguen existiendo y NO están fijadas (pinned)
    const validTabs = numericTabIds
      .map((id) => currentTabMap.get(id))
      .filter((t): t is chrome.tabs.Tab => Boolean(t && !t.pinned && t.id !== undefined));

    if (validTabs.length === 0) {
      return '';
    }

    // Chrome requiere que las pestañas agrupadas pertenezcan a la misma ventana
    const tabsByWindow = new Map<number, number[]>();
    for (const tab of validTabs) {
      const wId = tab.windowId;
      const list = tabsByWindow.get(wId) || [];
      list.push(tab.id!);
      tabsByWindow.set(wId, list);
    }

    let lastGroupId: number | undefined;

    for (const [, ids] of tabsByWindow.entries()) {
      if (ids.length === 0) continue;
      try {
        const options: chrome.tabs.GroupOptions = {
          tabIds: ids as [number, ...number[]],
        };

        if (groupId) {
          const numericGroupId = Number(groupId);
          if (!Number.isNaN(numericGroupId)) {
            options.groupId = numericGroupId;
          }
        }

        let targetGroupId: number;
        try {
          targetGroupId = await chrome.tabs.group(options);
        } catch {
          // Si el grupo objetivo ya no existe en la ventana, crear uno nuevo
          targetGroupId = await chrome.tabs.group({
            tabIds: ids as [number, ...number[]],
          });
        }

        lastGroupId = targetGroupId;

        if (groupDetails && chrome.tabGroups?.update) {
          await chrome.tabGroups.update(targetGroupId, {
            title: groupDetails.title,
            color: toNativeChromeTabGroupColor(groupDetails.color),
          });
        }
      } catch (groupErr) {
        console.warn('[TabZenith] Error al agrupar lote de pestañas en Chrome:', groupErr);
      }
    }

    return lastGroupId ? String(lastGroupId) : '';
  }

  async ungroupTabs(tabIds: readonly string[]): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.tabs?.ungroup) return;

    const currentTabs = await chrome.tabs.query({});
    const aliveIds = new Set(currentTabs.map((t) => t.id));

    const numericTabIds = tabIds
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id) && aliveIds.has(id));

    if (numericTabIds.length > 0) {
      try {
        await chrome.tabs.ungroup(numericTabIds as [number, ...number[]]);
      } catch (err) {
        console.warn('[TabZenith] Error al desagrupar pestañas en Chrome:', err);
      }
    }
  }

  async updateGroup(
    groupId: string,
    title?: string,
    color?: ChromeGroupColor,
    collapsed?: boolean
  ): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.tabGroups?.update) return;

    const numericGroupId = Number(groupId);
    if (Number.isNaN(numericGroupId)) return;

    const updates: chrome.tabGroups.UpdateProperties = {};
    if (title !== undefined) updates.title = title;
    if (color !== undefined) updates.color = toNativeChromeTabGroupColor(color);
    if (collapsed !== undefined) updates.collapsed = collapsed;

    await chrome.tabGroups.update(numericGroupId, updates);
  }

  async deleteGroup(groupId: string, closeTabs: boolean): Promise<void> {
    if (typeof chrome === 'undefined') return;

    const numericGroupId = Number(groupId);
    if (Number.isNaN(numericGroupId)) return;

    const tabsInGroup = await chrome.tabs.query({ groupId: numericGroupId });
    const tabIds = tabsInGroup.map((t) => String(t.id)).filter(Boolean);

    if (closeTabs) {
      await this.closeTabs(tabIds);
    } else if (tabIds.length > 0) {
      const numericIds = tabIds.map(Number);
      await chrome.tabs.ungroup(numericIds as [number, ...number[]]);
    }
  }

  subscribeToTabChanges(callback: () => void): () => void {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      return () => {};
    }

    const onTabsUpdated = () => callback();
    const onTabsCreated = () => callback();
    const onTabsRemoved = () => callback();
    const onGroupUpdated = () => callback();

    chrome.tabs.onUpdated.addListener(onTabsUpdated);
    chrome.tabs.onCreated.addListener(onTabsCreated);
    chrome.tabs.onRemoved.addListener(onTabsRemoved);
    if (chrome.tabGroups) {
      chrome.tabGroups.onUpdated?.addListener(onGroupUpdated);
      chrome.tabGroups.onCreated?.addListener(onGroupUpdated);
      chrome.tabGroups.onRemoved?.addListener(onGroupUpdated);
    }

    return () => {
      chrome.tabs.onUpdated.removeListener(onTabsUpdated);
      chrome.tabs.onCreated.removeListener(onTabsCreated);
      chrome.tabs.onRemoved.removeListener(onTabsRemoved);
      if (chrome.tabGroups) {
        chrome.tabGroups.onUpdated?.removeListener(onGroupUpdated);
        chrome.tabGroups.onCreated?.removeListener(onGroupUpdated);
        chrome.tabGroups.onRemoved?.removeListener(onGroupUpdated);
      }
    };
  }
}
