import { ChromeGroupColor } from '@/ui/tokens/colors.tokens';

export interface TabItem {
  readonly id: string;
  readonly chromeTabId?: number;
  readonly url: string;
  readonly title: string;
  readonly favIconUrl?: string;
  readonly groupId?: string;
  readonly chromeGroupId?: number;
  readonly windowId?: number;
  readonly index: number;
  readonly active: boolean;
  readonly pinned: boolean;
  readonly discarded: boolean; // True si está congelada/suspendida para ahorrar RAM
  readonly domain: string;
  readonly tags: readonly string[];
  readonly createdAt: number;
  readonly lastAccessedAt?: number;
}
