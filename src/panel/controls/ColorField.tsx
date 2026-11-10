/**
 * Figma-style color row: [swatch | HEX | 100 | %]  [eye]  [−]
 * Full color picker is M2; for now uses <input type="color"> via swatch.
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ColorFieldProps {
  value: string;
  original?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove?: () => void;
}

function toHex(color: string): string {
  if (!color || color === 'transparent' || color === 'none') return '#000000';
  const c = color.trim();
  if (/^#[0-9a-f]{3,8}$/i.test(c)) {
    if (c.length === 4) return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
    return c.slice(0, 7);
  }
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

function extractOpacity(color: string): number {
  const m = color.match(/rgba?\([^)]+,\s*([\d.]+)\)/);
  if (m) return Math.round(parseFloat(m[1]) * 100);
  return 100;
}

export function ColorField({ value, original, disabled, onChange, onRemove }: ColorFieldProps) {
  const [hex, setHex] = useState(() => toHex(value));
  const [visible, setVisible] = useState(true);
  const isChanged = original !== undefined && value !== original;
  const opacity = extractOpacity(value);

  useEffect(() => { setHex(toHex(value)); }, [value]);

  const displayHex = hex.replace('#', '').toUpperCase();

  return (
    <div className="flex items-center gap-1">
      {/* Main field: swatch + hex + opacity */}
      <div
        className={cn(
          'flex items-center gap-1.5 flex-1 h-[22px] px-1.5 rounded-md border bg-panel-input-bg',
          isChanged ? 'border-panel-blue' : 'border-panel-border',
          disabled && 'opacity-40',
        )}
      >
        {/* Color swatch — also acts as color picker trigger */}
        <label className="relative shrink-0 cursor-pointer">
          <div
            className="w-[14px] h-[14px] rounded-sm border border-black/20"
            style={{ backgroundColor: visible ? hex : 'transparent' }}
          />
          <input
            type="color"
            value={hex}
            disabled={disabled}
            onChange={e => {
              setHex(e.target.value);
              onChange(e.target.value);
            }}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>

        {/* Hex text */}
        <input
          type="text"
          value={displayHex}
          disabled={disabled}
          onChange={e => {
            const v = e.target.value.replace(/[^0-9a-f]/gi, '').slice(0, 6);
            if (v.length === 6) {
              const full = `#${v}`;
              setHex(full);
              onChange(full);
            }
          }}
          className="flex-1 min-w-0 bg-transparent text-[11px] font-panel text-panel-text-primary focus:outline-none uppercase"
        />

        {/* Opacity */}
        <input
          type="text"
          defaultValue={opacity}
          disabled={disabled}
          onBlur={e => {
            const pct = Math.min(100, Math.max(0, parseFloat(e.target.value) || 100));
            if (pct < 100) onChange(`${hex}${Math.round(pct * 2.55).toString(16).padStart(2, '0')}`);
            else onChange(hex);
          }}
          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          className="w-6 bg-transparent text-[11px] font-panel text-panel-text-secondary text-right focus:outline-none"
        />
        <span className="text-[10px] text-panel-text-label shrink-0">%</span>
      </div>

      {/* Eye (visibility toggle) */}
      <button
        onClick={() => setVisible(v => !v)}
        title={visible ? 'Hide fill' : 'Show fill'}
        className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label hover:text-panel-text-primary hover:bg-panel-row-hover shrink-0"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          {visible ? (
            <>
              <path d="M6 2.5C3.5 2.5 1.5 6 1.5 6C1.5 6 3.5 9.5 6 9.5C8.5 9.5 10.5 6 10.5 6C10.5 6 8.5 2.5 6 2.5Z" stroke="currentColor" strokeWidth="1" fill="none"/>
              <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
            </>
          ) : (
            <>
              <path d="M6 2.5C3.5 2.5 1.5 6 1.5 6C1.5 6 3.5 9.5 6 9.5C8.5 9.5 10.5 6 10.5 6C10.5 6 8.5 2.5 6 2.5Z" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="2 1"/>
              <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1"/>
            </>
          )}
        </svg>
      </button>

      {/* Minus (remove) */}
      {onRemove && (
        <button
          onClick={onRemove}
          title="Remove"
          className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label hover:text-red-400 hover:bg-panel-row-hover shrink-0"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <line x1="2" y1="5" x2="8" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}
