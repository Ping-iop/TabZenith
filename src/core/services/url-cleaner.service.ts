export interface CleanedUrlResult {
  readonly url: string;
  readonly domain: string;
  readonly title: string;
}

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'msclkid',
  'mc_eid',
  'ref',
  'ref_src',
  'igshid',
  'si',
]);

export class UrlCleanerService {
  /**
   * Extrae todas las URLs válidas desde un bloque de texto arbitrario
   * y las devuelve desinfectadas de parámetros de seguimiento y deduplicadas.
   */
  static extractAndSanitizeUrls(rawText: string): readonly CleanedUrlResult[] {
    if (!rawText || !rawText.trim()) {
      return [];
    }

    // Expresión regular para capturar URLs http/https
    const urlRegex = /(https?:\/\/[^\s<>"'{}|\\^`]+)/gi;
    const matches = rawText.match(urlRegex) || [];

    const seenUrls = new Set<string>();
    const results: CleanedUrlResult[] = [];

    for (const rawUrl of matches) {
      const sanitized = this.cleanUrl(rawUrl);
      if (!sanitized) continue;

      if (!seenUrls.has(sanitized.url)) {
        seenUrls.add(sanitized.url);
        results.push(sanitized);
      }
    }

    return results;
  }

  /**
   * Limpia una URL individual removiendo parámetros de rastreo y hashes residuales.
   */
  static cleanUrl(urlStr: string): CleanedUrlResult | null {
    try {
      // Limpiar posibles signos de puntuación finales comunes
      const trimmed = urlStr.replace(/[),.;]+$/, '');
      const parsed = new URL(trimmed);

      // Remover parámetros de tracking
      const paramsToDelete: string[] = [];
      parsed.searchParams.forEach((_, key) => {
        if (TRACKING_PARAMS.has(key.toLowerCase()) || key.startsWith('utm_')) {
          paramsToDelete.push(key);
        }
      });
      paramsToDelete.forEach((key) => parsed.searchParams.delete(key));

      const cleanUrl = parsed.toString();
      const domain = parsed.hostname.replace(/^www\./, '');

      // Generar un título legible derivado de la URL
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      let title = domain;
      if (pathParts.length > 0) {
        const lastPart = decodeURIComponent(pathParts[pathParts.length - 1])
          .replace(/[-_]/g, ' ')
          .replace(/\.(html?|php|aspx?)$/i, '');
        if (lastPart.length > 2) {
          title = `${lastPart.charAt(0).toUpperCase() + lastPart.slice(1)} | ${domain}`;
        }
      }

      return {
        url: cleanUrl,
        domain,
        title,
      };
    } catch {
      return null;
    }
  }
}
