import React from 'react';
import { Search, ExternalLink, Inbox, Layers } from 'lucide-react';
import { SearchResultMatch } from '@/core/ports/search-engine.port';
import { Card } from '../atoms/Card';

interface SearchResultsViewProps {
  results: readonly SearchResultMatch[];
  query: string;
  onOpenUrl: (url: string) => void;
  onActivateTab?: (tabId: string) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  results,
  query,
  onOpenUrl,
  onActivateTab,
}) => {
  return (
    <Card className="p-4 bg-surface-card border-brand-primary/40 shadow-elevated space-y-3">
      <div className="flex items-center justify-between border-b border-surface-border pb-2">
        <span className="text-xs font-semibold text-content-secondary uppercase tracking-wider flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-brand-primary" />
          <span>Resultados para "{query}" ({results.length})</span>
        </span>
      </div>

      {results.length === 0 ? (
        <p className="text-xs text-content-muted text-center py-4">
          No se encontraron coincidencias para la búsqueda.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
          {results.map(({ item }) => {
            const isTab = item.type === 'tab';
            const data = item.item;
            return (
              <div
                key={data.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-surface-subtle hover:bg-surface-elevated transition-colors text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                  {isTab ? (
                    <span title="Pestaña Abierta" className="p-1 rounded bg-blue-500/10 text-blue-400">
                      <Layers className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span title="Enlace en Inbox" className="p-1 rounded bg-purple-500/10 text-purple-400">
                      <Inbox className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    {isTab && onActivateTab ? (
                      <button
                        type="button"
                        onClick={() => onActivateTab(data.id)}
                        title={`Ir a esta pestaña en Chrome: ${data.title}`}
                        className="font-medium text-left text-content-primary hover:text-brand-primary truncate block max-w-full"
                      >
                        {data.title}
                      </button>
                    ) : (
                      <a
                        href={data.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-content-primary hover:text-brand-primary truncate block"
                      >
                        {data.title}
                      </a>
                    )}
                    <span className="text-[11px] text-content-muted truncate block">
                      {data.url}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (isTab && onActivateTab) {
                      onActivateTab(data.id);
                    } else {
                      onOpenUrl(data.url);
                    }
                  }}
                  title={isTab ? 'Ir a esta pestaña en Chrome' : 'Abrir enlace'}
                  className="p-1.5 rounded text-content-muted hover:text-brand-primary hover:bg-surface-card transition-colors flex-shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
