import { useState, useEffect, useCallback } from 'react';
import { container } from '../di/container';
import { SessionSnapshot } from '../domain/session.types';

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

  const stashCurrentSession = useCallback(async (name?: string, closeAfter = false) => {
    const session = await container.tabGroupService.stashAllTabs(name, closeAfter);
    await fetchSessions();
    return session;
  }, [fetchSessions]);

  const restoreSession = useCallback(async (session: SessionSnapshot) => {
    await container.tabGroupService.restoreSession(session);
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    await container.storage.deleteSession(sessionId);
    await fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    refresh: fetchSessions,
    stashCurrentSession,
    restoreSession,
    deleteSession,
  };
}
