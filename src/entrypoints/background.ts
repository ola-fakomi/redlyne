/**
 * Background service worker.
 * Handles toolbar icon click → sends TOGGLE message to the active tab's
 * content script.
 */

import { defineBackground } from 'wxt/sandbox';

export default defineBackground(() => {
  // Toolbar icon click
  browser.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;
    try {
      await browser.tabs.sendMessage(tab.id, { type: 'TOGGLE' });
    } catch {
      // Content script not injected yet — ignore
    }
  });
});
