import { defineConfig } from 'wxt';

export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    name: 'Redline',
    description: 'Figma-style live editor — select an element, edit it, copy the diff to Claude Code.',
    version: '0.0.1',
    permissions: ['clipboardWrite', 'storage', 'activeTab'],
    host_permissions: ['http://localhost/*', 'https://localhost/*', 'http://127.0.0.1/*'],
    action: {
      default_title: 'Toggle Redline (Alt+Shift+D)',
    },
    commands: {
      '_execute_action': {
        suggested_key: { default: 'Alt+Shift+D', mac: 'Alt+Shift+D' },
        description: 'Toggle Redline panel',
      },
    },
  },
  srcDir: 'src',
  imports: false,
});
