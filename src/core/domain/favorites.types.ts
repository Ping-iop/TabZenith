export interface InspirationFolder {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly createdAt: number;
}

export interface FavoriteEntry {
  readonly url: string;
  readonly title?: string;
  readonly folderId?: string;
  readonly createdAt: number;
}

export const INSPIRATION_FOLDER_COLORS = [
  { id: 'purple', label: 'Púrpura', border: 'border-purple-500/40', bg: 'bg-purple-500/15', text: 'text-purple-400', dot: 'bg-purple-400' },
  { id: 'blue', label: 'Azul', border: 'border-blue-500/40', bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
  { id: 'cyan', label: 'Cian', border: 'border-cyan-500/40', bg: 'bg-cyan-500/15', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  { id: 'emerald', label: 'Esmeralda', border: 'border-emerald-500/40', bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  { id: 'amber', label: 'Ámbar', border: 'border-amber-500/40', bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
  { id: 'rose', label: 'Rosa', border: 'border-rose-500/40', bg: 'bg-rose-500/15', text: 'text-rose-400', dot: 'bg-rose-400' },
  { id: 'indigo', label: 'Índigo', border: 'border-indigo-500/40', bg: 'bg-indigo-500/15', text: 'text-indigo-400', dot: 'bg-indigo-400' },
] as const;
