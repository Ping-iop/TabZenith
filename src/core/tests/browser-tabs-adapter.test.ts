import { describe, it, expect } from 'vitest';
import { MockBrowserTabsAdapter } from '../adapters/mock-browser-tabs.adapter';

describe('MockBrowserTabsAdapter - activateTab', () => {
  it('debe activar la pestaña seleccionada y desactivar las demás', async () => {
    const adapter = new MockBrowserTabsAdapter();
    const initialTabs = await adapter.getOpenTabs();

    expect(initialTabs[0].active).toBe(true);
    expect(initialTabs[1].active).toBe(false);

    let notified = false;
    adapter.subscribeToTabChanges(() => {
      notified = true;
    });

    await adapter.activateTab('tab_2');
    const updatedTabs = await adapter.getOpenTabs();

    expect(notified).toBe(true);
    const tab1 = updatedTabs.find((t) => t.id === 'tab_1');
    const tab2 = updatedTabs.find((t) => t.id === 'tab_2');

    expect(tab1?.active).toBe(false);
    expect(tab2?.active).toBe(true);
  });

  it('debe congelar pestañas marcándolas como discarded', async () => {
    const adapter = new MockBrowserTabsAdapter();
    await adapter.discardTabs(['tab_2', 'tab_3']);
    const tabs = await adapter.getOpenTabs();

    expect(tabs.find((t) => t.id === 'tab_2')?.discarded).toBe(true);
    expect(tabs.find((t) => t.id === 'tab_3')?.discarded).toBe(true);
  });
});

describe('ChromeBrowserTabsAdapter - discardTabs resiliencia', () => {
  it('solo debe suspender pestañas vivas, no activas, no fijadas y no previamente suspendidas', async () => {
    const discardedIds: number[] = [];

    // Mock global chrome
    (globalThis as unknown as { chrome: unknown }).chrome = {
      tabs: {
        query: async () => [
          { id: 101, active: true, pinned: false, discarded: false }, // Activa: NO suspender
          { id: 102, active: false, pinned: true, discarded: false }, // Fijada: NO suspender
          { id: 103, active: false, pinned: false, discarded: true }, // Ya suspendida: NO suspender
          { id: 104, active: false, pinned: false, discarded: false }, // Válida: SÍ suspender
          { id: 105, active: false, pinned: false, discarded: false }, // Lanzará error al suspender
        ],
        discard: async (id: number) => {
          if (id === 105) throw new Error('No tab with id: 105');
          discardedIds.push(id);
        },
      },
    };

    const { ChromeBrowserTabsAdapter } = await import('../adapters/chrome-browser-tabs.adapter');
    const adapter = new ChromeBrowserTabsAdapter();

    // Intentamos suspender 101 (activa), 102 (fijada), 103 (descartada), 104 (válida), 105 (error), 999 (inexistente)
    await expect(
      adapter.discardTabs(['101', '102', '103', '104', '105', '999'])
    ).resolves.not.toThrow();

    // Solo 104 debió ser suspendida exitosamente; 105 fue intentada y su error silenciado
    expect(discardedIds).toEqual([104]);
  });
});
