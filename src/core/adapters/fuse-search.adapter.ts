import Fuse from 'fuse.js';
import { ISearchEnginePort, SearchableItem, SearchResultMatch } from '../ports/search-engine.port';

interface FuseDoc {
  raw: SearchableItem;
  title: string;
  url: string;
  domain: string;
  tags: string[];
}

export class FuseSearchAdapter implements ISearchEnginePort {
  private fuse: Fuse<FuseDoc> | null = null;

  indexItems(items: readonly SearchableItem[]): void {
    const docs: FuseDoc[] = items.map((wrapper) => {
      if (wrapper.type === 'tab') {
        return {
          raw: wrapper,
          title: wrapper.item.title,
          url: wrapper.item.url,
          domain: wrapper.item.domain,
          tags: [...wrapper.item.tags],
        };
      }
      return {
        raw: wrapper,
        title: wrapper.item.title,
        url: wrapper.item.url,
        domain: wrapper.item.domain,
        tags: [...wrapper.item.tags, wrapper.item.notes || ''],
      };
    });

    this.fuse = new Fuse(docs, {
      keys: [
        { name: 'title', weight: 0.5 },
        { name: 'domain', weight: 0.3 },
        { name: 'tags', weight: 0.15 },
        { name: 'url', weight: 0.05 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
      includeScore: true,
    });
  }

  search(query: string): readonly SearchResultMatch[] {
    if (!this.fuse || !query.trim()) {
      return [];
    }

    const results = this.fuse.search(query.trim());
    return results.map((res) => ({
      item: res.item.raw,
      score: res.score ?? 1,
    }));
  }
}
