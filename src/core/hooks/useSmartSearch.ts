import { useState, useMemo, useEffect } from 'react';
import { container } from '../di/container';
import { TabItem } from '../domain/tab.types';
import { InboxLink } from '../domain/inbox.types';
import { SearchableItem, SearchResultMatch } from '../ports/search-engine.port';

export function useSmartSearch(tabs: readonly TabItem[], inboxLinks: readonly InboxLink[]) {
  const [query, setQuery] = useState('');

  // Indexar cuando cambian las pestañas o el inbox
  useEffect(() => {
    const items: SearchableItem[] = [
      ...tabs.map((tab) => ({ type: 'tab' as const, item: tab })),
      ...inboxLinks.map((link) => ({ type: 'inbox' as const, item: link })),
    ];
    container.searchEngine.indexItems(items);
  }, [tabs, inboxLinks]);

  const searchResults: readonly SearchResultMatch[] = useMemo(() => {
    if (!query.trim()) {
      return [];
    }
    return container.searchEngine.search(query);
  }, [query]);

  return {
    query,
    setQuery,
    searchResults,
    hasQuery: query.trim().length > 0,
  };
}
