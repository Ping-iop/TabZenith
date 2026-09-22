/**
 * Tokens de color para grupos de pestañas oficiales de Chrome.
 * Prohibido usar valores hexadecimales o nombres no tipados.
 */
export type ChromeGroupColor =
  | 'grey'
  | 'blue'
  | 'red'
  | 'yellow'
  | 'green'
  | 'pink'
  | 'purple'
  | 'cyan'
  | 'orange';

export const CHROME_GROUP_COLORS: readonly ChromeGroupColor[] = [
  'blue',
  'cyan',
  'purple',
  'green',
  'yellow',
  'orange',
  'red',
  'pink',
  'grey',
] as const;

export const GROUP_COLOR_CLASSES: Record<ChromeGroupColor, {
  badge: string;
  dot: string;
  border: string;
  bgLight: string;
}> = {
  blue: {
    badge: 'bg-chromegroup-blue/20 text-blue-400 border-chromegroup-blue/40',
    dot: 'bg-chromegroup-blue',
    border: 'border-chromegroup-blue',
    bgLight: 'bg-chromegroup-blue/10',
  },
  cyan: {
    badge: 'bg-chromegroup-cyan/20 text-cyan-400 border-chromegroup-cyan/40',
    dot: 'bg-chromegroup-cyan',
    border: 'border-chromegroup-cyan',
    bgLight: 'bg-chromegroup-cyan/10',
  },
  purple: {
    badge: 'bg-chromegroup-purple/20 text-purple-400 border-chromegroup-purple/40',
    dot: 'bg-chromegroup-purple',
    border: 'border-chromegroup-purple',
    bgLight: 'bg-chromegroup-purple/10',
  },
  green: {
    badge: 'bg-chromegroup-green/20 text-green-400 border-chromegroup-green/40',
    dot: 'bg-chromegroup-green',
    border: 'border-chromegroup-green',
    bgLight: 'bg-chromegroup-green/10',
  },
  yellow: {
    badge: 'bg-chromegroup-yellow/20 text-yellow-400 border-chromegroup-yellow/40',
    dot: 'bg-chromegroup-yellow',
    border: 'border-chromegroup-yellow',
    bgLight: 'bg-chromegroup-yellow/10',
  },
  orange: {
    badge: 'bg-chromegroup-orange/20 text-orange-400 border-chromegroup-orange/40',
    dot: 'bg-chromegroup-orange',
    border: 'border-chromegroup-orange',
    bgLight: 'bg-chromegroup-orange/10',
  },
  red: {
    badge: 'bg-chromegroup-red/20 text-red-400 border-chromegroup-red/40',
    dot: 'bg-chromegroup-red',
    border: 'border-chromegroup-red',
    bgLight: 'bg-chromegroup-red/10',
  },
  pink: {
    badge: 'bg-chromegroup-pink/20 text-pink-400 border-chromegroup-pink/40',
    dot: 'bg-chromegroup-pink',
    border: 'border-chromegroup-pink',
    bgLight: 'bg-chromegroup-pink/10',
  },
  grey: {
    badge: 'bg-chromegroup-grey/20 text-slate-400 border-chromegroup-grey/40',
    dot: 'bg-chromegroup-grey',
    border: 'border-chromegroup-grey',
    bgLight: 'bg-chromegroup-grey/10',
  },
};
