import { useState, useEffect, useCallback } from 'react';
import { ClosedTabItem } from '../domain/closed-tab.types';
import { TabItem } from '../domain/tab.types';
import { container } from '../di/container';

const STORAGE_KEY = 'tabzenith_closed_tabs_history';
const MAX_HISTORY = 100;

export function useClosedTabs() {
  const [closedTabs, setClosedTabs] = useState<readonly ClosedTabItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar historial persistente
  useEffect(() => {
    async function loadHistory() {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        try {
          const res = await chrome.storage.local.get([STORAGE_KEY]);
          if (Array.isArray(res[STORAGE_KEY])) {
            setClosedTabs(res[STORAGE_KEY] as ClosedTabItem[]);
            setIsInitialized(true);
            return;
          }
        } catch {
          // Fallback a localStorage
        }
      }
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          setClosedTabs(JSON.parse(raw));
        }
      } catch {
        // Ignorar
      }
      setIsInitialized(true);
    }
    loadHistory();
  }, []);

  // Guardar en storage persistente
  const persistClosedTabs = useCallback(async (items: readonly ClosedTabItem[]) => {
    setClosedTabs(items);
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      try {
        await chrome.storage.local.set({ [STORAGE_KEY]: items });
      } catch {
        // Fallback a localStorage
      }
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignorar límite de almacenamiento
    }
  }, []);

  // Registrar pestañas cerradas
  const recordClosedTabs = useCallback(
    async (
      tabsToRecord: readonly TabItem[],
      reason: 'deduplicate' | 'manual' | 'freeze' = 'manual'
    ) => {
      if (tabsToRecord.length === 0) return;

      const newEntries: ClosedTabItem[] = tabsToRecord.map((t) => ({
        id: `closed_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        originalTabId: t.id,
        title: t.title || t.domain || 'Pestaña sin título',
        url: t.url,
        domain: t.domain || 'web',
        favIconUrl: t.favIconUrl,
        closedAt: Date.now(),
        reason,
      }));

      const updated = [...newEntries, ...closedTabs].slice(0, MAX_HISTORY);
      await persistClosedTabs(updated);
    },
    [closedTabs, persistClosedTabs]
  );

  // Restaurar / Deshacer una pestaña individual
  const restoreClosedTab = useCallback(
    async (item: ClosedTabItem) => {
      try {
        await container.browserTabs.createTab(item.url, false);
      } catch {
        // Fallback si no está en Chrome
        if (typeof window !== 'undefined') {
          window.open(item.url, '_blank');
        }
      }
      const filtered = closedTabs.filter((t) => t.id !== item.id);
      await persistClosedTabs(filtered);
    },
    [closedTabs, persistClosedTabs]
  );

  // Restaurar todas las pestañas cerradas
  const restoreAllClosedTabs = useCallback(async () => {
    for (const item of closedTabs) {
      try {
        await container.browserTabs.createTab(item.url, false);
      } catch {
        // Ignorar fallos individuales
      }
    }
    await persistClosedTabs([]);
  }, [closedTabs, persistClosedTabs]);

  // Limpiar historial
  const clearClosedTabs = useCallback(async () => {
    await persistClosedTabs([]);
  }, [persistClosedTabs]);

  return {
    closedTabs,
    isInitialized,
    recordClosedTabs,
    restoreClosedTab,
    restoreAllClosedTabs,
    clearClosedTabs,
  };
}
