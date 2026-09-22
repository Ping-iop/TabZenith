import React, { useState, useEffect } from 'react';
import {
  Mail,
  Cloud,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  Layers,
  History,
  Star,
  Inbox,
  AlertCircle,
  X,
  Send,
} from 'lucide-react';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import {
  GmailBackupService,
  TabZenithFullBackup,
} from '@/core/services/gmail-backup.service';
import { SessionSnapshot } from '@/core/domain/session.types';
import { ClosedTabRecord } from '@/core/domain/closed-tab.types';
import { InboxLink } from '@/core/domain/inbox.types';
import { TabGroup } from '@/core/domain/group.types';
import { TabItem } from '@/core/domain/tab.types';

interface GmailBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: readonly SessionSnapshot[];
  closedTabs: readonly ClosedTabRecord[];
  favorites: Set<string>;
  inboxLinks: readonly InboxLink[];
  groups: readonly TabGroup[];
  tabs: readonly TabItem[];
  onRestoreBackup?: (backup: TabZenithFullBackup) => Promise<void>;
}

export const GmailBackupModal: React.FC<GmailBackupModalProps> = ({
  isOpen,
  onClose,
  sessions,
  closedTabs,
  favorites,
  inboxLinks,
  groups,
  tabs,
  onRestoreBackup,
}) => {
  const [email, setEmail] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (isOpen) {
      GmailBackupService.detectGmailAccount().then((detected) => {
        if (detected) setEmail(detected);
      });
      GmailBackupService.getLatestCloudBackup().then((latest) => {
        if (latest) {
          setLastSyncDate(new Date(latest.timestamp).toLocaleString());
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentBundle = GmailBackupService.createBackupBundle({
    accountEmail: email,
    sessions,
    closedTabs,
    favorites,
    inboxLinks,
    groups,
    tabs,
  });

  const handleSaveEmail = async () => {
    if (!email.includes('@')) {
      setFeedback({ type: 'error', message: 'Por favor ingresa una dirección de Gmail válida.' });
      return;
    }
    setIsSavingEmail(true);
    await GmailBackupService.saveGmailAccount(email);
    setIsSavingEmail(false);
    setFeedback({ type: 'success', message: 'Cuenta de Gmail vinculada correctamente.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSyncCloud = async () => {
    try {
      await GmailBackupService.syncToGoogleCloud(currentBundle);
      const nowStr = new Date().toLocaleString();
      setLastSyncDate(nowStr);
      setFeedback({
        type: 'success',
        message: '¡Historial completo sincronizado con tu cuenta de Google / Chrome Sync!',
      });
    } catch {
      setFeedback({ type: 'error', message: 'No se pudo completar la sincronización en la nube.' });
    }
  };

  const handleSendToGmail = () => {
    const url = GmailBackupService.generateGmailWebComposeUrl(currentBundle);
    window.open(url, '_blank');
    setFeedback({
      type: 'success',
      message: 'Abriendo Gmail Web para enviar tu respaldo por correo...',
    });
  };

  const handleDownload = () => {
    GmailBackupService.downloadBackupFile(currentBundle);
    setFeedback({
      type: 'success',
      message: 'Archivo de respaldo descargado con éxito.',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as TabZenithFullBackup;
        if (!parsed.data || !parsed.timestamp) {
          throw new Error('Formato de archivo inválido');
        }

        if (onRestoreBackup) {
          setIsRestoring(true);
          await onRestoreBackup(parsed);
          setIsRestoring(false);
          setFeedback({
            type: 'success',
            message: `¡Copia de seguridad de ${parsed.accountEmail || 'Gmail'} restaurada con éxito!`,
          });
        }
      } catch (err) {
        setIsRestoring(false);
        setFeedback({
          type: 'error',
          message: 'El archivo seleccionado no es un respaldo válido de TabZenith.',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <Card className="w-full max-w-xl bg-surface-card border-brand-primary/40 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-5">
        {/* Cabecera */}
        <div className="flex items-start justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-md">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-content-primary flex items-center gap-2">
                <span>Respaldo con Cuenta de Gmail</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Google Cloud
                </span>
              </h2>
              <p className="text-xs text-content-muted mt-0.5">
                Guarda, sincroniza y envía tu historial de pestañas y sesiones directamente a tu correo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificación de feedback */}
        {feedback && (
          <div
            className={`p-3 rounded-xl border flex items-center gap-2 text-xs animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Formulario de Cuenta Gmail */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-content-secondary block">
            Tu Cuenta de Google / Gmail
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@gmail.com"
                leftIcon={<Mail className="w-4 h-4 text-brand-primary" />}
                className="text-xs"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveEmail}
              isLoading={isSavingEmail}
              className="text-xs shrink-0"
            >
              Vincular
            </Button>
          </div>
          {lastSyncDate && (
            <p className="text-[11px] text-content-muted flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Última sincronización en la nube: {lastSyncDate}</span>
            </p>
          )}
        </div>

        {/* Resumen del Historial que se Respaldará */}
        <div className="p-3.5 rounded-xl bg-surface-subtle/50 border border-surface-border space-y-2">
          <span className="text-[11px] font-semibold text-content-secondary uppercase tracking-wider block">
            Datos incluidos en este respaldo
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-surface-card border border-surface-border">
              <History className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <span className="font-bold text-content-primary block">{sessions.length}</span>
              <span className="text-[10px] text-content-muted">Sesiones</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-card border border-surface-border">
              <Layers className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="font-bold text-content-primary block">{closedTabs.length}</span>
              <span className="text-[10px] text-content-muted">Cerradas (Undo)</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-card border border-surface-border">
              <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="font-bold text-content-primary block">{favorites.size}</span>
              <span className="text-[10px] text-content-muted">Favoritos</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-card border border-surface-border">
              <Inbox className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <span className="font-bold text-content-primary block">{inboxLinks.length}</span>
              <span className="text-[10px] text-content-muted">Enlaces Inbox</span>
            </div>
          </div>
        </div>

        {/* Acciones de Respaldo */}
        <div className="space-y-2.5">
          <span className="text-xs font-semibold text-content-secondary block">
            Opciones de Guardado
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <Button
              variant="primary"
              leftIcon={<Cloud className="w-4 h-4" />}
              onClick={handleSyncCloud}
              className="text-xs py-2.5"
            >
              Google Cloud Sync
            </Button>
            <Button
              variant="secondary"
              leftIcon={<Send className="w-4 h-4 text-rose-400" />}
              onClick={handleSendToGmail}
              className="text-xs py-2.5"
            >
              Enviar a mi Gmail
            </Button>
            <Button
              variant="outline"
              leftIcon={<Download className="w-4 h-4 text-cyan-400" />}
              onClick={handleDownload}
              className="text-xs py-2.5"
            >
              Descargar JSON
            </Button>
          </div>
        </div>

        {/* Sección de Restauración */}
        <div className="pt-3 border-t border-surface-border flex items-center justify-between flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-elevated text-content-secondary hover:text-content-primary text-xs font-medium border border-surface-border cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-brand-primary" />
            <span>Restaurar desde archivo de respaldo</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isRestoring}
            />
          </label>

          <Button size="sm" variant="ghost" onClick={onClose} className="text-xs">
            Cerrar
          </Button>
        </div>
      </Card>
    </div>
  );
};
