import { useState, useEffect, useCallback } from 'react';
import { container } from '../di/container';
import { InboxLink, DateRangeFilterState } from '../domain/inbox.types';
import { UrlCleanerService } from '../services/url-cleaner.service';

export function useInbox() {
  const [links, setLinks] = useState<readonly InboxLink[]>([]);
  const [filter, setFilter] = useState<DateRangeFilterState>({ preset: 'all' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await container.storage.getInboxLinks(filter);
      setLinks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar enlaces');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const addLinksFromText = useCallback(async (rawText: string) => {
    const cleaned = UrlCleanerService.extractAndSanitizeUrls(rawText);
    if (cleaned.length === 0) {
      throw new Error('No se detectaron URLs válidas en el texto proporcionado.');
    }

    await container.storage.addInboxLinks(
      cleaned.map((c) => ({
        url: c.url,
        title: c.title,
        domain: c.domain,
        notes: '',
        tags: [],
      }))
    );
    await fetchLinks();
    return cleaned.length;
  }, [fetchLinks]);

  const toggleReviewed = useCallback(async (id: string, reviewed: boolean) => {
    await container.storage.updateInboxLink(id, {
      reviewed,
      reviewedAt: reviewed ? Date.now() : undefined,
    });
    await fetchLinks();
  }, [fetchLinks]);

  const archiveLink = useCallback(async (id: string) => {
    await container.storage.updateInboxLink(id, { archived: true });
    await fetchLinks();
  }, [fetchLinks]);

  const deleteLink = useCallback(async (id: string) => {
    await container.storage.deleteInboxLink(id);
    await fetchLinks();
  }, [fetchLinks]);

  const openLink = useCallback(async (url: string) => {
    await container.browserTabs.createTab(url, true);
  }, []);

  return {
    links,
    filter,
    setFilter,
    loading,
    error,
    refresh: fetchLinks,
    addLinksFromText,
    toggleReviewed,
    archiveLink,
    deleteLink,
    openLink,
  };
}
