import { describe, it, expect } from 'vitest';
import { UrlCleanerService } from '../services/url-cleaner.service';

describe('UrlCleanerService', () => {
  it('debe extraer y limpiar múltiples URLs desde un bloque de texto mixto', () => {
    const rawText = `
      Hola! Revisa este enlace interesante: https://github.com/facebook/react?utm_source=twitter&utm_medium=social
      y también este artículo https://arxiv.org/abs/1706.03762?fbclid=123456
      Repetido: https://github.com/facebook/react?utm_source=newsletter
    `;

    const results = UrlCleanerService.extractAndSanitizeUrls(rawText);

    expect(results).toHaveLength(2); // Debe deduplicar github.com/facebook/react
    expect(results[0].url).toBe('https://github.com/facebook/react');
    expect(results[0].domain).toBe('github.com');
    expect(results[1].url).toBe('https://arxiv.org/abs/1706.03762');
    expect(results[1].domain).toBe('arxiv.org');
  });

  it('debe limpiar parámetros de tracking de YouTube y analytics', () => {
    const dirtyUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&si=trackingToken123&utm_campaign=viral';
    const result = UrlCleanerService.cleanUrl(dirtyUrl);

    expect(result).not.toBeNull();
    expect(result?.url).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result?.domain).toBe('youtube.com');
  });

  it('debe devolver array vacío si no hay URLs válidas', () => {
    const emptyResult = UrlCleanerService.extractAndSanitizeUrls('texto sin enlaces');
    expect(emptyResult).toEqual([]);
  });

  it('debe diferenciar páginas del mismo dominio con contenido diferente (ej. videos de YouTube o búsquedas)', () => {
    const video1 = 'https://www.youtube.com/watch?v=video_A&utm_source=social';
    const video2 = 'https://www.youtube.com/watch?v=video_B&utm_medium=email';

    const canonical1 = UrlCleanerService.canonicalizeForDeduplication(video1);
    const canonical2 = UrlCleanerService.canonicalizeForDeduplication(video2);

    expect(canonical1).not.toBe(canonical2);
    expect(canonical1).toBe('https://www.youtube.com/watch?v=video_A');
    expect(canonical2).toBe('https://www.youtube.com/watch?v=video_B');
  });

  it('debe detectar como duplicadas dos URLs idénticas que solo varían en parámetros de tracking', () => {
    const urlA = 'https://github.com/facebook/react/issues/42?utm_source=twitter';
    const urlB = 'https://github.com/facebook/react/issues/42?fbclid=abcdefg';

    const canonicalA = UrlCleanerService.canonicalizeForDeduplication(urlA);
    const canonicalB = UrlCleanerService.canonicalizeForDeduplication(urlB);

    expect(canonicalA).toBe(canonicalB);
    expect(canonicalA).toBe('https://github.com/facebook/react/issues/42');
  });
});
