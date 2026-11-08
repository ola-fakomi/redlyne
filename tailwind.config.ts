import type { Config } from 'tailwindcss';

export default {
  content: [
    './entrypoints/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Redline panel design tokens — px-based, host-page agnostic
        panel: {
          bg: '#ffffff',
          border: '#e3e3e3',
          'text-primary': '#111111',
          'text-secondary': '#5e5e5e',
          'text-label': '#8a8a8a',
          blue: '#0d99ff',
          'header-bg': '#f7f7f7',
          'section-bg': '#fafafa',
          'row-hover': '#f3f3f3',
          'changed-dot': '#0d99ff',
          'changed-bg': '#eff6ff',
          'revert-hover': '#fee2e2',
          overlay: 'rgba(13,153,255,0.15)',
          'overlay-stroke': '#0d99ff',
        },
      },
      fontSize: {
        'panel-xs': ['10px', { lineHeight: '14px' }],
        'panel-sm': ['11px', { lineHeight: '15px' }],
        'panel-base': ['12px', { lineHeight: '16px' }],
        'panel-lg': ['13px', { lineHeight: '17px' }],
      },
      spacing: {
        'row': '26px',
        'row-sm': '22px',
      },
      boxShadow: {
        'panel': '0 4px 24px 0 rgba(0,0,0,0.12), 0 1px 4px 0 rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'panel': '8px',
      },
      fontFamily: {
        'panel': ['-apple-system', 'BlinkMacSystemFont', '"Inter"', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
