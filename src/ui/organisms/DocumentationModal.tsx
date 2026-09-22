import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Copy,
  Sparkles,
  Snowflake,
  History,
  Inbox,
  RotateCcw,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { useI18n } from '@/core/i18n/I18nContext';

interface DocumentationModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useI18n();
  const [activeTopic, setActiveTopic] = useState<
    | 'deduplicate'
    | 'ram_saver'
    | 'laya_core'
    | 'domain_group'
    | 'sessions'
    | 'inbox'
    | 'undo'
  >('deduplicate');

  if (!isOpen) return null;

  const topics = [
    {
      id: 'deduplicate' as const,
      icon: Copy,
      title: t('docs.topicDeduplicateTitle'),
      badge: 'Optimizado',
      color: 'text-amber-400',
    },
    {
      id: 'undo' as const,
      icon: RotateCcw,
      title: t('docs.topicUndoTitle'),
      badge: 'Nuevo',
      color: 'text-emerald-400',
    },
    {
      id: 'ram_saver' as const,
      icon: Snowflake,
      title: t('docs.topicRamSaverTitle'),
      badge: 'Memoria',
      color: 'text-cyan-400',
    },
    {
      id: 'laya_core' as const,
      icon: Sparkles,
      title: t('docs.topicLayaTitle'),
      badge: 'IA en CPU',
      color: 'text-brand-primary',
    },
    {
      id: 'domain_group' as const,
      icon: Globe,
      title: t('docs.topicDomainTitle'),
      badge: 'Organización',
      color: 'text-indigo-400',
    },
    {
      id: 'sessions' as const,
      icon: History,
      title: t('docs.topicSessionsTitle'),
      badge: 'Seguridad Dual',
      color: 'text-purple-400',
    },
    {
      id: 'inbox' as const,
      icon: Inbox,
      title: t('docs.topicInboxTitle'),
      badge: 'Curaduría',
      color: 'text-rose-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-subtle/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-content-primary">
                {t('docs.modalTitle')}
              </h2>
              <p className="text-xs text-content-muted">
                {t('docs.modalSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Sidebar + Content) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Navegación lateral de temas */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-surface-border p-3 space-y-1 overflow-y-auto bg-surface-base/50 shrink-0">
            {topics.map((topic) => {
              const Icon = topic.icon;
              const isActive = activeTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopic(topic.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-brand-primary text-content-primary shadow-sm'
                      : 'text-content-secondary hover:text-content-primary hover:bg-surface-subtle'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-content-primary' : topic.color}`} />
                    <span className="truncate">{topic.title}</span>
                  </div>
                  <span
                    className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold shrink-0 ml-1 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-surface-subtle text-content-muted border border-surface-border'
                    }`}
                  >
                    {topic.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Panel de Contenido */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {activeTopic === 'deduplicate' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                    <Copy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-content-primary">
                      {t('docs.dedupTitle')}
                    </h3>
                    <p className="text-xs text-content-muted">
                      {t('docs.dedupSubtitle')}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border text-xs text-content-secondary space-y-2.5 leading-relaxed">
                  <p>
                    <strong className="text-content-primary">Preservación Inteligente de Contenido:</strong> A diferencia de las deduplicaciones genéricas que solo miran el dominio o eliminan toda la URL, TabZenith analiza la estructura semántica de la URL.
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-1 text-content-muted">
                    <li>
                      <span className="text-content-primary font-medium">Parámetros de contenido protegidos:</span> Si tienes dos pestañas de YouTube (<code className="text-brand-primary">?v=ABC</code> y <code className="text-brand-primary">?v=XYZ</code>), o dos búsquedas de Google (<code className="text-brand-primary">?q=React</code> y <code className="text-brand-primary">?q=TabZenith</code>), se reconocen como páginas totalmente distintas y <strong>nunca se cerrarán</strong>.
                    </li>
                    <li>
                      <span className="text-content-primary font-medium">Limpieza de telemetría:</span> Se eliminan únicamente códigos de rastreo publicitario (<code className="text-amber-400">utm_source</code>, <code className="text-amber-400">fbclid</code>, <code className="text-amber-400">gclid</code>, etc.) para detectar si abriste la misma página desde dos enlaces publicitarios diferentes.
                    </li>
                    <li>
                      <span className="text-content-primary font-medium">Pestañas fijadas y activas:</span> Las pestañas ancladas o la pestaña que estás viendo en este instante jamás son cerradas como duplicadas.
                    </li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>
                    Todas las pestañas cerradas van directamente a la sección <strong>Pestañas Cerradas</strong> donde puedes pulsar <strong>Deshacer (Undo)</strong> para recuperarlas instantáneamente.
                  </span>
                </div>
              </div>
            )}

            {activeTopic === 'undo' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-content-primary">
                      {t('docs.undoTitle')}
                    </h3>
                    <p className="text-xs text-content-muted">
                      {t('docs.undoSubtitle')}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border text-xs text-content-secondary space-y-2.5 leading-relaxed">
                  <p>
                    <strong className="text-content-primary">Malla de Seguridad para Cierres:</strong> Cualquier pestaña cerrada mediante deduplicación o cierre administrativo es registrada automáticamente en la memoria persistente del sistema.
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-1 text-content-muted">
                    <li>
                      <span className="text-content-primary font-medium">Botón Undo individual:</span> Cada entrada dispone de un botón <em>Reabrir</em> para recuperar esa URL exacta en segundo plano sin alterar tu pestaña actual.
                    </li>
                    <li>
                      <span className="text-content-primary font-medium">Reabrir todas:</span> Restaura todo el lote deduplicado en caso de que desees revisar manualmente.
                    </li>
                    <li>
                      <span className="text-content-primary font-medium">Persistencia dual:</span> Los registros se mantienen incluso si cierras y vuelves a abrir el navegador.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTopic === 'ram_saver' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Snowflake className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-content-primary">
                      {t('docs.ramTitle')}
                    </h3>
                    <p className="text-xs text-content-muted">
                      {t('docs.ramSubtitle')}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border text-xs text-content-secondary space-y-2.5 leading-relaxed">
                  <p>
                    <strong className="text-content-primary">Liberación Instantánea de Memoria:</strong> La función <em>Congelar Pestañas Inactivas</em> aprovecha la API nativa <code className="text-cyan-400">chrome.tabs.discard</code> para liberar la memoria RAM consumida por pestañas de fondo sin cerrarlas.
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-1 text-content-muted">
                    <li>
                      <span className="text-content-primary font-medium">Ahorro promedio:</span> Entre 120 MB y 250 MB de memoria RAM recuperada por cada pestaña suspendida.
                    </li>
                    <li>
                      <span className="text-content-primary font-medium">Recuperación automática:</span> Cuando haces clic sobre una pestaña suspendida en Chrome, vuelve a cargar inmediatamente conservando su historial y posición.
                    </li>
                    <li>
                      <span className="text-content-primary font-medium">Protección de audio:</span> Pestañas reproduciendo sonido, videos activos o pestañas ancladas nunca se congelan para no interrumpir tu trabajo.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTopic === 'laya_core' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-content-primary">
                      {t('docs.layaTitle')}
                    </h3>
                    <p className="text-xs text-content-muted">
                      {t('docs.layaSubtitle')}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border text-xs text-content-secondary space-y-2.5 leading-relaxed">
                  <p>
                    <strong className="text-content-primary">Clasificación Semántica Local:</strong> TabZenith integra <em>Laya Core Multilingual</em>, un micro-modelo que corre íntegramente en tu CPU local (puerto 8092) garantizando privacidad absoluta (cero telemetría a servidores externos).
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-1 text-content-muted">
                    <li>
                      <span className="text-content-primary font-medium">Taxonomía Ejecutiva:</span> Agrupa automáticamente tus pestañas en categorías de trabajo como Desarrollo, Finanzas, Multimedia, Comunicación, Educación, etc.
                    </li>
                    <li>
                      <span className="text-content-primary font-medium">Agrupación con color en Chrome:</span> Transforma la clasificación semántica en grupos de pestañas nativos de Google Chrome con etiquetas y colores temáticos.
                    </li>
                    <li>
                      <span className="text-content-primary font-medium">Respaldo Heurístico:</span> Si el servicio local de Laya Core no está activo, el sistema utiliza un motor de análisis léxico y de dominio offline sin interrumpir el funcionamiento.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTopic === 'domain_group' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-content-primary">
                      {t('docs.domainTitle')}
                    </h3>
                    <p className="text-xs text-content-muted">
                      {t('docs.domainSubtitle')}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border text-xs text-content-secondary space-y-2.5 leading-relaxed">
                  <p>
                    <strong className="text-content-primary">Organización Inmediata por Sitio Web:</strong> Agrupa todas las pestañas abiertas que pertenezcan al mismo dominio raíz (ej. todas las de GitHub, todas las de Google Docs, etc.).
                  </p>
                  <p className="text-content-muted">
                    Ideal para limpiar rápidamente una barra de pestañas saturada con múltiples páginas de la misma plataforma antes de consolidarlas o archivarlas.
                  </p>
                </div>
              </div>
            )}

            {activeTopic === 'sessions' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-content-primary">
                      {t('docs.sessionsTitle')}
                    </h3>
                    <p className="text-xs text-content-muted">
                      {t('docs.sessionsSubtitle')}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border text-xs text-content-secondary space-y-2.5 leading-relaxed">
                  <p>
                    <strong className="text-content-primary">Dual-Layer Stash Storage:</strong> Guarda instantáneas completas del estado de tu navegador, preservando tanto la estructura de grupos como las pestañas independientes.
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-1 text-content-muted">
                    <li>
                      <span className="text-content-primary font-medium">Capa 1 (IndexedDB / Dexie):</span> Permite almacenamiento de alto rendimiento para cientos de sesiones y enlaces.
                    </li>
                    <li>
                      <span className="text-content-primary font-medium">Capa 2 (chrome.storage.local):</span> Respaldo secundario para garantizar que tus sesiones sobrevivan limpiezas de caché o actualizaciones de extensión.
                    </li>
                    <li>
                      <span className="text-content-primary font-medium">Restauración modular:</span> Puedes reabrir una sesión completa, o reabrir únicamente un grupo específico dentro de esa sesión.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTopic === 'inbox' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-content-primary">
                      {t('docs.inboxTitle')}
                    </h3>
                    <p className="text-xs text-content-muted">
                      {t('docs.inboxSubtitle')}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border text-xs text-content-secondary space-y-2.5 leading-relaxed">
                  <p>
                    <strong className="text-content-primary">Curaduría Asíncrona de Enlaces:</strong> Guarda links para leer más tarde sin tener que mantener 50 pestañas abiertas en tu ventana.
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-1 text-content-muted">
                    <li>
                      <span className="text-content-primary font-medium">Menú contextual nativo:</span> Haz clic derecho sobre cualquier enlace o página y selecciona <em>📥 Guardar en TabFlow</em>.
                    </li>
                    <li>
                      <span className="text-content-primary font-medium">Extracción de texto:</span> Pega un bloque de texto que contenga múltiples URLs y TabZenith las extraerá, limpiará y añadirá automáticamente.
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-border bg-surface-subtle/30 flex items-center justify-between">
          <span className="text-xs text-content-muted">
            TabZenith v1.0.5 • Lead Systems Architecture
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-brand-primary text-content-primary text-xs font-semibold hover:bg-brand-primary/90 transition-colors cursor-pointer"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
