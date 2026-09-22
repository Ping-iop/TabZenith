import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  Snowflake,
  BookmarkPlus,
  PlusCircle,
  Cpu,
  Layers,
} from 'lucide-react';
import { useTabs } from '@/core/hooks/useTabs';
import { useSessions } from '@/core/hooks/useSessions';
import { useInbox } from '@/core/hooks/useInbox';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { Card } from '@/ui/atoms/Card';

export const PopupApp: React.FC = () => {
  const { tabs, suspendTabs } = useTabs();
  const { stashCurrentSession } = useSessions();
  const { addLinksFromText } = useInbox();

  const [quickLink, setQuickLink] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const openDashboard = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    } else {
      window.open('/dashboard.html', '_blank');
    }
  };

  const handleStash = async (closeAfter: boolean) => {
    try {
      await stashCurrentSession(undefined, closeAfter);
      setFeedback(closeAfter ? '¡Pestañas guardadas y cerradas!' : '¡Sesión guardada en stash!');
      setTimeout(() => setFeedback(null), 2500);
    } catch (err) {
      setFeedback('Error al guardar sesión.');
    }
  };

  const handleFreeze = async () => {
    const inactive = tabs.filter((t) => !t.active && !t.pinned && !t.discarded);
    if (inactive.length === 0) {
      setFeedback('No hay inactivas para congelar.');
      return;
    }
    await suspendTabs(inactive.map((t) => t.id));
    setFeedback(`¡${inactive.length} pestañas congeladas! RAM liberada.`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleAddQuickLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLink.trim()) return;
    try {
      await addLinksFromText(quickLink);
      setQuickLink('');
      setFeedback('¡Enlace añadido a Curaduría!');
      setTimeout(() => setFeedback(null), 2500);
    } catch {
      setFeedback('URL no válida.');
    }
  };

  const discardedCount = tabs.filter((t) => t.discarded).length;
  const ramMb = tabs.length * 150;

  return (
    <div className="w-[360px] p-4 bg-surface-base text-content-primary space-y-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-primary text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-content-primary leading-none">TabZenith</h1>
            <span className="text-[10px] text-content-muted">Gestor Rápido MV3</span>
          </div>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<ExternalLink className="w-3 h-3" />}
          onClick={openDashboard}
          className="text-xs py-1 px-2.5"
        >
          Dashboard
        </Button>
      </div>

      {/* Tarjeta de Resumen Rápido */}
      <Card className="p-3 bg-surface-card space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-content-secondary flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Pestañas abiertas:</span>
          </span>
          <span className="font-bold text-content-primary">{tabs.length}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-content-secondary flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>RAM estimada:</span>
          </span>
          <span className="font-bold text-cyan-400">~{ramMb} MB ({discardedCount} pausadas)</span>
        </div>
      </Card>

      {/* Botones de Acción Inmediata */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<BookmarkPlus className="w-3.5 h-3.5 text-emerald-400" />}
          onClick={() => handleStash(false)}
          className="text-xs"
        >
          Stash (Guardar)
        </Button>

        <Button
          size="sm"
          variant="secondary"
          leftIcon={<Snowflake className="w-3.5 h-3.5 text-cyan-400" />}
          onClick={handleFreeze}
          className="text-xs"
        >
          Liberar RAM
        </Button>
      </div>

      <Button
        size="sm"
        variant="danger"
        onClick={() => handleStash(true)}
        className="w-full text-xs"
      >
        Guardar Todo y Cerrar Ventana
      </Button>

      {/* Pegado Rápido a Inbox */}
      <form onSubmit={handleAddQuickLink} className="pt-2 border-t border-surface-border space-y-1.5">
        <label className="text-[11px] font-semibold text-content-secondary uppercase tracking-wider block">
          Guardar Enlace para Después
        </label>
        <div className="flex items-center gap-1.5">
          <Input
            value={quickLink}
            onChange={(e) => setQuickLink(e.target.value)}
            placeholder="Pegar URL aquí..."
            className="text-xs py-1"
          />
          <Button type="submit" size="sm" variant="primary" className="py-1 px-2">
            <PlusCircle className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {/* Feedback Toast */}
      {feedback && (
        <div className="p-2 rounded bg-surface-elevated border border-brand-primary text-center text-xs text-brand-primary font-medium animate-in fade-in">
          {feedback}
        </div>
      )}
    </div>
  );
};
