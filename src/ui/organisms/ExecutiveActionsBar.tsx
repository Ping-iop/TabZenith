import React from 'react';
import {
  Snowflake,
  CopySlash,
  Sparkles,
  Layers,
  Globe,
  BookmarkPlus,
} from 'lucide-react';
import { useI18n } from '@/core/i18n/I18nContext';
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
  const { t } = useI18n();

  return (
    <div
      className={cn(
        'flex items-center gap-2 flex-wrap p-3 rounded-xl bg-surface-card border border-surface-border shadow-card',
        className
      )}
    >
      {/* Botón: Clasificar con IA / Laya */}
      <Button
        size="sm"
        variant="primary"
        leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-300" />}
        onClick={onClassify}
        isLoading={isClassifying}
        title="Laya Core CPU"
      >
        {t('action.classifyLaya')}
      </Button>

      <div className="h-4 w-px bg-surface-border mx-1" />

      {/* Opción 1: Agrupar por Tema / Tipo */}
      <Button
        size="sm"
        variant="secondary"
        leftIcon={<Layers className="w-3.5 h-3.5 text-purple-400" />}
        onClick={onGroupByTopic}
        isLoading={isGrouping}
        className="hover:border-purple-500/50"
      >
        {t('action.groupByTopic')}
      </Button>

      {/* Opción 2: Agrupar por Dominio */}
      <Button
        size="sm"
        variant="secondary"
        leftIcon={<Globe className="w-3.5 h-3.5 text-emerald-400" />}
        onClick={onGroupByDomain}
        isLoading={isGrouping}
        className="hover:border-emerald-500/50"
      >
        {t('action.groupByDomain')}
      </Button>

      <div className="h-4 w-px bg-surface-border mx-1" />

      {/* Botón: Congelar Inactivas (RAM) */}
      <Button
        size="sm"
        variant="secondary"
        leftIcon={<Snowflake className="w-3.5 h-3.5 text-cyan-400" />}
        onClick={onFreezeInactive}
      >
        {t('action.freezeInactive')}
      </Button>

      {/* Botón: Deduplicar */}
      <Button
        size="sm"
        variant="secondary"
        leftIcon={<CopySlash className="w-3.5 h-3.5 text-amber-400" />}
        onClick={onDeduplicate}
      >
        {t('action.deduplicate')}
      </Button>

      {/* Botón: Guardar Todo (Stash) */}
      <div className="ml-auto">
        <Button
          size="sm"
          variant="outline"
          leftIcon={<BookmarkPlus className="w-3.5 h-3.5 text-emerald-400" />}
          onClick={onStashSession}
          className="border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-300 font-semibold"
        >
          {t('action.saveAllStash')}
        </Button>
      </div>
    </div>
  );
};

