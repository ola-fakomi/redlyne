/**
 * Content script entry point.
 *
 * Mounts the Redline panel into a Shadow DOM overlay using WXT's
 * createShadowRootUi. The panel CSS is injected as a string so Tailwind
 * utilities are scoped to the shadow root and cannot affect or be
 * affected by the host page.
 */

import { defineContentScript } from 'wxt/sandbox';
import { createShadowRootUi } from 'wxt/client';
import { createRoot } from 'react-dom/client';
import React from 'react';
import { Panel } from '@/panel/Panel';
import panelStyles from './style.css?inline';

export default defineContentScript({
  matches: ['<all_urls>'],
  // We handle CSS injection manually into the shadow root
  cssInjectionMode: 'manual',

  async main(ctx) {
    // Listen for the toolbar icon click (sent from background)
    browser.runtime.onMessage.addListener((msg: unknown) => {
      if (typeof msg === 'object' && msg !== null && (msg as any).type === 'TOGGLE') {
        togglePanel();
      }
    });

    let mounted = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ui: any = null;

    async function mountPanel() {
      ui = await createShadowRootUi(ctx, {
        name: 'redline-panel',
        position: 'overlay',
        zIndex: 2147483647,
        onMount(container, shadow, shadowHost) {
          // Inject Tailwind + panel CSS into the shadow root
          const styleEl = document.createElement('style');
          styleEl.textContent = panelStyles;
          shadow.prepend(styleEl);

          // Add base class so our CSS rules apply
          container.className = 'redline-root';
          container.style.cssText = 'pointer-events:none;';

          const root = createRoot(container);
          root.render(
            <React.StrictMode>
              <Panel shadowHost={shadowHost} />
            </React.StrictMode>,
          );
          return root;
        },
        onRemove(root) {
          root?.unmount();
        },
      });
      ui.mount();
      mounted = true;
    }

    function togglePanel() {
      if (mounted && ui) {
        ui.remove();
        ui = null;
        mounted = false;
      } else {
        mountPanel();
      }
    }

    // Auto-mount so panel is available immediately on extension load
    await mountPanel();
  },
});
