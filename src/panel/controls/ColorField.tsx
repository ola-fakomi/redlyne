/**
 * Figma-style color row: [swatch | HEX | 100 | %]  [eye]  [−]
 * Clicking the swatch opens an inline HSB color picker.
 */

import React, { useState, useEffect } from 'react';
import { EyeLinearIcon, EyeOffLinearIcon, MinusLinearIcon } from '@solar-icons/react';
import { cn } from '@/lib/utils';
import { ColorPicker } from './ColorPicker';

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
  const [hex, setHex]           = useState(() => toHex(value));
  const [hexTyped, setHexTyped] = useState(() => toHex(value).slice(1).toUpperCase());
  const [visible, setVisible]   = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);

  const isChanged = original !== undefined && value !== original;
  const opacity   = extractOpacity(value);

  useEffect(() => {
    const h = toHex(value);
    setHex(h);
    setHexTyped(h.slice(1).toUpperCase());
  }, [value]);

  function handlePickerChange(newHex: string, newOpacity: number) {
    setHex(newHex);
    setHexTyped(newHex.slice(1).toUpperCase());
    if (newOpacity < 100) {
      const alpha = Math.round(newOpacity * 2.55).toString(16).padStart(2, '0');
      onChange(`${newHex}${alpha}`);
    } else {
      onChange(newHex);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-1">
        {/* Main field: swatch + hex + opacity */}
        <div className={cn(
          'flex items-center gap-1.5 flex-1 h-[22px] px-1.5 rounded-md border bg-panel-input-bg',
          isChanged ? 'border-panel-blue' : 'border-panel-border',
          disabled && 'opacity-40',
        )}>
          {/* Swatch — toggles picker */}
          <button
            onClick={() => !disabled && setPickerOpen(o => !o)}
            disabled={disabled}
            className="shrink-0 rounded-sm border border-black/20 outline-none focus:ring-1 focus:ring-panel-blue"
            style={{ width: 14, height: 14, backgroundColor: visible ? hex : 'transparent' }}
          />

          {/* Hex text — local state so cursor is preserved while typing */}
          <input
            type="text"
            value={hexTyped}
            disabled={disabled}
            onChange={e => {
              const v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6).toUpperCase();
              setHexTyped(v);
              if (v.length === 6) {
                const full = `#${v.toLowerCase()}`;
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
            key={opacity}
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
          {visible ? <EyeLinearIcon size={12} /> : <EyeOffLinearIcon size={12} />}
        </button>

        {/* Minus (remove) */}
        {onRemove && (
          <button
            onClick={onRemove}
            title="Remove"
            className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label hover:text-red-400 hover:bg-panel-row-hover shrink-0"
          >
            <MinusLinearIcon size={10} />
          </button>
        )}
      </div>

      {/* Inline HSB picker */}
      {pickerOpen && !disabled && (
        <div className="mt-1.5 p-2 rounded-lg border border-panel-border bg-panel-bg">
          <ColorPicker hex={hex} opacity={opacity} onChange={handlePickerChange} />
        </div>
      )}
    </div>
  );
}
