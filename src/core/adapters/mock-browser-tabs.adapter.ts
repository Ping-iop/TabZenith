import { IBrowserTabsPort } from '../ports/browser-tabs.port';
import { TabItem } from '../domain/tab.types';
import { TabGroup } from '../domain/group.types';
import { ChromeGroupColor } from '@/ui/tokens/colors.tokens';

export class MockBrowserTabsAdapter implements IBrowserTabsPort {
  private tabs: TabItem[] = [
    {
      id: 'tab_1',
      chromeTabId: 1,
      title: 'GitHub - facebook/react: The library for web and native user interfaces',
      url: 'https://github.com/facebook/react',
      favIconUrl: 'https://github.githubassets.com/favicons/favicon.svg',
      groupId: 'grp_1',
      index: 0,
      active: true,
      pinned: false,
      discarded: false,
      domain: 'github.com',
      tags: ['code', 'frontend'],
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'tab_2',
      chromeTabId: 2,
      title: 'Vite | Next Generation Frontend Tooling',
      url: 'https://vite.dev',
      favIconUrl: 'https://vite.dev/logo.svg',
      groupId: 'grp_1',
      index: 1,
      active: false,
      pinned: false,
      discarded: false,
      domain: 'vite.dev',
      tags: ['code', 'tools'],
      createdAt: Date.now() - 7200000,
    },
    {
      id: 'tab_3',
      chromeTabId: 3,
      title: 'Attention Is All You Need - arXiv:1706.03762',
      url: 'https://arxiv.org/abs/1706.03762',
      favIconUrl: 'https://static.arxiv.org/static/browse/0.3.4/images/icons/favicon-32x32.png',
      groupId: 'grp_2',
      index: 2,
      active: false,
      pinned: false,
      discarded: true, // Discarded tab for testing RAM indicator
      domain: 'arxiv.org',
      tags: ['research', 'ai'],
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'tab_4',
      chromeTabId: 4,
      title: 'Tailwind CSS - Rapidly build modern websites without ever leaving your HTML',
      url: 'https://tailwindcss.com',
      favIconUrl: 'https://tailwindcss.com/favicons/favicon-32x32.png',
      index: 3,
      active: false,
      pinned: false,
      discarded: false,
      domain: 'tailwindcss.com',
      tags: ['web', 'design'],
      createdAt: Date.now() - 14400000,
    },
    {
      id: 'tab_5',
      chromeTabId: 5,
      title: 'YouTube - LLaMA 3 Architecture Explained in 10 Minutes',
      url: 'https://youtube.com/watch?v=mock_video',
      favIconUrl: 'https://www.youtube.com/s/desktop/990666ba/img/favicon.ico',
      index: 4,
      active: false,
      pinned: false,
      discarded: false,
      domain: 'youtube.com',
      tags: ['media'],
      createdAt: Date.now() - 18000000,
    },
  ];

  private groups: TabGroup[] = [
    {
      id: 'grp_1',
      chromeGroupId: 101,
      title: 'Desarrollo Frontend',
      color: 'blue',
      collapsed: false,
      createdAt: Date.now() - 7200000,
    },
    {
      id: 'grp_2',
      chromeGroupId: 102,
      title: 'Investigación IA',
      color: 'purple',
      collapsed: false,
      createdAt: Date.now() - 86400000,
    },
  ];

  private listeners: (() => void)[] = [];

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  async getOpenTabs(): Promise<readonly TabItem[]> {
    return [...this.tabs];
  }

  async getTabGroups(): Promise<readonly TabGroup[]> {
    return [...this.groups];
  }

  async createTab(url: string, active = true, discard = false): Promise<TabItem> {
    const newTab: TabItem = {
      id: `tab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: url,
      url,
      active: discard ? false : active,
      pinned: false,
      discarded: discard,
      domain: new URL(url).hostname.replace(/^www\./, ''),
      tags: [],
      createdAt: Date.now(),
      index: this.tabs.length,
    };
    this.tabs = [...this.tabs, newTab];
    this.notify();
    return newTab;
  }

  async closeTabs(tabIds: readonly string[]): Promise<void> {
    this.tabs = this.tabs.filter((t) => !(tabIds.includes(t.id) && !t.pinned));
    this.notify();
  }

  async discardTabs(tabIds: readonly string[]): Promise<void> {
    this.tabs = this.tabs.map((t) =>
      tabIds.includes(t.id) ? { ...t, discarded: true } : t
    );
    this.notify();
  }

  async groupTabs(
    tabIds: readonly string[],
    groupId?: string,
    groupDetails?: { title: string; color: ChromeGroupColor }
  ): Promise<string> {
    let targetGroupId = groupId;
    if (!targetGroupId) {
      targetGroupId = `grp_${Date.now()}`;
      const newGroup: TabGroup = {
        id: targetGroupId,
        title: groupDetails?.title || 'Nuevo Grupo',
        color: groupDetails?.color || 'blue',
        collapsed: false,
        createdAt: Date.now(),
      };
      this.groups = [...this.groups, newGroup];
    }

    this.tabs = this.tabs.map((t) =>
      tabIds.includes(t.id) ? { ...t, groupId: targetGroupId } : t
    );
    this.notify();
    return targetGroupId;
  }

  async ungroupTabs(tabIds: readonly string[]): Promise<void> {
    this.tabs = this.tabs.map((t) =>
      tabIds.includes(t.id) ? { ...t, groupId: undefined } : t
    );
    this.notify();
  }

  async updateGroup(
    groupId: string,
    title?: string,
    color?: ChromeGroupColor,
    collapsed?: boolean
  ): Promise<void> {
    this.groups = this.groups.map((g) => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        title: title !== undefined ? title : g.title,
        color: color !== undefined ? color : g.color,
        collapsed: collapsed !== undefined ? collapsed : g.collapsed,
        updatedAt: Date.now(),
      };
    });
    this.notify();
  }

  async deleteGroup(groupId: string, closeTabs: boolean): Promise<void> {
    this.groups = this.groups.filter((g) => g.id !== groupId);
    if (closeTabs) {
      this.tabs = this.tabs.filter((t) => t.groupId !== groupId);
    } else {
      this.tabs = this.tabs.map((t) =>
        t.groupId === groupId ? { ...t, groupId: undefined } : t
      );
    }
    this.notify();
  }

  subscribeToTabChanges(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }
}
