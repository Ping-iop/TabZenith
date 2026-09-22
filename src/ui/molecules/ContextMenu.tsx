import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreVertical,
  FolderPlus,
  ArrowRightLeft,
  Snowflake,
  Copy,
  Trash2,
  FolderMinus,
  Check,
  ExternalLink,
} from 'lucide-react';
import { TabGroup } from '@/core/domain/group.types';
import { GROUP_COLOR_CLASSES } from '../tokens/colors.tokens';
import { cn } from '../utils/cn';

export interface ContextMenuProps {
  tabId: string;
  tabUrl: string;
  currentGroupId?: string;
  availableGroups: readonly TabGroup[];
  onActivate?: () => void;
  onMoveToGroup: (groupId: string) => void;
  onCreateNewGroup: () => void;
  onUngroup: () => void;
  onSuspend: () => void;
  onClose: () => void;
  isDiscarded?: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  tabUrl,
  currentGroupId,
  availableGroups,
  onActivate,
  onMoveToGroup,
  onCreateNewGroup,
  onUngroup,
  onSuspend,
  onClose,
  isDiscarded = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGroupsSubmenu, setShowGroupsSubmenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; right: number }>({ right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const calculateCoords = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedHeight = 290;
    if (spaceBelow < estimatedHeight && rect.top > estimatedHeight) {
      setCoords({
        bottom: window.innerHeight - rect.top + 4,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    } else {
      setCoords({
        top: rect.bottom + 4,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }
  };

  const toggleMenu = () => {
    if (!isOpen) {
      calculateCoords();
    }
    setIsOpen((prev) => !prev);
    setShowGroupsSubmenu(false);
  };

  useEffect(() => {
    const handleEvents = (e: Event) => {
      if (e.type === 'mousedown') {
        const mouseEvent = e as MouseEvent;
        if (
          menuRef.current &&
          !menuRef.current.contains(mouseEvent.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(mouseEvent.target as Node)
        ) {
          setIsOpen(false);
          setShowGroupsSubmenu(false);
        }
      } else if (e.type === 'scroll' || e.type === 'resize') {
        if (isOpen) {
          calculateCoords();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleEvents);
      window.addEventListener('scroll', handleEvents, true);
      window.addEventListener('resize', handleEvents);
    }
    return () => {
      document.removeEventListener('mousedown', handleEvents);
      window.removeEventListener('scroll', handleEvents, true);
      window.removeEventListener('resize', handleEvents);
    };
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tabUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 800);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        aria-label="Acciones de pestaña"
        className="p-1 rounded text-content-muted hover:text-content-primary hover:bg-surface-elevated transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              right: `${coords.right}px`,
              zIndex: 99999,
            }}
            className="w-56 rounded-lg bg-surface-card border border-surface-border shadow-2xl py-1 text-xs text-content-primary animate-in fade-in zoom-in-95 select-none"
          >
            {/* Ir a la pestaña en Chrome */}
            {onActivate && (
              <>
                <button
                  onClick={() => {
                    onActivate();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-brand-primary/10 text-brand-primary font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ir a la pestaña en Chrome</span>
                </button>
                <div className="my-1 border-t border-surface-border" />
              </>
            )}

            {/* Mover a grupo existente */}
            <div className="relative">
              <button
                onClick={() => setShowGroupsSubmenu(!showGroupsSubmenu)}
                className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-surface-elevated hover:text-brand-primary transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Mover a grupo</span>
                </span>
                <span className="text-[10px] text-content-muted">◀</span>
              </button>

              {showGroupsSubmenu && (
                <div className="absolute right-full top-0 mr-1.5 w-48 rounded-lg bg-surface-card border border-surface-border shadow-2xl py-1 z-50">
                  {availableGroups.length === 0 ? (
                    <div className="px-3 py-2 text-content-muted text-[11px]">
                      No hay grupos creados
                    </div>
                  ) : (
                    availableGroups.map((grp) => {
                      const isCurrent = grp.id === currentGroupId;
                      const colorStyle = GROUP_COLOR_CLASSES[grp.color];
                      return (
                        <button
                          key={grp.id}
                          disabled={isCurrent}
                          onClick={() => {
                            onMoveToGroup(grp.id);
                            setIsOpen(false);
                          }}
                          className={cn(
                            'w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-surface-elevated transition-colors truncate',
                            isCurrent ? 'opacity-40 cursor-default' : ''
                          )}
                        >
                        <span className="flex items-center gap-2 truncate">
                          <span
                            className={cn('w-2 h-2 rounded-full flex-shrink-0', colorStyle.dot)}
                          />
                          <span className="truncate">{grp.title}</span>
                        </span>
                        {isCurrent && <Check className="w-3 h-3 text-brand-primary flex-shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Crear nuevo grupo con esta pestaña */}
          <button
            onClick={() => {
              onCreateNewGroup();
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-surface-elevated hover:text-brand-primary transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-brand-primary" />
            <span>Crear nuevo grupo aquí</span>
          </button>

          {/* Quitar del grupo */}
          {currentGroupId && (
            <button
              onClick={() => {
                onUngroup();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-surface-elevated text-content-secondary hover:text-content-primary transition-colors"
            >
              <FolderMinus className="w-3.5 h-3.5" />
              <span>Extraer de este grupo</span>
            </button>
          )}

          <div className="my-1 border-t border-surface-border" />

          {/* Suspender pestaña para liberar RAM */}
          <button
            onClick={() => {
              onSuspend();
              setIsOpen(false);
            }}
            disabled={isDiscarded}
            className={cn(
              'w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-surface-elevated transition-colors',
              isDiscarded
                ? 'text-content-muted cursor-not-allowed'
                : 'text-cyan-400 hover:text-cyan-300'
            )}
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span>{isDiscarded ? 'Ya suspendida (RAM liberada)' : 'Suspender (Liberar RAM)'}</span>
          </button>

          {/* Copiar URL */}
          <button
            onClick={handleCopy}
            className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-surface-elevated text-content-secondary hover:text-content-primary transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-status-success" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? '¡Copiado!' : 'Copiar URL'}</span>
          </button>

          <div className="my-1 border-t border-surface-border" />

          {/* Cerrar pestaña */}
          <button
            onClick={() => {
              onClose();
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-status-danger/20 text-status-danger transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Cerrar pestaña</span>
          </button>
        </div>
      )}
    </div>
  );
};
