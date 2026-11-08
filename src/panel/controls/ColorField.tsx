/**
 * Color input that shows a swatch and a hex/rgba text box.
 * Full color picker (react-colorful) is M2; for M0 we use <input type="color">.
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ColorFieldProps {
  label: string;
  value: string;        // CSS color value
  original?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

/** Convert any CSS color string to a hex string for <input type="color">. */
function toHex(color: string): string {
  if (!color || color === 'transparent' || color === 'none') return '#000000';
  const c = color.trim();
  if (/^#[0-9a-f]{3,8}$/i.test(c)) {
    if (c.length === 4) return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
    return c.slice(0, 7);
  }
  // Try to parse rgb/rgba via canvas (M0 fallback)
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
    }
  }
  return '#000000';
}

export function ColorField({ label, value, original, disabled, onChange }: ColorFieldProps) {
  const [hex, setHex] = useState(() => toHex(value));

  useEffect(() => {
    setHex(toHex(value));
  }, [value]);

  const isChanged = original !== undefined && value !== original;

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-panel-xs font-panel text-panel-text-label select-none shrink-0 w-[40px]">
        {label}
      </span>
      <div className="relative flex items-center gap-1 flex-1 min-w-0">
        {isChanged && (
          <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-panel-blue pointer-events-none" />
        )}
        <input
          type="color"
          value={hex}
          disabled={disabled}
          onChange={e => {
            setHex(e.target.value);
            onChange(e.target.value);
          }}
          className={cn(
            'h-[22px] w-[22px] rounded border border-panel-border p-0.5 cursor-pointer',
            'disabled:opacity-40 disabled:cursor-default',
            '[&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded',
          )}
        />
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
          onBlur={e => onChange(e.target.value)}
          className={cn(
            'flex-1 h-[22px] rounded border border-panel-border bg-white',
            'text-panel-sm font-panel text-panel-text-primary px-1',
            'focus:outline-none focus:ring-1 focus:ring-panel-blue focus:border-panel-blue',
            'disabled:opacity-40',
          )}
        />
      </div>
    </div>
  );
}
