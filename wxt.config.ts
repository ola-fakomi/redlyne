import { defineConfig } from 'wxt';

export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    name: 'Redlyne',
    description: 'Figma-style live editor — select an element, edit it, copy the diff to Claude Code.',
    version: '0.0.2',
    // Stable key keeps the extension ID fixed across installs and updates.
    // Generated from an RSA-2048 keypair; only the public key is stored here.
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArp+XNPh515WFv2VDDRGPWy862FttPwKgFxorpH6N+DB9CdgjZTAuQ+UbCNUf8jvPZm58rmzEz3XIfjZ4Xy96qvNsCfTa3r88tNB19McQ83ellyAS4lGX8Wuz8FCtikmODhh08PNxN4Ru1LItTYtFyyo0dLqDC3ulxJOqwX2AYbo9fcs4yMpQaANqangYvBMQeXILKZG4P5g/gow6fZYSWgrGPsuWMjRp6b8CY+CgoBe5m0bMCR+nixYbTIPn3mEow7PNkJzM14yhD+DJU62miPxlJFq8XmlFiMbf0BAzAe4/BmheBiiPSGxAtv11Nt5yDRwg3AC8Wda8O/YpSOnluwIDAQAB',
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
  imports: false,
});
