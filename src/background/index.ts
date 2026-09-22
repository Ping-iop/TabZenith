/**
 * Service Worker de fondo para Chrome Extension Manifest V3
 * Gestiona menús contextuales del navegador y atajos globales.
 */

chrome.runtime.onInstalled.addListener(() => {
  // Crear menú contextual nativo en páginas y enlaces
  chrome.contextMenus.create({
    id: 'tabflow_save_link_to_inbox',
    title: '📥 Guardar en TabFlow (Curaduría)',
    contexts: ['page', 'link'],
  });

  chrome.contextMenus.create({
    id: 'tabflow_open_dashboard',
    title: '📊 Abrir Dashboard Gerencial TabFlow',
    contexts: ['action'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'tabflow_save_link_to_inbox') {
    const targetUrl = info.linkUrl || info.pageUrl || tab?.url;
    if (targetUrl) {
      // Guardar temporalmente en storage local para que el inbox lo absorba
      const result = await chrome.storage.local.get(['pending_inbox_links']);
      const currentPending: string[] = (result.pending_inbox_links as string[]) || [];
      currentPending.push(targetUrl);
      await chrome.storage.local.set({ pending_inbox_links: currentPending });

      // Indicar badge visual
      chrome.action.setBadgeText({ text: '+' });
      chrome.action.setBadgeBackgroundColor({ color: '#3b82f6' });
      setTimeout(() => {
        chrome.action.setBadgeText({ text: '' });
      }, 2000);
    }
  } else if (info.menuItemId === 'tabflow_open_dashboard') {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
  }
});
