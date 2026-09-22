import { ChromeGroupColor } from '@/ui/tokens/colors.tokens';

export interface TabGroup {
  readonly id: string;
  readonly chromeGroupId?: number;
  readonly title: string;
  readonly color: ChromeGroupColor;
  readonly collapsed: boolean;
  readonly createdAt: number;
  readonly updatedAt?: number;
}
