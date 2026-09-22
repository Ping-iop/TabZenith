import { TabItem } from '../domain/tab.types';
import { TabGroup } from '../domain/group.types';
import { ChromeGroupColor } from '@/ui/tokens/colors.tokens';

export interface IBrowserTabsPort {
  getOpenTabs(): Promise<readonly TabItem[]>;
  getTabGroups(): Promise<readonly TabGroup[]>;
  createTab(url: string, active?: boolean, discard?: boolean): Promise<TabItem>;
  activateTab(tabId: string): Promise<void>;
  closeTabs(tabIds: readonly string[]): Promise<void>;
  discardTabs(tabIds: readonly string[]): Promise<void>; // Congela pestañas para recuperar RAM
  groupTabs(
    tabIds: readonly string[],
    groupId?: string,
    groupDetails?: { title: string; color: ChromeGroupColor }
  ): Promise<string>;
  ungroupTabs(tabIds: readonly string[]): Promise<void>;
  updateGroup(
    groupId: string,
    title?: string,
    color?: ChromeGroupColor,
    collapsed?: boolean
  ): Promise<void>;
  deleteGroup(groupId: string, closeTabs: boolean): Promise<void>;
  subscribeToTabChanges(callback: () => void): () => void;
}
