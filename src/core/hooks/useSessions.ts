import { useState, useEffect, useCallback } from 'react';
import { container } from '../di/container';
import { SessionSnapshot } from '../domain/session.types';
import { TabItem } from '../domain/tab.types';
import { TabGroup } from '../domain/group.types';

export function useSessions() {
  const [sessions, setSessions] = useState<readonly SessionSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await container.storage.getSessions();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar sesiones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const stashCurrentSession = useCallback(
    async (name?: string, closeAfter = false) => {
      const session = await container.tabGroupService.stashAllTabs(name, closeAfter);
      await fetchSessions();
      return session;
    },
    [fetchSessions]
  );

  const restoreSession = useCallback(async (session: SessionSnapshot) => {
    await container.tabGroupService.restoreSession(session);
  }, []);

  const restoreSpecificGroup = useCallback(
    async (group: TabGroup, tabs: readonly TabItem[]) => {
      await container.tabGroupService.restoreSpecificGroup(group, tabs);
    },
    []
  );

  const restoreSelectedTabs = useCallback(
    async (tabs: readonly TabItem[]) => {
      await container.tabGroupService.restoreSelectedTabs(tabs);
    },
    []
  );

  const removeTabFromSession = useCallback(
    async (sessionId: string, tabId: string) => {
      await container.tabGroupService.removeTabFromSession(sessionId, tabId);
      await fetchSessions();
    },
    [fetchSessions]
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      await container.storage.deleteSession(sessionId);
      await fetchSessions();
    },
    [fetchSessions]
  );

  return {
    sessions,
    loading,
    error,
    refresh: fetchSessions,
    stashCurrentSession,
    restoreSession,
    restoreSpecificGroup,
    restoreSelectedTabs,
    removeTabFromSession,
    deleteSession,
  };
}
