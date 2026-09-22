import { TabItem } from '../domain/tab.types';
import { InboxLink } from '../domain/inbox.types';

export type SearchableItem =
  | { type: 'tab'; item: TabItem }
  | { type: 'inbox'; item: InboxLink };

export interface SearchResultMatch {
  readonly item: SearchableItem;
  readonly score: number;
}

export interface ISearchEnginePort {
  indexItems(items: readonly SearchableItem[]): void;
  search(query: string): readonly SearchResultMatch[];
}
