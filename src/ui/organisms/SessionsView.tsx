import React from 'react';
import { History, RotateCcw, Trash2, Calendar, Layers } from 'lucide-react';
import { SessionSnapshot } from '@/core/domain/session.types';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { EmptyState } from '../atoms/EmptyState';

interface SessionsViewProps {
  sessions: readonly SessionSnapshot[];
  onRestore: (session: SessionSnapshot) => void;
  onDelete: (sessionId: string) => void;
}

export const SessionsView: React.FC<SessionsViewProps> = ({
  sessions,
  onRestore,
  onDelete,
}) => {
  const formatDate = (epoch: number) => {
    return new Date(epoch).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={<History className="w-8 h-8" />}
        title="No hay sesiones guardadas"
        description="Usa el botón 'Guardar Todo (Stash)' en el panel superior para archivar tus pestañas actuales y liberar memoria."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-content-secondary uppercase tracking-wider">
          Sesiones Archivadas en Historial ({sessions.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sessions.map((session) => (
          <Card key={session.id} className="p-4 bg-surface-card hover:border-brand-primary/40 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-content-primary text-sm mb-1">
                  {session.name}
                </h4>
                <div className="flex items-center gap-3 text-xs text-content-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(session.createdAt)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>{session.tabCount} pestañas</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={() => onRestore(session)}
                  title="Restaurar todas las pestañas y grupos en Chrome"
                >
                  Restaurar
                </Button>
                <button
                  onClick={() => onDelete(session.id)}
                  title="Eliminar sesión del historial"
                  className="p-1.5 rounded text-content-muted hover:text-status-danger hover:bg-status-danger-subtle transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Resumen de pestañas contenidas */}
            <div className="mt-3 pt-2.5 border-t border-surface-border/50 text-xs text-content-secondary space-y-1">
              {session.tabs.slice(0, 3).map((tab) => (
                <div key={tab.id} className="truncate text-content-muted">
                  • {tab.title}
                </div>
              ))}
              {session.tabs.length > 3 && (
                <div className="text-[11px] text-brand-primary font-medium">
                  + {session.tabs.length - 3} pestañas más...
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
