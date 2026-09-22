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
    // 1. Guardar en IndexedDB (Dexie)
    await this.db.sessions.put(session);

    // 2. Respaldo secundario en chrome.storage.local (si es extensión)
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      try {
        const res = await chrome.storage.local.get(['tabzenith_backup_sessions']);
        const existing: SessionSnapshot[] = (res.tabzenith_backup_sessions as SessionSnapshot[]) || [];
        const updated = [session, ...existing.filter((s) => s.id !== session.id)].slice(0, 50);
        await chrome.storage.local.set({ tabzenith_backup_sessions: updated });
      } catch (err) {
        console.warn('[TabZenith] Error respaldando sesión en chrome.storage:', err);
      }
    } else {
      // Respaldo en localStorage si es entorno web
      try {
        const raw = localStorage.getItem('tabzenith_backup_sessions');
        const existing: SessionSnapshot[] = raw ? JSON.parse(raw) : [];
        const updated = [session, ...existing.filter((s) => s.id !== session.id)].slice(0, 30);
        localStorage.setItem('tabzenith_backup_sessions', JSON.stringify(updated));
      } catch {
        // Ignorar límites de localStorage
      }
    }
  }

  async getSessions(): Promise<readonly SessionSnapshot[]> {
    const list = await this.db.sessions.orderBy('createdAt').reverse().toArray();

    // Auto-recuperación si IndexedDB quedó vacío tras una actualización
    if (list.length === 0) {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        try {
          const res = await chrome.storage.local.get(['tabzenith_backup_sessions']);
          const backup: SessionSnapshot[] = (res.tabzenith_backup_sessions as SessionSnapshot[]) || [];
          if (backup.length > 0) {
            for (const s of backup) {
              await this.db.sessions.put(s);
            }
            return backup;
          }
        } catch (err) {
          console.warn('[TabZenith] Error recuperando backup de sesiones en chrome.storage:', err);
        }
      } else {
        try {
          const raw = localStorage.getItem('tabzenith_backup_sessions');
          if (raw) {
            const backup: SessionSnapshot[] = JSON.parse(raw);
            if (backup.length > 0) {
              for (const s of backup) {
                await this.db.sessions.put(s);
              }
              return backup;
            }
          }
        } catch {
          // Ignorar fallos de recuperación local
        }
      }
    }

    return list;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.db.sessions.delete(sessionId);

    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      try {
        const res = await chrome.storage.local.get(['tabzenith_backup_sessions']);
        const existing: SessionSnapshot[] = (res.tabzenith_backup_sessions as SessionSnapshot[]) || [];
        const filtered = existing.filter((s) => s.id !== sessionId);
        await chrome.storage.local.set({ tabzenith_backup_sessions: filtered });
      } catch (err) {
        console.warn('[TabZenith] Error eliminando sesión de backup:', err);
      }
    } else {
      try {
        const raw = localStorage.getItem('tabzenith_backup_sessions');
        if (raw) {
          const existing: SessionSnapshot[] = JSON.parse(raw);
          const filtered = existing.filter((s) => s.id !== sessionId);
          localStorage.setItem('tabzenith_backup_sessions', JSON.stringify(filtered));
        }
      } catch {
        // Ignorar
      }
    }
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
