import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTabs } from './useTabs';
import { useSessions } from './useSessions';
import { useInbox } from './useInbox';
import { container } from '../di/container';
import { ExecutiveAnalyticsService } from '../services/executive-analytics.service';
import { ExecutiveMetrics } from '../domain/metrics.types';
import { MarpDomainTaxonomy } from '../domain/classifier.types';

export function useExecutiveDashboard() {
  const { tabs, groups, closeTabs, suspendTabs, refresh: refreshTabs } = useTabs();
  const { sessions } = useSessions();
  const { links: inboxLinks } = useInbox();

  const [tabTaxonomyMap, setTabTaxonomyMap] = useState<Map<string, MarpDomainTaxonomy>>(new Map());
  const [isClassifying, setIsClassifying] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Clasificar pestañas con Laya Core en segundo plano
  useEffect(() => {
    let isCancelled = false;

    async function runClassification() {
      if (tabs.length === 0) return;
      const unclassified = tabs.filter((t) => !tabTaxonomyMap.has(t.id));
      if (unclassified.length === 0) return;

      setIsClassifying(true);
      try {
        const classifications = await container.classifier.classifyBatch(
          unclassified.map((t) => ({ title: t.title, url: t.url }))
        );

        if (!isCancelled) {
          setTabTaxonomyMap((prev) => {
            const next = new Map(prev);
            unclassified.forEach((tab, index) => {
              next.set(tab.id, classifications[index].primaryDomain);
            });
            return next;
          });
        }
      } catch (err) {
        console.error('Error al clasificar pestañas con Laya:', err);
      } finally {
        if (!isCancelled) setIsClassifying(false);
      }
    }

    runClassification();

    return () => {
      isCancelled = true;
    };
  }, [tabs]);

  const metrics: ExecutiveMetrics = useMemo(() => {
    return ExecutiveAnalyticsService.computeMetrics(
      tabs,
      sessions,
      inboxLinks,
      tabTaxonomyMap
    );
  }, [tabs, sessions, inboxLinks, tabTaxonomyMap]);

  // Acción ejecutiva 1: Congelar inactivas (Liberar RAM sin cerrar)
  const freezeInactiveTabs = useCallback(async () => {
    const inactiveTabs = tabs.filter((t) => !t.active && !t.pinned && !t.discarded);
    if (inactiveTabs.length === 0) {
      setActionFeedback('No hay pestañas inactivas elegibles para congelar.');
      return;
    }
    const ids = inactiveTabs.map((t) => t.id);
    await suspendTabs(ids);
    const ramFreedMb = ids.length * 150;
    setActionFeedback(`Se suspendieron ${ids.length} pestañas. ~${ramFreedMb} MB de RAM liberada.`);
  }, [tabs, suspendTabs]);

  // Acción ejecutiva 2: Deduplicar pestañas
  const deduplicateTabs = useCallback(async () => {
    const seenUrls = new Set<string>();
    const duplicateIds: string[] = [];

    tabs.forEach((tab) => {
      const cleanUrl = tab.url.split('?')[0].replace(/\/$/, '');
      if (seenUrls.has(cleanUrl)) {
        duplicateIds.push(tab.id);
      } else {
        seenUrls.add(cleanUrl);
      }
    });

    if (duplicateIds.length === 0) {
      setActionFeedback('No se detectaron pestañas duplicadas.');
      return;
    }

    await closeTabs(duplicateIds);
    setActionFeedback(`Se cerraron ${duplicateIds.length} pestañas duplicadas.`);
  }, [tabs, closeTabs]);

  // Acción ejecutiva 3: Auto-clasificar sesión con Laya Core / MARP
  const autoClassifySession = useCallback(async () => {
    setIsClassifying(true);
    try {
      const result = await container.tabGroupService.autoClassifyAndGroupOpenTabs();
      await refreshTabs();
      setActionFeedback(
        `Laya clasificó ${result.groupedCount} pestañas en ${result.categories.length} grupos semánticos.`
      );
    } catch (err) {
      setActionFeedback(`Error en auto-clasificación: ${err instanceof Error ? err.message : 'Error'}`);
    } finally {
      setIsClassifying(false);
    }
  }, [refreshTabs]);

  return {
    tabs,
    groups,
    metrics,
    isClassifying,
    actionFeedback,
    clearFeedback: () => setActionFeedback(null),
    freezeInactiveTabs,
    deduplicateTabs,
    autoClassifySession,
    tabTaxonomyMap,
  };
}
