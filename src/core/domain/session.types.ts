import { TabItem } from './tab.types';
import { TabGroup } from './group.types';

export interface SessionSnapshot {
  readonly id: string;
  readonly name: string;
  readonly createdAt: number;
  readonly tabCount: number;
  readonly windowCount: number;
  readonly groups: readonly TabGroup[];
  readonly tabs: readonly TabItem[];
  readonly isAutoBackup?: boolean;
}
