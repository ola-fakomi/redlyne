import { defineConfig } from 'wxt';

export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    name: 'Redlyne',
    description: 'Figma-style live editor — select an element, edit it, copy the diff to Claude Code.',
    version: '0.0.3',
    // Note: the `key` field is intentionally omitted here — CWS rejects uploads containing it.
    // For local developer installs with a stable ID, add the key back manually or use a separate config.
    permissions: ['clipboardWrite', 'storage', 'activeTab'],
    host_permissions: ['<all_urls>'],
    icons: {
      '16':  'icon-16.png',
      '32':  'icon-32.png',
      '48':  'icon-48.png',
      '128': 'icon-128.png',
    },
    action: {
      default_title: 'Toggle Redlyne (Alt+Shift+D)',
      default_icon: {
        '16':  'icon-16.png',
        '32':  'icon-32.png',
        '48':  'icon-48.png',
        '128': 'icon-128.png',
      },
    },
    commands: {
      '_execute_action': {
        suggested_key: { default: 'Alt+Shift+D', mac: 'Alt+Shift+D' },
        description: 'Toggle Redlyne panel',
      },
    },
  },
  srcDir: 'src',
  outDir: 'output',
  imports: false,
});
