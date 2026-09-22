export interface ClosedTabItem {
  readonly id: string;
  readonly originalTabId: string;
  readonly title: string;
  readonly url: string;
  readonly domain: string;
  readonly favIconUrl?: string;
  readonly closedAt: number;
  readonly reason: 'deduplicate' | 'manual' | 'freeze';
}

export type ClosedTabRecord = ClosedTabItem;
