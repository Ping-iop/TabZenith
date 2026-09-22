import { ChromeGroupColor } from '@/ui/tokens/colors.tokens';

export type MarpDomainTaxonomy =
  | 'code'
  | 'research'
  | 'web'
  | 'media'
  | 'creative'
  | 'data'
  | 'system'
  | 'finance'
  | 'gaming'
  | 'memory'
  | 'general';

export interface ClassificationResult {
  readonly primaryDomain: MarpDomainTaxonomy;
  readonly confidence: number;
  readonly suggestedGroupName: string;
  readonly suggestedColor: ChromeGroupColor;
  readonly topDomains: readonly [MarpDomainTaxonomy, number][];
}
