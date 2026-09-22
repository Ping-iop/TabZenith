import { ITabClassifierPort } from '../ports/tab-classifier.port';
import { ClassificationResult, MarpDomainTaxonomy } from '../domain/classifier.types';
import { ChromeGroupColor } from '@/ui/tokens/colors.tokens';

// Mapeo taxonómico semántico oficial de MARP
const MARP_TAXONOMY: Record<MarpDomainTaxonomy, string[]> = {
  code: ['github', 'gitlab', 'stackoverflow', 'python', 'javascript', 'typescript', 'react', 'api', 'docker', 'git', 'bug', 'code', 'dev', 'npm', 'rust', 'golang', 'frontend', 'backend'],
  research: ['arxiv', 'paper', 'citation', 'benchmark', 'study', 'pdf', 'journal', 'science', 'nature', 'thesis', 'research', 'article', 'sciencedirect', 'scholar'],
  web: ['css', 'html', 'ui', 'ux', 'tailwind', 'landing', 'website', 'design', 'dribbble', 'figma', 'canva', 'responsive'],
  media: ['youtube', 'vimeo', 'twitch', 'spotify', 'netflix', 'video', 'podcast', 'stream', 'audio', 'music', 'sound', 'clip'],
  data: ['chart', 'graph', 'dataset', 'csv', 'sql', 'statistics', 'table', 'dashboard', 'analytics', 'database', 'postgres', 'mongo', 'excel'],
  finance: ['bank', 'crypto', 'bitcoin', 'finance', 'invest', 'stock', 'trading', 'finanzas', 'bolsa', 'portfolio', 'dinero'],
  system: ['config', 'install', 'deploy', 'linux', 'bash', 'powershell', 'cron', 'monitor', 'cpu', 'memory', 'server', 'aws', 'cloud', 'azure'],
  creative: ['art', 'illustration', 'draw', 'blender', '3d', 'render', 'animation', 'storyboard', 'photo', 'typography'],
  memory: ['notes', 'notion', 'obsidian', 'knowledge', 'wiki', 'graph', 'docs', 'readme', 'apuntes'],
  gaming: ['game', 'steam', 'rpg', 'fps', 'play', 'gaming', 'quest', 'discord', 'twitch', 'ign'],
  general: [],
};

const DOMAIN_COLOR_MAP: Record<MarpDomainTaxonomy, ChromeGroupColor> = {
  code: 'blue',
  research: 'indigo',
  web: 'teal',
  media: 'rose',
  data: 'cyan',
  finance: 'amber',
  system: 'slate',
  creative: 'violet',
  memory: 'purple',
  gaming: 'emerald',
  general: 'grey',
};

const DOMAIN_TITLE_MAP: Record<MarpDomainTaxonomy, string> = {
  code: 'Desarrollo & Código',
  research: 'Investigación & Papers',
  web: 'Diseño Web & UI',
  media: 'Multimedia & Streaming',
  data: 'Datos & Analítica',
  finance: 'Finanzas & Economía',
  system: 'Sistemas & Cloud',
  creative: 'Arte & Creatividad',
  memory: 'Notas & Conocimiento',
  gaming: 'Gaming & Comunidad',
  general: 'Pestañas Guardadas',
};

export class LayaMarpClassifierAdapter implements ITabClassifierPort {
  readonly engineName = 'Laya Core / MARP (CPU)';
  private readonly baseUrl: string;

  constructor(baseUrl = 'http://127.0.0.1:8092') {
    this.baseUrl = baseUrl;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }

  async classifyTab(title: string, url: string): Promise<ClassificationResult> {
    const textToAnalyze = `${title} ${url}`.toLowerCase();

    // 1. Intento de clasificación directa en memoria usando la taxonomía de MARP
    const scores: Partial<Record<MarpDomainTaxonomy, number>> = {};
    for (const [domain, keywords] of Object.entries(MARP_TAXONOMY) as [MarpDomainTaxonomy, string[]][]) {
      let count = 0;
      for (const kw of keywords) {
        if (textToAnalyze.includes(kw)) {
          count += 1;
        }
      }
      if (count > 0) {
        scores[domain] = count;
      }
    }

    const sortedEntries = (Object.entries(scores) as [MarpDomainTaxonomy, number][]).sort(
      (a, b) => b[1] - a[1]
    );

    if (sortedEntries.length > 0) {
      const topDomain = sortedEntries[0][0];
      const maxScore = sortedEntries[0][1];
      const confidence = Math.min(1.0, maxScore * 0.35);

      return {
        primaryDomain: topDomain,
        confidence,
        suggestedGroupName: DOMAIN_TITLE_MAP[topDomain] || 'General',
        suggestedColor: DOMAIN_COLOR_MAP[topDomain] || 'grey',
        topDomains: sortedEntries,
      };
    }

    // Fallback: Dominio del host
    let fallbackDomain: MarpDomainTaxonomy = 'general';
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      if (host.includes('github') || host.includes('dev') || host.includes('stackoverflow')) {
        fallbackDomain = 'code';
      } else if (host.includes('youtube') || host.includes('twitch')) {
        fallbackDomain = 'media';
      } else if (host.includes('arxiv') || host.includes('wikipedia') || host.includes('medium')) {
        fallbackDomain = 'research';
      }
    } catch {
      // url inválida
    }

    return {
      primaryDomain: fallbackDomain,
      confidence: 0.5,
      suggestedGroupName: DOMAIN_TITLE_MAP[fallbackDomain] || 'General',
      suggestedColor: DOMAIN_COLOR_MAP[fallbackDomain] || 'grey',
      topDomains: [[fallbackDomain, 0.5]],
    };
  }

  async classifyBatch(
    items: readonly { title: string; url: string }[]
  ): Promise<readonly ClassificationResult[]> {
    return Promise.all(items.map((item) => this.classifyTab(item.title, item.url)));
  }
}
