import { describe, it, expect } from 'vitest';
import { LayaMarpClassifierAdapter } from '../adapters/laya-marp-classifier.adapter';

describe('LayaMarpClassifierAdapter', () => {
  const adapter = new LayaMarpClassifierAdapter();

  it('debe clasificar pestañas de desarrollo en el dominio code con color azul', async () => {
    const result = await adapter.classifyTab(
      'GitHub - facebook/react: The library for web and native user interfaces',
      'https://github.com/facebook/react'
    );

    expect(result.primaryDomain).toBe('code');
    expect(result.suggestedColor).toBe('blue');
    expect(result.suggestedGroupName).toContain('Código');
  });

  it('debe clasificar artículos científicos en research con color índigo', async () => {
    const result = await adapter.classifyTab(
      'Attention Is All You Need - arXiv paper benchmark study',
      'https://arxiv.org/abs/1706.03762'
    );

    expect(result.primaryDomain).toBe('research');
    expect(result.suggestedColor).toBe('indigo');
    expect(result.suggestedGroupName).toContain('Investigación');
  });

  it('debe clasificar videos de YouTube en media con color rosa intenso (rose)', async () => {
    const result = await adapter.classifyTab(
      'YouTube - LLaMA 3 Architecture Deep Dive Video',
      'https://youtube.com/watch?v=sample'
    );

    expect(result.primaryDomain).toBe('media');
    expect(result.suggestedColor).toBe('rose');
  });
});
