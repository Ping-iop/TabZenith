import { MarpDomainTaxonomy } from './classifier.types';

export interface DomainTaxonomyStat {
  readonly domain: MarpDomainTaxonomy;
  readonly count: number;
  readonly percentage: number;
}

export interface ExecutiveMetrics {
  readonly activeTabsCount: number;
  readonly discardedTabsCount: number;
  readonly savedSessionsCount: number;
  readonly totalSavedTabsCount: number;
  readonly estimatedRamSavedMb: number; // ~150 MB por pestaña guardada o suspendida
  readonly inboxPendingCount: number;
  readonly inboxReviewedCount: number;
  readonly curationRatePercent: number;
  readonly domainDistribution: readonly DomainTaxonomyStat[];
}
