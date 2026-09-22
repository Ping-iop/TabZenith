import React from 'react';
import {
  Code2,
  BookOpen,
  Globe,
  Film,
  Database,
  Coins,
  Cpu,
  Palette,
  BrainCircuit,
  Gamepad2,
  Folder,
} from 'lucide-react';
import { MarpDomainTaxonomy } from '@/core/domain/classifier.types';
import { cn } from '../utils/cn';

interface DomainBadgeProps {
  domain: MarpDomainTaxonomy;
  className?: string;
}

export const DOMAIN_CONFIG: Record<
  MarpDomainTaxonomy,
  { label: string; icon: React.ReactNode; colorClasses: string }
> = {
  code: {
    label: 'Código',
    icon: <Code2 className="w-3 h-3" />,
    colorClasses: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  research: {
    label: 'Investigación',
    icon: <BookOpen className="w-3 h-3" />,
    colorClasses: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  },
  web: {
    label: 'Web & UI',
    icon: <Globe className="w-3 h-3" />,
    colorClasses: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  media: {
    label: 'Multimedia',
    icon: <Film className="w-3 h-3" />,
    colorClasses: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  },
  data: {
    label: 'Datos',
    icon: <Database className="w-3 h-3" />,
    colorClasses: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  },
  finance: {
    label: 'Finanzas',
    icon: <Coins className="w-3 h-3" />,
    colorClasses: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  system: {
    label: 'Sistema',
    icon: <Cpu className="w-3 h-3" />,
    colorClasses: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  },
  creative: {
    label: 'Creatividad',
    icon: <Palette className="w-3 h-3" />,
    colorClasses: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  },
  memory: {
    label: 'Notas & Wiki',
    icon: <BrainCircuit className="w-3 h-3" />,
    colorClasses: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  },
  gaming: {
    label: 'Gaming',
    icon: <Gamepad2 className="w-3 h-3" />,
    colorClasses: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  },
  general: {
    label: 'General',
    icon: <Folder className="w-3 h-3" />,
    colorClasses: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  },
};

export const DomainBadge: React.FC<DomainBadgeProps> = ({ domain, className }) => {
  const config = DOMAIN_CONFIG[domain] || DOMAIN_CONFIG.general;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border truncate',
        config.colorClasses,
        className
      )}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
