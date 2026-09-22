import { useState, useEffect, useCallback } from 'react';
import { container } from '../di/container';
import { TabItem } from '../domain/tab.types';
import { TabGroup } from '../domain/group.types';
import { ChromeGroupColor } from '@/ui/tokens/colors.tokens';

export function useTabs() {
  const [tabs, setTabs] = useState<readonly TabItem[]>([]);
  const [groups, setGroups] = useState<readonly TabGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTabsAndGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedTabs, fetchedGroups] = await Promise.all([
        container.browserTabs.getOpenTabs(),
        container.browserTabs.getTabGroups(),
      ]);
      setTabs(fetchedTabs);
      setGroups(fetchedGroups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pestañas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTabsAndGroups();
    const unsubscribe = container.browserTabs.subscribeToTabChanges(() => {
      fetchTabsAndGroups();
    });
    return unsubscribe;
  }, [fetchTabsAndGroups]);

  const closeTabs = useCallback(async (tabIds: readonly string[]) => {
    await container.browserTabs.closeTabs(tabIds);
    await fetchTabsAndGroups();
  }, [fetchTabsAndGroups]);

  const suspendTabs = useCallback(async (tabIds: readonly string[]) => {
    await container.browserTabs.discardTabs(tabIds);
    await fetchTabsAndGroups();
  }, [fetchTabsAndGroups]);

  const moveTabToGroup = useCallback(async (
    tabId: string,
    groupId?: string,
    newGroupInfo?: { title: string; color: ChromeGroupColor }
  ) => {
    await container.browserTabs.groupTabs([tabId], groupId, newGroupInfo);
    await fetchTabsAndGroups();
  }, [fetchTabsAndGroups]);

  const ungroupTabs = useCallback(async (tabIds: readonly string[]) => {
    await container.browserTabs.ungroupTabs(tabIds);
    await fetchTabsAndGroups();
  }, [fetchTabsAndGroups]);

  const updateGroup = useCallback(async (
    groupId: string,
    title?: string,
    color?: ChromeGroupColor,
    collapsed?: boolean
  ) => {
    await container.browserTabs.updateGroup(groupId, title, color, collapsed);
    await fetchTabsAndGroups();
  }, [fetchTabsAndGroups]);

  const deleteGroup = useCallback(async (groupId: string, closeTabs: boolean) => {
    await container.browserTabs.deleteGroup(groupId, closeTabs);
    await fetchTabsAndGroups();
  }, [fetchTabsAndGroups]);

  const createTab = useCallback(async (url: string, active = true, discard = false) => {
    const tab = await container.browserTabs.createTab(url, active, discard);
    await fetchTabsAndGroups();
    return tab;
  }, [fetchTabsAndGroups]);

  return {
    tabs,
    groups,
    loading,
    error,
    refresh: fetchTabsAndGroups,
    createTab,
    closeTabs,
    suspendTabs,
    moveTabToGroup,
    ungroupTabs,
    updateGroup,
    deleteGroup,
  };
}
