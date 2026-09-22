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
});
