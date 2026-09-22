import React from 'react';
import { Snowflake, CopySlash, Sparkles, BookmarkPlus } from 'lucide-react';
import { Button } from '../atoms/Button';
import { cn } from '../utils/cn';

interface ExecutiveActionsBarProps {
  onFreezeInactive: () => void;
  onDeduplicate: () => void;
  onAutoClassify: () => void;
  onStashSession: () => void;
  isClassifying?: boolean;
  className?: string;
}

export const ExecutiveActionsBar: React.FC<ExecutiveActionsBarProps> = ({
  onFreezeInactive,
  onDeduplicate,
  onAutoClassify,
  onStashSession,
  isClassifying = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 flex-wrap p-3 rounded-xl bg-surface-card border border-surface-border shadow-card',
        className
      )}
    >
      <span className="text-xs font-semibold text-content-secondary uppercase tracking-wider mr-2">
        Acciones Ejecutivas:
      </span>

      <Button
        size="sm"
        variant="secondary"
        leftIcon={<Snowflake className="w-3.5 h-3.5 text-cyan-400" />}
        onClick={onFreezeInactive}
        title="Pone en suspensión pestañas inactivas para recuperar hasta el 95% de la RAM"
      >
        Congelar Inactivas (RAM)
      </Button>

      <Button
        size="sm"
        variant="secondary"
        leftIcon={<CopySlash className="w-3.5 h-3.5 text-amber-400" />}
        onClick={onDeduplicate}
        title="Detecta URLs repetidas y cierra copias duplicadas"
      >
        Deduplicar Todo
      </Button>

      <Button
        size="sm"
        variant="primary"
        leftIcon={<Sparkles className="w-3.5 h-3.5" />}
        onClick={onAutoClassify}
        isLoading={isClassifying}
        title="Usa Laya Core en CPU para clasificar y agrupar semánticamente todas las pestañas abiertas"
      >
        Auto-Clasificar con Laya
      </Button>

      <div className="ml-auto">
        <Button
          size="sm"
          variant="outline"
          leftIcon={<BookmarkPlus className="w-3.5 h-3.5 text-emerald-400" />}
          onClick={onStashSession}
          className="border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-300"
          title="Guarda todas las pestañas en un snapshot histórico"
        >
          Guardar Todo (Stash)
        </Button>
      </div>
    </div>
  );
};
