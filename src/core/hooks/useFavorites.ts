import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tabzenith_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Carga inicial reactiva
  const loadFavorites = useCallback(async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const res = await chrome.storage.local.get([STORAGE_KEY]);
        const list: string[] = (res[STORAGE_KEY] as string[]) || [];
        setFavorites(new Set(list));
      } else {
        const raw = localStorage.getItem(STORAGE_KEY);
        const list: string[] = raw ? JSON.parse(raw) : [];
        setFavorites(new Set(list));
      }
    } catch (err) {
      console.warn('[TabZenith] Error cargando favoritos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();

    // Sincronización entre ventanas si es extensión Chrome
    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
        if (areaName === 'local' && changes[STORAGE_KEY]) {
          const nextList = (changes[STORAGE_KEY].newValue as string[]) || [];
          setFavorites(new Set(nextList));
        }
      };
      chrome.storage.onChanged.addListener(listener);
      return () => {
        chrome.storage.onChanged.removeListener(listener);
      };
    }
  }, [loadFavorites]);

  const persistFavorites = async (nextSet: Set<string>) => {
    const list = Array.from(nextSet);
    setFavorites(nextSet);

    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      try {
        await chrome.storage.local.set({ [STORAGE_KEY]: list });
      } catch (err) {
        console.warn('[TabZenith] Error guardando favoritos en chrome.storage:', err);
      }
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch {
        // Ignorar límites
      }
    }
  };

  const toggleFavorite = useCallback(
    async (url: string) => {
      if (!url) return;
      const next = new Set(favorites);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      await persistFavorites(next);
    },
    [favorites]
  );

  const isFavorite = useCallback(
    (url: string) => {
      return favorites.has(url);
    },
    [favorites]
  );

  return {
    favorites,
    favoriteCount: favorites.size,
    loading,
    toggleFavorite,
    isFavorite,
    refresh: loadFavorites,
  };
}
