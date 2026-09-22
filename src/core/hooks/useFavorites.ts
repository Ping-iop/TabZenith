import { useState, useEffect, useCallback } from 'react';
import { InspirationFolder, FavoriteEntry } from '../domain/favorites.types';

const STORAGE_KEY = 'tabzenith_favorites';
const FOLDERS_STORAGE_KEY = 'tabzenith_inspiration_folders';
const ENTRIES_STORAGE_KEY = 'tabzenith_favorite_entries';

const DEFAULT_FOLDERS: InspirationFolder[] = [
  { id: 'fld_design', name: 'UI & Diseño', color: 'purple', createdAt: Date.now() - 3600000 },
  { id: 'fld_ai', name: 'Investigación & IA', color: 'cyan', createdAt: Date.now() - 7200000 },
  { id: 'fld_dev', name: 'Herramientas Dev', color: 'blue', createdAt: Date.now() - 10800000 },
];

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [entries, setEntries] = useState<Map<string, FavoriteEntry>>(new Map());
  const [folders, setFolders] = useState<readonly InspirationFolder[]>([]);
  const [loading, setLoading] = useState(true);

  // Carga inicial reactiva
  const loadFavorites = useCallback(async () => {
    try {
      let rawUrls: string[] = [];
      let rawFolders: InspirationFolder[] = [];
      let rawEntries: FavoriteEntry[] = [];

      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const res = await chrome.storage.local.get([
          STORAGE_KEY,
          FOLDERS_STORAGE_KEY,
          ENTRIES_STORAGE_KEY,
        ]);
        rawUrls = (res[STORAGE_KEY] as string[]) || [];
        rawFolders = (res[FOLDERS_STORAGE_KEY] as InspirationFolder[]) || [];
        rawEntries = (res[ENTRIES_STORAGE_KEY] as FavoriteEntry[]) || [];
      } else {
        const rawU = localStorage.getItem(STORAGE_KEY);
        const rawF = localStorage.getItem(FOLDERS_STORAGE_KEY);
        const rawE = localStorage.getItem(ENTRIES_STORAGE_KEY);
        rawUrls = rawU ? JSON.parse(rawU) : [];
        rawFolders = rawF ? JSON.parse(rawF) : [];
        rawEntries = rawE ? JSON.parse(rawE) : [];
      }

      // Si no hay carpetas iniciales, sembrar las carpetas por defecto
      if (rawFolders.length === 0) {
        rawFolders = DEFAULT_FOLDERS;
      }
      setFolders(rawFolders);

      // Mapear entradas existentes
      const entriesMap = new Map<string, FavoriteEntry>();
      rawEntries.forEach((e) => entriesMap.set(e.url, e));

      // Migrar URLs que no tenían entrada detallada
      rawUrls.forEach((url) => {
        if (!entriesMap.has(url)) {
          entriesMap.set(url, {
            url,
            folderId: undefined,
            createdAt: Date.now(),
          });
        }
      });

      setEntries(entriesMap);
      setFavorites(new Set(rawUrls));
    } catch (err) {
      console.warn('[TabZenith] Error cargando favoritos e inspiración:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();

    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
        if (areaName === 'local' && (changes[STORAGE_KEY] || changes[FOLDERS_STORAGE_KEY] || changes[ENTRIES_STORAGE_KEY])) {
          loadFavorites();
        }
      };
      chrome.storage.onChanged.addListener(listener);
      return () => {
        chrome.storage.onChanged.removeListener(listener);
      };
    }
  }, [loadFavorites]);

  const persistState = async (
    nextUrls: string[],
    nextFolders: readonly InspirationFolder[],
    nextEntries: readonly FavoriteEntry[]
  ) => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      try {
        await chrome.storage.local.set({
          [STORAGE_KEY]: nextUrls,
          [FOLDERS_STORAGE_KEY]: nextFolders,
          [ENTRIES_STORAGE_KEY]: nextEntries,
        });
      } catch (err) {
        console.warn('[TabZenith] Error guardando favoritos en chrome.storage:', err);
      }
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUrls));
        localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(nextFolders));
        localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(nextEntries));
      } catch {
        // Ignorar
      }
    }
  };

  const toggleFavorite = useCallback(
    async (url: string, title?: string, folderId?: string) => {
      if (!url) return;
      const nextFavs = new Set(favorites);
      const nextEntriesMap = new Map(entries);

      if (nextFavs.has(url)) {
        nextFavs.delete(url);
        nextEntriesMap.delete(url);
      } else {
        nextFavs.add(url);
        nextEntriesMap.set(url, {
          url,
          title,
          folderId,
          createdAt: Date.now(),
        });
      }

      setFavorites(nextFavs);
      setEntries(nextEntriesMap);
      await persistState(
        Array.from(nextFavs),
        folders,
        Array.from(nextEntriesMap.values())
      );
    },
    [favorites, entries, folders]
  );

  const isFavorite = useCallback(
    (url: string) => {
      return favorites.has(url);
    },
    [favorites]
  );

  const setTabFolder = useCallback(
    async (url: string, folderId?: string) => {
      const entry = entries.get(url);
      if (!entry) return;

      const updatedEntry: FavoriteEntry = {
        ...entry,
        folderId: folderId === 'all' || folderId === 'none' ? undefined : folderId,
      };
      const nextEntriesMap = new Map(entries);
      nextEntriesMap.set(url, updatedEntry);

      setEntries(nextEntriesMap);
      await persistState(
        Array.from(favorites),
        folders,
        Array.from(nextEntriesMap.values())
      );
    },
    [entries, favorites, folders]
  );

  const createFolder = useCallback(
    async (name: string, color = 'purple') => {
      const cleanName = name.trim();
      if (!cleanName) return;

      const newFolder: InspirationFolder = {
        id: `fld_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: cleanName,
        color,
        createdAt: Date.now(),
      };

      const nextFolders = [...folders, newFolder];
      setFolders(nextFolders);
      await persistState(
        Array.from(favorites),
        nextFolders,
        Array.from(entries.values())
      );
      return newFolder;
    },
    [folders, favorites, entries]
  );

  const deleteFolder = useCallback(
    async (folderId: string) => {
      const nextFolders = folders.filter((f) => f.id !== folderId);
      // Desasignar pestañas que estaban en esa carpeta
      const nextEntriesMap = new Map<string, FavoriteEntry>();
      entries.forEach((entry, url) => {
        if (entry.folderId === folderId) {
          nextEntriesMap.set(url, { ...entry, folderId: undefined });
        } else {
          nextEntriesMap.set(url, entry);
        }
      });

      setFolders(nextFolders);
      setEntries(nextEntriesMap);
      await persistState(
        Array.from(favorites),
        nextFolders,
        Array.from(nextEntriesMap.values())
      );
    },
    [folders, entries, favorites]
  );

  const renameFolder = useCallback(
    async (folderId: string, name: string, color?: string) => {
      const cleanName = name.trim();
      if (!cleanName) return;

      const nextFolders = folders.map((f) => {
        if (f.id !== folderId) return f;
        return {
          ...f,
          name: cleanName,
          color: color || f.color,
        };
      });

      setFolders(nextFolders);
      await persistState(
        Array.from(favorites),
        nextFolders,
        Array.from(entries.values())
      );
    },
    [folders, favorites, entries]
  );

  return {
    favorites,
    favoriteCount: favorites.size,
    entries,
    folders,
    loading,
    toggleFavorite,
    isFavorite,
    setTabFolder,
    createFolder,
    deleteFolder,
    renameFolder,
    refresh: loadFavorites,
  };
}
