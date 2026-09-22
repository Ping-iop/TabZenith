export interface InboxLink {
  readonly id: string;
  readonly url: string;
  readonly title: string;
  readonly domain: string;
  readonly notes?: string;
  readonly tags: readonly string[];
  readonly addedAt: number;
  readonly reviewed: boolean;
  readonly reviewedAt?: number;
  readonly archived: boolean;
}

export type DateRangePreset = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom' | 'all';

export interface DateRangeFilterState {
  readonly preset: DateRangePreset;
  readonly startDate?: number; // epoch ms
  readonly endDate?: number;   // epoch ms
}
