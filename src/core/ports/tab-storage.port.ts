import { SessionSnapshot } from '../domain/session.types';
import { InboxLink, DateRangeFilterState } from '../domain/inbox.types';
import { TabGroup } from '../domain/group.types';

export interface ITabStoragePort {
  saveSession(session: SessionSnapshot): Promise<void>;
  getSessions(): Promise<readonly SessionSnapshot[]>;
  deleteSession(sessionId: string): Promise<void>;
  
  saveCustomGroup(group: TabGroup): Promise<void>;
  getCustomGroups(): Promise<readonly TabGroup[]>;
  deleteCustomGroup(groupId: string): Promise<void>;

  addInboxLinks(links: readonly { url: string; title: string; domain: string; notes?: string; tags?: string[] }[]): Promise<void>;
  getInboxLinks(filter?: DateRangeFilterState): Promise<readonly InboxLink[]>;
  updateInboxLink(id: string, updates: Partial<InboxLink>): Promise<void>;
  deleteInboxLink(id: string): Promise<void>;
  
  exportAllData(): Promise<string>;
  importData(jsonData: string): Promise<void>;
}
