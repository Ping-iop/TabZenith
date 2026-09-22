/**
 * Paleta expandida a 16 colores semánticos para clasificar pestañas y grupos en TabZenith.
 * Mapea directamente a clases Tailwind y adapta con seguridad a la API de Chrome.
 */
export type ChromeGroupColor =
  | 'blue'
  | 'cyan'
  | 'teal'
  | 'emerald'
  | 'green'
  | 'yellow'
  | 'amber'
  | 'orange'
  | 'red'
  | 'rose'
  | 'pink'
  | 'purple'
  | 'indigo'
  | 'violet'
  | 'slate'
  | 'grey';

export const CHROME_GROUP_COLORS: readonly ChromeGroupColor[] = [
  'blue',
  'cyan',
  'teal',
  'emerald',
  'green',
  'yellow',
  'amber',
  'orange',
  'red',
  'rose',
  'pink',
  'purple',
  'indigo',
  'violet',
  'slate',
  'grey',
] as const;

export const GROUP_COLOR_CLASSES: Record<
  ChromeGroupColor,
  {
    badge: string;
    dot: string;
    border: string;
    bgLight: string;
    hex: string;
  }
> = {
  blue: {
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    dot: 'bg-blue-500',
    border: 'border-blue-500',
    bgLight: 'bg-blue-500/10',
    hex: '#3b82f6',
  },
  cyan: {
    badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    dot: 'bg-cyan-500',
    border: 'border-cyan-500',
    bgLight: 'bg-cyan-500/10',
    hex: '#06b6d4',
  },
  teal: {
    badge: 'bg-teal-500/20 text-teal-400 border-teal-500/40',
    dot: 'bg-teal-500',
    border: 'border-teal-500',
    bgLight: 'bg-teal-500/10',
    hex: '#14b8a6',
  },
  emerald: {
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    dot: 'bg-emerald-500',
    border: 'border-emerald-500',
    bgLight: 'bg-emerald-500/10',
    hex: '#10b981',
  },
  green: {
    badge: 'bg-green-500/20 text-green-400 border-green-500/40',
    dot: 'bg-green-500',
    border: 'border-green-500',
    bgLight: 'bg-green-500/10',
    hex: '#22c55e',
  },
  yellow: {
    badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    dot: 'bg-yellow-500',
    border: 'border-yellow-500',
    bgLight: 'bg-yellow-500/10',
    hex: '#eab308',
  },
  amber: {
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    dot: 'bg-amber-500',
    border: 'border-amber-500',
    bgLight: 'bg-amber-500/10',
    hex: '#f59e0b',
  },
  orange: {
    badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    dot: 'bg-orange-500',
    border: 'border-orange-500',
    bgLight: 'bg-orange-500/10',
    hex: '#f97316',
  },
  red: {
    badge: 'bg-red-500/20 text-red-400 border-red-500/40',
    dot: 'bg-red-500',
    border: 'border-red-500',
    bgLight: 'bg-red-500/10',
    hex: '#ef4444',
  },
  rose: {
    badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    dot: 'bg-rose-500',
    border: 'border-rose-500',
    bgLight: 'bg-rose-500/10',
    hex: '#f43f5e',
  },
  pink: {
    badge: 'bg-pink-500/20 text-pink-400 border-pink-500/40',
    dot: 'bg-pink-500',
    border: 'border-pink-500',
    bgLight: 'bg-pink-500/10',
    hex: '#ec4899',
  },
  purple: {
    badge: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    dot: 'bg-purple-500',
    border: 'border-purple-500',
    bgLight: 'bg-purple-500/10',
    hex: '#a855f7',
  },
  indigo: {
    badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    dot: 'bg-indigo-500',
    border: 'border-indigo-500',
    bgLight: 'bg-indigo-500/10',
    hex: '#6366f1',
  },
  violet: {
    badge: 'bg-violet-500/20 text-violet-400 border-violet-500/40',
    dot: 'bg-violet-500',
    border: 'border-violet-500',
    bgLight: 'bg-violet-500/10',
    hex: '#8b5cf6',
  },
  slate: {
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    dot: 'bg-slate-500',
    border: 'border-slate-500',
    bgLight: 'bg-slate-500/10',
    hex: '#64748b',
  },
  grey: {
    badge: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40',
    dot: 'bg-zinc-500',
    border: 'border-zinc-500',
    bgLight: 'bg-zinc-500/10',
    hex: '#71717a',
  },
};

/**
 * Traduce con seguridad los 16 colores semánticos a los 9 colores admitidos
 * por la API nativa de Chrome TabGroups.
 */
export function toNativeChromeTabGroupColor(color: ChromeGroupColor): `${chrome.tabGroups.Color}` {
  switch (color) {
    case 'blue':
    case 'indigo':
      return 'blue';
    case 'cyan':
    case 'teal':
      return 'cyan';
    case 'green':
    case 'emerald':
      return 'green';
    case 'yellow':
    case 'amber':
      return 'yellow';
    case 'orange':
      return 'orange';
    case 'red':
    case 'rose':
      return 'red';
    case 'pink':
      return 'pink';
    case 'purple':
    case 'violet':
      return 'purple';
    case 'grey':
    case 'slate':
    default:
      return 'grey';
  }
}
