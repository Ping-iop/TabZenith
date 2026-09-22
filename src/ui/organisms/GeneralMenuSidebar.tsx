import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Star,
  Pin,
  History,
  Inbox,
  RotateCcw,
  BookOpen,
  Sparkles,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useI18n } from '@/core/i18n/I18nContext';

export type DashboardViewType =
  | 'command_center'
  | 'groups_tabs'
  | 'favorites'
  | 'pinned'
  | 'sessions'
  | 'inbox'
  | 'closed_tabs';

interface GeneralMenuSidebarProps {
  readonly activeView: DashboardViewType;
  readonly onViewChange: (view: DashboardViewType) => void;
  readonly onOpenDocs: () => void;
  readonly isChromeEnv: boolean;
  readonly isLayaConnected: boolean | null;
  readonly counts: {
    readonly groups: number;
    readonly favorites: number;
    readonly pinned: number;
    readonly sessions: number;
    readonly inbox: number;
    readonly closedTabs: number;
  };
  readonly isOpenMobile?: boolean;
  readonly onCloseMobile?: () => void;
}

export const GeneralMenuSidebar: React.FC<GeneralMenuSidebarProps> = ({
  activeView,
  onViewChange,
  onOpenDocs,
  isChromeEnv,
  isLayaConnected,
  counts,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { t } = useI18n();

  const navItems: Array<{
    id: DashboardViewType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badgeColor?: string;
  }> = [
    {
      id: 'command_center',
      label: t('nav.commandCenter'),
      icon: LayoutDashboard,
    },
    {
      id: 'groups_tabs',
      label: t('nav.groupsTabs'),
      icon: Layers,
      count: counts.groups,
    },
    {
      id: 'favorites',
      label: t('nav.favorites'),
      icon: Star,
      count: counts.favorites,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'pinned',
      label: t('nav.pinned'),
      icon: Pin,
      count: counts.pinned,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'sessions',
      label: t('nav.sessions'),
      icon: History,
      count: counts.sessions,
    },
    {
      id: 'inbox',
      label: t('nav.inbox'),
      icon: Inbox,
      count: counts.inbox,
    },
    {
      id: 'closed_tabs',
      label: t('nav.closedTabs'),
      icon: RotateCcw,
      count: counts.closedTabs,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
  ];

  return (
    <>
      {/* Backdrop para móviles */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 right-0 z-40 h-screen w-72 bg-surface-card border-l border-surface-border flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile
            ? 'translate-x-0'
            : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Encabezado Superior del Menú */}
        <div className="p-5 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-brand-primary to-blue-600 text-white shadow-md flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-content-primary">
                  {t('header.title')}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-subtle text-brand-primary border border-brand-border">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-content-muted">Gestor Ejecutivo de Pestañas</p>
            </div>
          </div>

          {/* Indicadores de Entorno y Laya Core */}
          <div className="mt-4 pt-3 border-t border-surface-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-content-muted">Navegador</span>
              <span className="flex items-center gap-1.5 font-medium">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isChromeEnv ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="text-content-secondary">
                  {isChromeEnv ? t('header.env.chrome') : t('header.env.mock')}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-content-muted flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-brand-primary" />
                <span>Laya Core</span>
              </span>
              <span className="text-[11px] font-medium text-content-secondary">
                {isLayaConnected === null
                  ? t('header.laya.connecting')
                  : isLayaConnected
                  ? t('header.laya.connected')
                  : t('header.laya.heuristic')}
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Navegación */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-content-muted uppercase tracking-wider">
            Vistas y Módulos
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-brand-primary text-content-primary shadow-sm font-semibold'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface-subtle'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-content-primary' : 'text-content-muted'}`} />
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white border-transparent'
                        : item.badgeColor || 'bg-surface-subtle text-content-muted border-surface-border'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer del Menú: Botón de Documentación y Versión */}
        <div className="p-4 border-t border-surface-border bg-surface-subtle/30 space-y-2.5">
          <button
            onClick={() => {
              onOpenDocs();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-subtle hover:bg-surface-elevated text-brand-primary border border-brand-primary/30 text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>{t('nav.documentation')}</span>
          </button>

          <div className="text-center text-[11px] text-content-muted">
            TabZenith v1.0.5 • CPU First AI
          </div>
        </div>
      </aside>
    </>
  );
};
