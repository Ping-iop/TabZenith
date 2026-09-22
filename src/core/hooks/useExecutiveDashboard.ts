import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTabs } from './useTabs';
import { useSessions } from './useSessions';
import { useInbox } from './useInbox';
import { container } from '../di/container';
import { ExecutiveAnalyticsService } from '../services/executive-analytics.service';
import { UrlCleanerService } from '../services/url-cleaner.service';
import { ExecutiveMetrics } from '../domain/metrics.types';
import { MarpDomainTaxonomy } from '../domain/classifier.types';
import { TabItem } from '../domain/tab.types';

export function useExecutiveDashboard() {
  const { tabs, groups, closeTabs, suspendTabs, refresh: refreshTabs } = useTabs();
  const { sessions } = useSessions();
  const { links: inboxLinks } = useInbox();

  const [tabTaxonomyMap, setTabTaxonomyMap] = useState<Map<string, MarpDomainTaxonomy>>(new Map());
  const [isClassifying, setIsClassifying] = useState(false);
  const [isGrouping, setIsGrouping] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Clasificar pestañas con Laya Core en segundo plano de manera reactiva
  useEffect(() => {
    let isCancelled = false;

    async function runBackgroundClassification() {
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

    runBackgroundClassification();

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

  // Botón Manual 1: "Clasificar" (dispara clasificación manual explícita con Laya)
  const manualClassify = useCallback(async () => {
    if (tabs.length === 0) {
      setActionFeedback('No hay pestañas abiertas para clasificar.');
      return;
    }
    setIsClassifying(true);
    try {
      const classifications = await container.classifier.classifyBatch(
        tabs.map((t) => ({ title: t.title, url: t.url }))
      );

      const nextMap = new Map<string, MarpDomainTaxonomy>();
      tabs.forEach((tab, index) => {
        nextMap.set(tab.id, classifications[index].primaryDomain);
      });
      setTabTaxonomyMap(nextMap);
      setActionFeedback(
        `Laya Core clasificó exitosamente ${tabs.length} pestañas en ${new Set(classifications.map((c) => c.primaryDomain)).size} dominios.`
      );
    } catch (err) {
      setActionFeedback(`Error al clasificar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsClassifying(false);
    }
  }, [tabs]);

  // Opción 1: Agrupar por Tema / Tipo (Laya)
  const groupByTopic = useCallback(async () => {
    if (tabs.length === 0) {
      setActionFeedback('No hay pestañas abiertas para agrupar.');
      return;
    }
    setIsGrouping(true);
    try {
      const result = await container.tabGroupService.groupByTopic();
      await refreshTabs();
      setActionFeedback(
        `Se agruparon ${result.groupedCount} pestañas en ${result.groupsCreated} grupos por Tema/Tipo (Laya).`
      );
    } catch (err) {
      setActionFeedback(`Error al agrupar por tema: ${err instanceof Error ? err.message : 'Error'}`);
    } finally {
      setIsGrouping(false);
    }
  }, [tabs, refreshTabs]);

  // Opción 2: Agrupar por Dominio Web
  const groupByDomain = useCallback(async () => {
    if (tabs.length === 0) {
      setActionFeedback('No hay pestañas abiertas para agrupar.');
      return;
    }
    setIsGrouping(true);
    try {
      const result = await container.tabGroupService.groupByDomain();
      await refreshTabs();
      setActionFeedback(
        `Se agruparon ${result.groupedCount} pestañas en ${result.groupsCreated} grupos por Dominio Web.`
      );
    } catch (err) {
      setActionFeedback(`Error al agrupar por dominio: ${err instanceof Error ? err.message : 'Error'}`);
    } finally {
      setIsGrouping(false);
    }
  }, [tabs, refreshTabs]);

  // Acción ejecutiva: Congelar inactivas (Liberar RAM sin cerrar)
  const freezeInactiveTabs = useCallback(async () => {
    // NUNCA congelar ni tocar pestañas fijadas (pinned)
    const inactiveTabs = tabs.filter((t) => !t.active && !t.pinned && !t.discarded);
    if (inactiveTabs.length === 0) {
      setActionFeedback('No hay pestañas inactivas elegibles para congelar (las fijadas están protegidas).');
      return;
    }
    const ids = inactiveTabs.map((t) => t.id);
    await suspendTabs(ids);
    const ramFreedMb = ids.length * 150;
    setActionFeedback(`Se suspendieron ${ids.length} pestañas. ~${ramFreedMb} MB de RAM liberada.`);
  }, [tabs, suspendTabs]);

  // Acción ejecutiva: Deduplicar pestañas de forma inteligente y segura
  const deduplicateTabs = useCallback(
    async (onDeduplicated?: (closedTabs: readonly TabItem[]) => void) => {
      const seenUrls = new Map<string, TabItem>();
      const tabsToClose: TabItem[] = [];

      for (const tab of tabs) {
        // Pestañas fijadas JAMÁS se consideran duplicadas a cerrar
        if (tab.pinned) continue;

        // Limpiar parámetros espías (utm_*, fbclid) sin tocar parámetros de contenido (v, id, q, etc.)
        const canonicalUrl = UrlCleanerService.canonicalizeForDeduplication(tab.url);
        if (!canonicalUrl) continue;

        if (!seenUrls.has(canonicalUrl)) {
          seenUrls.set(canonicalUrl, tab);
        } else {
          const existing = seenUrls.get(canonicalUrl)!;
          // Si la pestaña actual está activa y la previa no, cerramos la previa y conservamos la activa
          if (tab.active && !existing.active) {
            tabsToClose.push(existing);
            seenUrls.set(canonicalUrl, tab);
          } else {
            tabsToClose.push(tab);
          }
        }
      }

      if (tabsToClose.length === 0) {
        setActionFeedback('No se detectaron pestañas duplicadas idénticas.');
        return [];
      }

      const duplicateIds = tabsToClose.map((t) => t.id);

      // Notificar al historial de pestañas cerradas antes de cerrar para permitir Undo
      if (onDeduplicated) {
        onDeduplicated(tabsToClose);
      }

      await closeTabs(duplicateIds);
      setActionFeedback(`Se cerraron ${duplicateIds.length} pestañas duplicadas.`);
      return tabsToClose;
    },
    [tabs, closeTabs]
  );

  return {
    tabs,
    groups,
    metrics,
    isClassifying,
    isGrouping,
    actionFeedback,
    clearFeedback: () => setActionFeedback(null),
    manualClassify,
    groupByTopic,
    groupByDomain,
    freezeInactiveTabs,
    deduplicateTabs,
    tabTaxonomyMap,
  };
}
