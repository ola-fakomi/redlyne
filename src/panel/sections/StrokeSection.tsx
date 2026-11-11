import React, { useState } from 'react';
import { EyeLinearIcon, EyeOffLinearIcon, MinusLinearIcon } from '@solar-icons/react';
import { FillPicker } from '../controls/FillPicker';
import { NumericField } from '../controls/NumericField';
import { cn } from '@/lib/utils';

interface Props {
  get: (prop: string) => string;
  getOrig: (prop: string) => string | undefined;
  set: (prop: string, val: string, desc: string) => void;
}

const STYLES = ['none', 'solid', 'dashed', 'dotted'];

function colorToHex(color: string): string {
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
      ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }
  }
  return '#000000';
}

function extractOpacity(color: string): number {
  const m = color.match(/rgba?\([^)]+,\s*([\d.]+)\)/);
  return m ? Math.round(parseFloat(m[1]) * 100) : 100;
}

function isGradient(val: string) {
  return val && val !== 'none' &&
    (val.includes('linear-gradient') || val.includes('radial-gradient'));
}

export function StrokeSection({ get, getOrig, set }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  const color      = get('border-color');
  const borderImg  = get('border-image');
  const width      = get('border-width');
  const style      = get('border-style');

  const hasGradient = isGradient(borderImg);
  const isChanged =
    (getOrig('border-color') !== undefined && color !== getOrig('border-color')) ||
    (getOrig('border-image') !== undefined && borderImg !== getOrig('border-image'));

  // Swatch display
  let swatchBg = hasGradient
    ? borderImg.replace(/\s+\d+$/, '') // strip trailing slice "1"
    : (visible ? colorToHex(color) : 'transparent');
  let label = hasGradient
    ? (borderImg.includes('radial') ? 'Radial' : 'Linear')
    : colorToHex(color).slice(1).toUpperCase();
  const opacity = hasGradient ? 100 : extractOpacity(color);

  function handleSolidChange(hex: string, op: number) {
    const val = op < 100
      ? `${hex}${Math.round(op * 2.55).toString(16).padStart(2, '00')}`
      : hex;
    set('border-color', val, 'Change stroke color');
    set('border-image', 'none', 'Change stroke color');
  }

  function handleGradientChange(css: string) {
    set('border-image', `${css} 1`, 'Change stroke gradient');
    set('border-color', 'transparent', 'Change stroke gradient');
  }

  return (
    <div className="px-3 pb-3 pt-1 space-y-1">
      {/* Color swatch row */}
      <div className="flex items-center gap-1">
        <div className={cn(
          'flex items-center gap-1.5 flex-1 h-[22px] px-1.5 rounded-md border bg-panel-input-bg',
          isChanged ? 'border-panel-blue' : 'border-panel-border',
        )}>
          <button
            onClick={() => setPickerOpen(o => !o)}
            className="shrink-0 rounded-sm border border-black/20 outline-none focus:ring-1 focus:ring-panel-blue"
            style={{ width: 14, height: 14, background: swatchBg }}
          />
          <span className="flex-1 text-[11px] text-panel-text-primary truncate">{label}</span>
          <span className="w-6 text-right text-[11px] text-panel-text-secondary">{opacity}</span>
          <span className="text-[10px] text-panel-text-label shrink-0">%</span>
        </div>

        <button
          onClick={() => setVisible(v => !v)}
          className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label hover:text-panel-text-primary hover:bg-panel-row-hover shrink-0"
        >
          {visible ? <EyeLinearIcon size={12} /> : <EyeOffLinearIcon size={12} />}
        </button>

        <button
          className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label hover:text-red-400 hover:bg-panel-row-hover shrink-0"
        >
          <MinusLinearIcon size={10} />
        </button>
      </div>

      {/* FillPicker (solid + gradient only) */}
      {pickerOpen && (
        <div className="mt-1">
          <FillPicker
            modes={['solid', 'gradient']}
            initialMode={hasGradient ? 'gradient' : 'solid'}
            solidHex={colorToHex(color)}
            solidOpacity={extractOpacity(color)}
            gradientCss={hasGradient ? borderImg.replace(/\s+\d+$/, '') : undefined}
            onSolidChange={handleSolidChange}
            onGradientChange={handleGradientChange}
            onImageChange={() => {}}
            onClose={() => setPickerOpen(false)}
          />
        </div>
      )}

      {/* Width + style */}
      <div className="flex items-center gap-1">
        <div className="w-[72px] shrink-0">
          <NumericField
            label="W"
            value={width}
            original={getOrig('border-width')}
            onChange={v => set('border-width', v, 'Change border width')}
          />
        </div>
        <div className="relative flex-1 h-[22px] rounded-md border border-panel-border bg-panel-input-bg">
          <select
            value={style}
            onChange={e => set('border-style', e.target.value, 'Change border style')}
            style={{ appearance: 'none', WebkitAppearance: 'none' }}
            className="absolute inset-0 w-full h-full pl-1.5 pr-5 bg-transparent text-[11px] text-panel-text-primary focus:outline-none cursor-pointer"
          >
            {STYLES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="absolute right-0 top-0 h-full flex items-center pr-1.5 pointer-events-none">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-panel-text-label">
              <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
