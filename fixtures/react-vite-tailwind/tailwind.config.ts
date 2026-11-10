import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        panel: {
          bg:               'var(--panel-bg)',
          outer:            'var(--panel-outer-bg)',
          border:           'var(--panel-border)',
          'text-primary':   'var(--panel-text-primary)',
          'text-secondary': 'var(--panel-text-secondary)',
          'text-label':     'var(--panel-text-label)',
          blue:             'var(--panel-accent)',
          'header-bg':      'var(--panel-header-bg)',
          'input-bg':       'var(--panel-input-bg)',
          'section-bg':     'var(--panel-section-bg)',
          'row-hover':      'var(--panel-row-hover)',
          'changed-dot':    'var(--panel-accent)',
          'changed-bg':     'var(--panel-changed-bg)',
          'revert-hover':   'var(--panel-revert-hover)',
          overlay:          'var(--panel-accent-overlay)',
          'overlay-stroke': 'var(--panel-accent)',
        },
      },
      fontSize: {
        'panel-xs':   ['10px', { lineHeight: '14px' }],
        'panel-sm':   ['11px', { lineHeight: '15px' }],
        'panel-base': ['12px', { lineHeight: '16px' }],
        'panel-lg':   ['13px', { lineHeight: '17px' }],
      },
      spacing: {
        'row':    '26px',
        'row-sm': '22px',
      },
      boxShadow: {
        'panel': '0 4px 24px 0 rgba(0,0,0,0.12), 0 1px 4px 0 rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'panel': '8px',
      },
      fontFamily: {
        'panel': ['"Geist"', '-apple-system', 'BlinkMacSystemFont', '"Inter"', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
