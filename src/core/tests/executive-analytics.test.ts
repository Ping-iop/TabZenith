import { describe, it, expect } from 'vitest';
import { ExecutiveAnalyticsService } from '../services/executive-analytics.service';
import { TabItem } from '../domain/tab.types';
import { SessionSnapshot } from '../domain/session.types';
import { InboxLink } from '../domain/inbox.types';
import { MarpDomainTaxonomy } from '../domain/classifier.types';

describe('ExecutiveAnalyticsService', () => {
  it('debe calcular métricas ejecutivas de RAM, conteo y tasa de curaduría', () => {
    const mockTabs: TabItem[] = [
      {
        id: '1',
        title: 'React',
        url: 'https://react.dev',
        index: 0,
        active: true,
        pinned: false,
        discarded: false,
        domain: 'react.dev',
        tags: [],
        createdAt: 100,
      },
      {
        id: '2',
        title: 'Arxiv',
        url: 'https://arxiv.org',
        index: 1,
        active: false,
        pinned: false,
        discarded: true, // 150 MB ahorrados
        domain: 'arxiv.org',
        tags: [],
        createdAt: 200,
      },
    ];

    const mockSessions: SessionSnapshot[] = [
      {
        id: 'sess_1',
        name: 'Sesión Vieja',
        createdAt: 50,
        tabCount: 4, // 4 tabs * 150 = 600 MB ahorrados
        windowCount: 1,
        groups: [],
        tabs: [],
      },
    ];

    const mockInbox: InboxLink[] = [
      {
        id: 'l1',
        url: 'https://a.com',
        title: 'A',
        domain: 'a.com',
        addedAt: 10,
        reviewed: true,
        archived: false,
        tags: [],
      },
      {
        id: 'l2',
        url: 'https://b.com',
        title: 'B',
        domain: 'b.com',
        addedAt: 20,
        reviewed: false,
        archived: false,
        tags: [],
      },
    ];

    const taxonomyMap = new Map<string, MarpDomainTaxonomy>([
      ['1', 'code'],
      ['2', 'research'],
    ]);

    const metrics = ExecutiveAnalyticsService.computeMetrics(
      mockTabs,
      mockSessions,
      mockInbox,
      taxonomyMap
    );

    expect(metrics.activeTabsCount).toBe(2);
    expect(metrics.discardedTabsCount).toBe(1);
    expect(metrics.savedSessionsCount).toBe(1);
    expect(metrics.totalSavedTabsCount).toBe(4);
    // 1 suspendida + 4 guardadas = 5 * 150MB = 750 MB
    expect(metrics.estimatedRamSavedMb).toBe(750);
    expect(metrics.inboxPendingCount).toBe(1);
    expect(metrics.inboxReviewedCount).toBe(1);
    expect(metrics.curationRatePercent).toBe(50);

    expect(metrics.domainDistribution).toHaveLength(2);
    expect(metrics.domainDistribution[0].percentage).toBe(50);
  });
});
