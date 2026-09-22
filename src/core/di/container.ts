import { IBrowserTabsPort } from '../ports/browser-tabs.port';
import { ITabStoragePort } from '../ports/tab-storage.port';
import { ITabClassifierPort } from '../ports/tab-classifier.port';
import { ISearchEnginePort } from '../ports/search-engine.port';

import { ChromeBrowserTabsAdapter } from '../adapters/chrome-browser-tabs.adapter';
import { MockBrowserTabsAdapter } from '../adapters/mock-browser-tabs.adapter';
import { DexieStorageAdapter } from '../adapters/dexie-storage.adapter';
import { LayaMarpClassifierAdapter } from '../adapters/laya-marp-classifier.adapter';
import { FuseSearchAdapter } from '../adapters/fuse-search.adapter';

import { TabGroupService } from '../services/tab-group.service';

export interface AppContainer {
  readonly browserTabs: IBrowserTabsPort;
  readonly storage: ITabStoragePort;
  readonly classifier: ITabClassifierPort;
  readonly searchEngine: ISearchEnginePort;
  readonly tabGroupService: TabGroupService;
}

function createContainer(): AppContainer {
  const isChromeExtension =
    typeof chrome !== 'undefined' && Boolean(chrome.tabs?.query);

  const browserTabs: IBrowserTabsPort = isChromeExtension
    ? new ChromeBrowserTabsAdapter()
    : new MockBrowserTabsAdapter();

  const storage: ITabStoragePort = new DexieStorageAdapter();
  const classifier: ITabClassifierPort = new LayaMarpClassifierAdapter();
  const searchEngine: ISearchEnginePort = new FuseSearchAdapter();

  const tabGroupService = new TabGroupService(browserTabs, storage, classifier);

  return {
    browserTabs,
    storage,
    classifier,
    searchEngine,
    tabGroupService,
  };
}

export const container = createContainer();
