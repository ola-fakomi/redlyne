import React, { useState } from 'react';
import { EyeLinearIcon, EyeOffLinearIcon, MinusLinearIcon } from '@solar-icons/react';
import { FillPicker, FillMode } from '../controls/FillPicker';
import { ColorField } from '../controls/ColorField';
import { cn } from '@/lib/utils';

interface Props {
  el: Element;
  get: (prop: string) => string;
  getOrig: (prop: string) => string | undefined;
  set: (prop: string, val: string, desc: string) => void;
}

const TEXT_TAGS = new Set(['P','SPAN','H1','H2','H3','H4','H5','H6','A','BUTTON','LABEL','LI']);

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  if (m) return Math.round(parseFloat(m[1]) * 100);
  return 100;
}

function detectMode(bgImage: string): FillMode {
  if (!bgImage || bgImage === 'none') return 'solid';
  if (bgImage.includes('linear-gradient') || bgImage.includes('radial-gradient')) return 'gradient';
  if (bgImage.startsWith('url(')) return 'image';
  return 'solid';
}

// ── Fill swatch row ───────────────────────────────────────────────────────────

interface FillRowProps {
  mode: FillMode;
  bgColor: string;
  bgImage: string;
  isChanged: boolean;
  onSwatchClick: () => void;
}

function FillRow({ mode, bgColor, bgImage, isChanged, onSwatchClick }: FillRowProps) {
  const [visible, setVisible] = useState(true);

  let swatchBg = 'transparent';
  let label = '';

  if (mode === 'solid') {
    swatchBg = visible ? colorToHex(bgColor) : 'transparent';
    label = colorToHex(bgColor).slice(1).toUpperCase();
  } else if (mode === 'gradient') {
    swatchBg = visible ? bgImage : 'transparent';
    label = bgImage.includes('radial') ? 'Radial' : 'Linear';
  } else {
    swatchBg = 'repeating-conic-gradient(#666 0% 25%, #444 0% 50%) 0 0 / 8px 8px';
    label = 'Image';
  }

  const opacity = mode === 'solid' ? extractOpacity(bgColor) : 100;

  return (
    <div className="flex items-center gap-1">
      <div className={cn(
        'flex items-center gap-1.5 flex-1 h-[22px] px-1.5 rounded-md border bg-panel-input-bg',
        isChanged ? 'border-panel-blue' : 'border-panel-border',
      )}>
        {/* Swatch — opens FillPicker */}
        <button
          onClick={onSwatchClick}
          className="shrink-0 rounded-sm border border-black/20 outline-none focus:ring-1 focus:ring-panel-blue"
          style={{ width: 14, height: 14, background: swatchBg }}
        />
        <span className="flex-1 text-[11px] text-panel-text-primary truncate">{label}</span>
        <span className="w-6 text-right text-[11px] text-panel-text-secondary">{opacity}</span>
        <span className="text-[10px] text-panel-text-label shrink-0">%</span>
      </div>

      <button
        onClick={() => setVisible(v => !v)}
        title={visible ? 'Hide fill' : 'Show fill'}
        className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label hover:text-panel-text-primary hover:bg-panel-row-hover shrink-0"
      >
        {visible ? <EyeLinearIcon size={12} /> : <EyeOffLinearIcon size={12} />}
      </button>

      <button
        title="Remove fill"
        className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label hover:text-red-400 hover:bg-panel-row-hover shrink-0"
      >
        <MinusLinearIcon size={10} />
      </button>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────

export function FillSection({ el, get, getOrig, set }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const isTextEl = TEXT_TAGS.has(el.tagName) || (el.childElementCount === 0 && (el.textContent?.trim().length ?? 0) > 0);
  const bgColor = get('background-color');
  const bgImage = get('background-image');
  const color   = get('color');

  const mode = detectMode(bgImage);
  const isChanged =
    (getOrig('background-color') !== undefined && bgColor !== getOrig('background-color')) ||
    (getOrig('background-image') !== undefined && bgImage !== getOrig('background-image'));

  function handleSolidChange(hex: string, opacity: number) {
    const val = opacity < 100
      ? `${hex}${Math.round(opacity * 2.55).toString(16).padStart(2, '0')}`
      : hex;
    set('background-color', val, 'Change fill color');
    set('background-image', 'none', 'Change fill color');
  }

  function handleGradientChange(css: string) {
    set('background-image', css, 'Change fill gradient');
    set('background-color', 'transparent', 'Change fill gradient');
  }

  function handleImageChange(bgImg: string, filter: string) {
    set('background-image', bgImg, 'Change fill image');
    if (filter) set('filter', filter, 'Change image adjustments');
  }

  return (
    <div className="px-3 pb-3 pt-1 space-y-1">
      {/* Background fill */}
      <FillRow
        mode={mode}
        bgColor={bgColor}
        bgImage={bgImage}
        isChanged={isChanged}
        onSwatchClick={() => setPickerOpen(o => !o)}
      />

      {/* Inline FillPicker */}
      {pickerOpen && (
        <div className="mt-1">
          <FillPicker
            initialMode={mode}
            solidHex={colorToHex(bgColor)}
            solidOpacity={extractOpacity(bgColor)}
            gradientCss={mode === 'gradient' ? bgImage : undefined}
            onSolidChange={handleSolidChange}
            onGradientChange={handleGradientChange}
            onImageChange={handleImageChange}
            onClose={() => setPickerOpen(false)}
          />
        </div>
      )}

      {/* Text color */}
      {isTextEl && (
        <ColorField
          value={color}
          original={getOrig('color')}
          onChange={v => set('color', v, 'Change text color')}
        />
      )}
    </div>
  );
}
