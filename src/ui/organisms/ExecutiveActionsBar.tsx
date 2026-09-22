import React from 'react';
import {
  Snowflake,
  CopySlash,
  Sparkles,
  Layers,
  Globe,
  BookmarkPlus,
} from 'lucide-react';
import { Button } from '../atoms/Button';
import { cn } from '../utils/cn';

interface ExecutiveActionsBarProps {
  onClassify: () => void;
  onGroupByTopic: () => void;
  onGroupByDomain: () => void;
  onFreezeInactive: () => void;
  onDeduplicate: () => void;
  onStashSession: () => void;
  isClassifying?: boolean;
  isGrouping?: boolean;
  className?: string;
}

export const ExecutiveActionsBar: React.FC<ExecutiveActionsBarProps> = ({
  onClassify,
  onGroupByTopic,
  onGroupByDomain,
  onFreezeInactive,
  onDeduplicate,
  onStashSession,
  isClassifying = false,
  isGrouping = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 flex-wrap p-3 rounded-xl bg-surface-card border border-surface-border shadow-card',
        className
      )}
    >
      <span className="text-xs font-semibold text-content-secondary uppercase tracking-wider mr-1">
        Acciones:
      </span>

      {/* Botón: Clasificar con IA / Laya */}
      <Button
        size="sm"
        variant="primary"
        leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-300" />}
        onClick={onClassify}
        isLoading={isClassifying}
        title="Clasifica semánticamente todas las pestañas abiertas usando Laya Core en CPU"
      >
        Clasificar (Laya)
      </Button>

      <div className="h-4 w-px bg-surface-border mx-1" />

      {/* Opciones Paralelas de Agrupación */}
      <span className="text-xs font-semibold text-content-muted">Agrupar:</span>

      {/* Opción 1: Agrupar por Tema / Tipo */}
      <Button
        size="sm"
        variant="secondary"
        leftIcon={<Layers className="w-3.5 h-3.5 text-purple-400" />}
        onClick={onGroupByTopic}
        isLoading={isGrouping}
        className="hover:border-purple-500/50"
        title="Agrupa las pestañas por Tema o Categoría Semántica (Código, Investigación, Multimedia, etc.)"
      >
        Por Tema / Tipo
      </Button>

      {/* Opción 2: Agrupar por Dominio */}
      <Button
        size="sm"
        variant="secondary"
        leftIcon={<Globe className="w-3.5 h-3.5 text-emerald-400" />}
        onClick={onGroupByDomain}
        isLoading={isGrouping}
        className="hover:border-emerald-500/50"
        title="Agrupa las pestañas según su dominio web de origen (github.com, youtube.com, etc.)"
      >
        Por Dominio
      </Button>

      <div className="h-4 w-px bg-surface-border mx-1" />

      {/* Botón: Congelar Inactivas (RAM) */}
      <Button
        size="sm"
        variant="secondary"
        leftIcon={<Snowflake className="w-3.5 h-3.5 text-cyan-400" />}
        onClick={onFreezeInactive}
        title="Suspende pestañas inactivas para liberar RAM (respeta fijadas)"
      >
        Congelar Inactivas
      </Button>

      {/* Botón: Deduplicar */}
      <Button
        size="sm"
        variant="secondary"
        leftIcon={<CopySlash className="w-3.5 h-3.5 text-amber-400" />}
        onClick={onDeduplicate}
        title="Detecta URLs repetidas y cierra copias duplicadas"
      >
        Deduplicar
      </Button>

      {/* Botón: Guardar Todo (Stash) */}
      <div className="ml-auto">
        <Button
          size="sm"
          variant="outline"
          leftIcon={<BookmarkPlus className="w-3.5 h-3.5 text-emerald-400" />}
          onClick={onStashSession}
          className="border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-300 font-semibold"
          title="Guarda todas las pestañas en un snapshot histórico organizado"
        >
          Guardar Todo (Stash)
        </Button>
      </div>
    </div>
  );
};
