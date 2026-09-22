import { TabItem } from '../domain/tab.types';
import { SessionSnapshot } from '../domain/session.types';
import { InboxLink } from '../domain/inbox.types';
import { ExecutiveMetrics, DomainTaxonomyStat } from '../domain/metrics.types';
import { MarpDomainTaxonomy } from '../domain/classifier.types';

const ESTIMATED_MB_PER_TAB = 150; // Estimación promedio de RAM en Chromium

export class ExecutiveAnalyticsService {
  static computeMetrics(
    openTabs: readonly TabItem[],
    sessions: readonly SessionSnapshot[],
    inboxLinks: readonly InboxLink[],
    tabTaxonomyMap: ReadonlyMap<string, MarpDomainTaxonomy>
  ): ExecutiveMetrics {
    const activeTabsCount = openTabs.length;
    const discardedTabsCount = openTabs.filter((t) => t.discarded).length;
    const savedSessionsCount = sessions.length;

    const totalSavedTabsCount = sessions.reduce(
      (acc, s) => acc + (s.tabs?.length || s.tabCount || 0),
      0
    );

    // RAM ahorrada estimada: pestañas suspendidas + pestañas que se guardaron y se cerraron
    const estimatedRamSavedMb = (discardedTabsCount + totalSavedTabsCount) * ESTIMATED_MB_PER_TAB;

    const inboxPendingCount = inboxLinks.filter((l) => !l.reviewed && !l.archived).length;
    const inboxReviewedCount = inboxLinks.filter((l) => l.reviewed).length;
    const totalInbox = inboxLinks.length;
    const curationRatePercent =
      totalInbox > 0 ? Math.round((inboxReviewedCount / totalInbox) * 100) : 100;

    // Conteo taxonómico
    const domainCounts = new Map<MarpDomainTaxonomy, number>();
    openTabs.forEach((tab) => {
      const taxonomy = tabTaxonomyMap.get(tab.id) || 'general';
      domainCounts.set(taxonomy, (domainCounts.get(taxonomy) || 0) + 1);
    });

    const totalCounted = openTabs.length || 1;
    const domainDistribution: DomainTaxonomyStat[] = Array.from(domainCounts.entries())
      .map(([domain, count]) => ({
        domain,
        count,
        percentage: Math.round((count / totalCounted) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return {
      activeTabsCount,
      discardedTabsCount,
      savedSessionsCount,
      totalSavedTabsCount,
      estimatedRamSavedMb,
      inboxPendingCount,
      inboxReviewedCount,
      curationRatePercent,
      domainDistribution,
    };
  }
}
