import Dexie, { type Table } from 'dexie';
import { ITabStoragePort } from '../ports/tab-storage.port';
import { SessionSnapshot } from '../domain/session.types';
import { TabGroup } from '../domain/group.types';
import { InboxLink, DateRangeFilterState } from '../domain/inbox.types';

class TabFlowDatabase extends Dexie {
  sessions!: Table<SessionSnapshot, string>;
  customGroups!: Table<TabGroup, string>;
  inboxLinks!: Table<InboxLink, string>;

  constructor() {
    super('TabFlowDB');
    this.version(1).stores({
      sessions: 'id, createdAt, name, tabCount',
      customGroups: 'id, title, color, createdAt',
      inboxLinks: 'id, url, domain, addedAt, reviewed, archived',
    });
  }
}

export class DexieStorageAdapter implements ITabStoragePort {
  private readonly db: TabFlowDatabase;

  constructor() {
    this.db = new TabFlowDatabase();
  }

  async saveSession(session: SessionSnapshot): Promise<void> {
    await this.db.sessions.put(session);
  }

  async getSessions(): Promise<readonly SessionSnapshot[]> {
    return await this.db.sessions.orderBy('createdAt').reverse().toArray();
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.db.sessions.delete(sessionId);
  }

  async saveCustomGroup(group: TabGroup): Promise<void> {
    await this.db.customGroups.put(group);
  }

  async getCustomGroups(): Promise<readonly TabGroup[]> {
    return await this.db.customGroups.toArray();
  }

  async deleteCustomGroup(groupId: string): Promise<void> {
    await this.db.customGroups.delete(groupId);
  }

  async addInboxLinks(
    links: readonly { url: string; title: string; domain: string; notes?: string; tags?: string[] }[]
  ): Promise<void> {
    const now = Date.now();
    const newItems: InboxLink[] = links.map((link) => ({
      id: `inbox_${now}_${Math.random().toString(36).substring(2, 9)}`,
      url: link.url,
      title: link.title || link.url,
      domain: link.domain,
      notes: link.notes || '',
      tags: link.tags || [],
      addedAt: now,
      reviewed: false,
      archived: false,
    }));

    await this.db.inboxLinks.bulkPut(newItems);
  }

  async getInboxLinks(filter?: DateRangeFilterState): Promise<readonly InboxLink[]> {
    let collection = this.db.inboxLinks.orderBy('addedAt').reverse();

    if (!filter || filter.preset === 'all') {
      return await collection.toArray();
    }

    const { startDate, endDate } = this.resolveDateRange(filter);

    return await collection
      .filter((link) => {
        if (startDate && link.addedAt < startDate) return false;
        if (endDate && link.addedAt > endDate) return false;
        return true;
      })
      .toArray();
  }

  async updateInboxLink(id: string, updates: Partial<InboxLink>): Promise<void> {
    await this.db.inboxLinks.update(id, updates);
  }

  async deleteInboxLink(id: string): Promise<void> {
    await this.db.inboxLinks.delete(id);
  }

  async exportAllData(): Promise<string> {
    const [sessions, customGroups, inboxLinks] = await Promise.all([
      this.db.sessions.toArray(),
      this.db.customGroups.toArray(),
      this.db.inboxLinks.toArray(),
    ]);

    return JSON.stringify({
      version: 1,
      exportedAt: Date.now(),
      sessions,
      customGroups,
      inboxLinks,
    }, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    if (!data || typeof data !== 'object') {
      throw new Error('Formato de archivo inválido para importar.');
    }

    await this.db.transaction('rw', [this.db.sessions, this.db.customGroups, this.db.inboxLinks], async () => {
      if (Array.isArray(data.sessions)) {
        await this.db.sessions.bulkPut(data.sessions);
      }
      if (Array.isArray(data.customGroups)) {
        await this.db.customGroups.bulkPut(data.customGroups);
      }
      if (Array.isArray(data.inboxLinks)) {
        await this.db.inboxLinks.bulkPut(data.inboxLinks);
      }
    });
  }

  private resolveDateRange(filter: DateRangeFilterState): { startDate?: number; endDate?: number } {
    const now = new Date();

    if (filter.preset === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      return { startDate: start };
    }

    if (filter.preset === 'yesterday') {
      const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
      const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - 1;
      return { startDate: yesterdayStart, endDate: yesterdayEnd };
    }

    if (filter.preset === 'last7days') {
      const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      return { startDate: sevenDaysAgo };
    }

    if (filter.preset === 'last30days') {
      const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
      return { startDate: thirtyDaysAgo };
    }

    if (filter.preset === 'custom') {
      return {
        startDate: filter.startDate,
        endDate: filter.endDate,
      };
    }

    return {};
  }
}
