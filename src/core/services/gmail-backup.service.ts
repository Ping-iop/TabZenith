import { SessionSnapshot } from '../domain/session.types';
import { ClosedTabRecord } from '../domain/closed-tab.types';
import { InboxLink } from '../domain/inbox.types';
import { TabGroup } from '../domain/group.types';
import { TabItem } from '../domain/tab.types';

export interface TabZenithFullBackup {
  readonly version: string;
  readonly timestamp: number;
  readonly accountEmail: string;
  readonly stats: {
    readonly sessionCount: number;
    readonly closedTabCount: number;
    readonly favoriteCount: number;
    readonly inboxCount: number;
    readonly groupCount: number;
    readonly openTabCount: number;
  };
  readonly data: {
    readonly sessions: readonly SessionSnapshot[];
    readonly closedTabs: readonly ClosedTabRecord[];
    readonly favorites: readonly string[];
    readonly inboxLinks: readonly InboxLink[];
    readonly groups: readonly TabGroup[];
    readonly tabs: readonly TabItem[];
  };
}

const GMAIL_ACCOUNT_KEY = 'tabzenith_gmail_account';
const GOOGLE_CLOUD_BACKUP_KEY = 'tabzenith_google_cloud_backup';

export class GmailBackupService {
  /**
   * Detecta la cuenta de Google vinculada en el navegador o recupera la almacenada.
   */
  static async detectGmailAccount(): Promise<string> {
    if (typeof chrome !== 'undefined' && chrome.identity?.getProfileUserInfo) {
      try {
        const userInfo = await new Promise<chrome.identity.UserInfo>((resolve) => {
          chrome.identity.getProfileUserInfo((info) => resolve(info));
        });
        if (userInfo?.email && userInfo.email.trim() !== '') {
          await this.saveGmailAccount(userInfo.email);
          return userInfo.email;
        }
      } catch {
        // Fallback a almacenamiento local
      }
    }

    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      try {
        const res = await chrome.storage.local.get([GMAIL_ACCOUNT_KEY]);
        if (res[GMAIL_ACCOUNT_KEY]) return res[GMAIL_ACCOUNT_KEY];
      } catch {
        // Fallback
      }
    }

    return localStorage.getItem(GMAIL_ACCOUNT_KEY) || '';
  }

  /**
   * Guarda o actualiza la cuenta de Gmail del usuario.
   */
  static async saveGmailAccount(email: string): Promise<void> {
    const cleanEmail = email.trim();
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ [GMAIL_ACCOUNT_KEY]: cleanEmail });
    }
    localStorage.setItem(GMAIL_ACCOUNT_KEY, cleanEmail);
  }

  /**
   * Empaqueta todo el historial en un snapshot integral inmutable.
   */
  static createBackupBundle(params: {
    accountEmail: string;
    sessions: readonly SessionSnapshot[];
    closedTabs: readonly ClosedTabRecord[];
    favorites: Set<string> | readonly string[];
    inboxLinks: readonly InboxLink[];
    groups: readonly TabGroup[];
    tabs: readonly TabItem[];
  }): TabZenithFullBackup {
    const favArray = Array.from(params.favorites);
    return {
      version: '1.0.6',
      timestamp: Date.now(),
      accountEmail: params.accountEmail || 'usuario@gmail.com',
      stats: {
        sessionCount: params.sessions.length,
        closedTabCount: params.closedTabs.length,
        favoriteCount: favArray.length,
        inboxCount: params.inboxLinks.length,
        groupCount: params.groups.length,
        openTabCount: params.tabs.length,
      },
      data: {
        sessions: [...params.sessions],
        closedTabs: [...params.closedTabs],
        favorites: favArray,
        inboxLinks: [...params.inboxLinks],
        groups: [...params.groups],
        tabs: [...params.tabs],
      },
    };
  }

  /**
   * Sincroniza la copia de seguridad con Google Cloud / Chrome Sync.
   */
  static async syncToGoogleCloud(backup: TabZenithFullBackup): Promise<void> {
    const serialized = JSON.stringify(backup);

    // Guardar en chrome.storage.local y sincronizar metadatos en sync
    if (typeof chrome !== 'undefined') {
      if (chrome.storage?.local) {
        await chrome.storage.local.set({ [GOOGLE_CLOUD_BACKUP_KEY]: serialized });
      }
      if (chrome.storage?.sync) {
        try {
          await chrome.storage.sync.set({
            tabzenith_sync_meta: {
              accountEmail: backup.accountEmail,
              timestamp: backup.timestamp,
              stats: backup.stats,
            },
          });
        } catch {
          // Chrome Sync puede limitar tamaño (100KB por item), se preserva en local
        }
      }
    } else {
      localStorage.setItem(GOOGLE_CLOUD_BACKUP_KEY, serialized);
    }
  }

  /**
   * Recupera la última copia de seguridad sincronizada.
   */
  static async getLatestCloudBackup(): Promise<TabZenithFullBackup | null> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const res = await chrome.storage.local.get([GOOGLE_CLOUD_BACKUP_KEY]);
        if (res[GOOGLE_CLOUD_BACKUP_KEY]) {
          return JSON.parse(res[GOOGLE_CLOUD_BACKUP_KEY]);
        }
      }
      const raw = localStorage.getItem(GOOGLE_CLOUD_BACKUP_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      return null;
    }
    return null;
  }

  /**
   * Genera el enlace directo a Gmail Web para enviar la copia de seguridad por correo.
   */
  static generateGmailWebComposeUrl(backup: TabZenithFullBackup): string {
    const dateStr = new Date(backup.timestamp).toLocaleString();
    const subject = `[TabZenith Backup] Respaldo de Historial (${dateStr})`;

    const bodyLines = [
      `Hola,\n`,
      `Este es tu respaldo oficial de pestañas e historial de navegación generado por TabZenith el ${dateStr}.`,
      `Cuenta asociada: ${backup.accountEmail}\n`,
      `=== RESUMEN EJECUTIVO ===`,
      `- Sesiones guardadas: ${backup.stats.sessionCount}`,
      `- Pestañas cerradas (Historial Undo): ${backup.stats.closedTabCount}`,
      `- Enlaces Favoritos: ${backup.stats.favoriteCount}`,
      `- Enlaces en Bandeja Inbox: ${backup.stats.inboxCount}`,
      `- Grupos organizados: ${backup.stats.groupCount}`,
      `- Pestañas abiertas: ${backup.stats.openTabCount}\n`,
      `=== FAVORITOS (${backup.stats.favoriteCount}) ===`,
      ...backup.data.favorites.map((url) => `* ${url}`),
      `\n=== SESIONES GUARDADAS (${backup.stats.sessionCount}) ===`,
      ...backup.data.sessions.map((s) => `* ${s.name} (${s.tabs?.length || s.tabCount || 0} pestañas) - Creada: ${new Date(s.createdAt).toLocaleDateString()}`),
      `\n=== DATOS JSON PARA RESTAURAR ===`,
      `Para restaurar, copia este bloque de código o importa el archivo JSON descargado en TabZenith:\n`,
      JSON.stringify(backup, null, 2),
    ];

    const body = bodyLines.join('\n');
    const targetEmail = backup.accountEmail.includes('@') ? backup.accountEmail : '';

    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  /**
   * Descarga el archivo JSON firmado con la cuenta de Gmail.
   */
  static downloadBackupFile(backup: TabZenithFullBackup): void {
    const cleanEmail = backup.accountEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date(backup.timestamp).toISOString().slice(0, 10);
    const fileName = `tabzenith_backup_${cleanEmail}_${dateStr}.json`;

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}
