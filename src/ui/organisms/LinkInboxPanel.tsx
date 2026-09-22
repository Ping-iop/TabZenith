import React, { useState } from 'react';
import {
  Inbox,
  ExternalLink,
  CheckCircle2,
  Trash2,
  Archive,
  ClipboardPaste,
  Sparkles,
} from 'lucide-react';
import { InboxLink, DateRangeFilterState } from '@/core/domain/inbox.types';
import { DateRangeFilter } from '../molecules/DateRangeFilter';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { EmptyState } from '../atoms/EmptyState';
import { cn } from '../utils/cn';

interface LinkInboxPanelProps {
  links: readonly InboxLink[];
  filter: DateRangeFilterState;
  onFilterChange: (filter: DateRangeFilterState) => void;
  onAddLinks: (rawText: string) => Promise<number>;
  onToggleReviewed: (id: string, reviewed: boolean) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenLink: (url: string) => void;
}

export const LinkInboxPanel: React.FC<LinkInboxPanelProps> = ({
  links,
  filter,
  onFilterChange,
  onAddLinks,
  onToggleReviewed,
  onArchive,
  onDelete,
  onOpenLink,
}) => {
  const [pasteText, setPasteText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) return;

    setIsProcessing(true);
    setFeedback(null);
    try {
      const count = await onAddLinks(pasteText);
      setPasteText('');
      setFeedback(`Se extrajeron y limpiaron ${count} enlaces con éxito.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Error al procesar enlaces.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClipboardRead = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setPasteText(clipText);
      }
    } catch {
      // Fallback
    }
  };

  const formatDate = (epoch: number) => {
    const d = new Date(epoch);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingLinks = links.filter((l) => !l.reviewed && !l.archived);
  const reviewedLinks = links.filter((l) => l.reviewed && !l.archived);

  return (
    <div className="space-y-4">
      {/* Caja de Pegado Masivo de Enlaces */}
      <Card className="p-4 bg-surface-card border-surface-border">
        <form onSubmit={handlePasteSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-content-secondary uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardPaste className="w-3.5 h-3.5 text-brand-primary" />
              <span>Pegar Enlaces para Curaduría Diferida</span>
            </label>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleClipboardRead}
              className="text-xs text-brand-primary py-0.5"
            >
              Pegar desde portapapeles
            </Button>
          </div>

          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={3}
            placeholder="Pega texto, notas o una lista de links (ej. https://ejemplo.com). TabFlow detectará automáticamente los enlaces y removerá parámetros de rastreo..."
            className="w-full bg-surface-subtle border border-surface-border rounded-lg p-2.5 text-xs text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono resize-y"
          />

          <div className="flex items-center justify-between">
            {feedback ? (
              <span className="text-xs text-brand-primary font-medium animate-pulse">
                {feedback}
              </span>
            ) : (
              <span className="text-xs text-content-muted">
                Los enlaces se guardan con fecha para que puedas revisarlos después
              </span>
            )}
            <Button
              type="submit"
              size="sm"
              variant="primary"
              isLoading={isProcessing}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Procesar y Guardar
            </Button>
          </div>
        </form>
      </Card>

      {/* Barra de Filtro por Rangos de Fecha */}
      <Card className="p-3 bg-surface-card/70">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <DateRangeFilter filter={filter} onChange={onFilterChange} />
          <span className="text-xs font-medium text-content-secondary">
            {links.length} enlaces ({pendingLinks.length} pendientes / {reviewedLinks.length} revisados)
          </span>
        </div>
      </Card>

      {/* Lista de Enlaces en Curaduría */}
      {links.length === 0 ? (
        <EmptyState
          icon={<Inbox className="w-8 h-8" />}
          title="Bandeja de Curaduría Vacía"
          description="Pega enlaces o textos arriba para acumular lecturas y revisarlas organizadas por fecha."
        />
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-all text-sm',
                link.reviewed
                  ? 'bg-surface-subtle/40 border-surface-border/40 opacity-70'
                  : 'bg-surface-card border-surface-border hover:border-brand-primary/50'
              )}
            >
              <div className="min-w-0 flex-1 mr-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'font-medium truncate block',
                      link.reviewed
                        ? 'line-through text-content-muted'
                        : 'text-content-primary hover:text-brand-primary'
                    )}
                  >
                    {link.title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-content-secondary border border-surface-border flex-shrink-0">
                    {link.domain}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1 text-xs text-content-muted">
                  <span>Añadido: {formatDate(link.addedAt)}</span>
                  {link.reviewed && link.reviewedAt && (
                    <span className="text-emerald-400">
                      Revisado: {formatDate(link.reviewedAt)}
                    </span>
                  )}
                </div>
              </div>

              {/* Acciones de Curaduría (Triage) */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => onOpenLink(link.url)}
                  title="Abrir en pestaña nueva"
                  className="p-1.5 rounded hover:bg-surface-elevated text-content-secondary hover:text-brand-primary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onToggleReviewed(link.id, !link.reviewed)}
                  title={link.reviewed ? 'Marcar como pendiente' : 'Marcar como revisado'}
                  className={cn(
                    'p-1.5 rounded transition-colors',
                    link.reviewed
                      ? 'text-emerald-400 hover:bg-emerald-500/10'
                      : 'text-content-secondary hover:text-emerald-400 hover:bg-surface-elevated'
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onArchive(link.id)}
                  title="Archivar"
                  className="p-1.5 rounded hover:bg-surface-elevated text-content-secondary hover:text-content-primary transition-colors"
                >
                  <Archive className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDelete(link.id)}
                  title="Eliminar de la lista"
                  className="p-1.5 rounded hover:bg-status-danger-subtle text-content-secondary hover:text-status-danger transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
