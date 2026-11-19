import React, { useState, useRef } from 'react';
import { EyeLinearIcon, EyeOffLinearIcon, MinusLinearIcon } from '@solar-icons/react';
import { FillPicker, FillMode } from '../controls/FillPicker';
import { cn } from '@/lib/utils';

interface Props {
  el: Element;
  get: (prop: string) => string;
  getOrig: (prop: string) => string | undefined;
  set: (prop: string, val: string, desc: string, promptVal?: string) => void;
}

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
  // Only match rgba — rgb() has no alpha; matching it captures the blue channel as alpha
  const m = color.match(/rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/);
  if (m) return Math.round(parseFloat(m[1]) * 100);
  return 100;
}

function detectMode(bgImage: string): FillMode {
  if (!bgImage || bgImage === 'none') return 'solid';
  if (bgImage.includes('linear-gradient') || bgImage.includes('radial-gradient')) return 'gradient';
  if (bgImage.startsWith('url(')) return 'image';
  return 'solid';
}

// Extract the URL from a CSS url("...") value
function extractCssUrl(val: string): string {
  const m = val.match(/url\(["']?([^"')]+)["']?\)/);
  return m ? m[1] : '';
}

// ── <img> source editor ───────────────────────────────────────────────────────

const OBJECT_FIT_OPTIONS = ['cover', 'contain', 'fill', 'none', 'scale-down'] as const;

function ImgSourceEditor({ el, get, getOrig, set }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState('');

  const imgEl = el as HTMLImageElement;

  // content: url(...) CSS override is what we apply; fall back to the element's own src
  const contentVal = get('content');
  const hasOverride = contentVal && contentVal !== 'normal' && contentVal !== 'none' && contentVal.startsWith('url(');
  const previewSrc  = hasOverride ? extractCssUrl(contentVal) : (imgEl.currentSrc || imgEl.src || '');

  const objectFit    = get('object-fit') || 'fill';
  const isChanged    = getOrig('content') !== undefined;
  const fitChanged   = getOrig('object-fit') !== undefined;

  function applyNewSrc(src: string, filename?: string) {
    // Chrome supports `content: url(...)` on <img> to visually replace the source
    // via the constructable stylesheet, keeping the same change-tracking path as all other edits.
    // Pass filename as promptVal so the prompt shows the file name instead of a base64 blob.
    const promptVal = filename ? `url("${filename}")` : undefined;
    set('content', `url("${src}")`, `Replace image: ${filename ?? 'from URL'}`, promptVal);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => applyNewSrc(ev.target?.result as string, file.name);
    reader.readAsDataURL(file);
    // Reset so the same file can be re-uploaded
    e.target.value = '';
  }

  function handleUrlCommit() {
    const trimmed = urlDraft.trim();
    if (trimmed) { applyNewSrc(trimmed); setUrlDraft(''); }
  }

  return (
    <div className="space-y-2">

      {/* Thumbnail preview */}
      <div
        className="w-full rounded-md border border-panel-border overflow-hidden"
        style={{
          height: 72,
          background: 'conic-gradient(#555 90deg,#444 90deg 180deg,#555 180deg 270deg,#444 270deg) 0 0/10px 10px',
        }}
      >
        {previewSrc && (
          <img
            src={previewSrc}
            alt=""
            className="w-full h-full"
            style={{ objectFit: objectFit as React.CSSProperties['objectFit'] }}
          />
        )}
      </div>

      {/* Upload from computer */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
      <button
        onClick={() => fileRef.current?.click()}
        className={cn(
          'w-full h-[26px] rounded-md border text-[11px] transition-colors',
          isChanged
            ? 'border-panel-blue bg-panel-changed-bg text-panel-blue'
            : 'border-panel-border bg-panel-input-bg text-panel-text-primary hover:bg-panel-row-hover',
        )}
      >
        {isChanged ? 'Replace image' : 'Upload from computer'}
      </button>

      {/* URL input */}
      <div className={cn(
        'flex items-center h-[22px] px-1.5 rounded-md border gap-1.5 bg-panel-input-bg',
        'border-panel-border focus-within:border-panel-blue',
      )}>
        <span className="text-[10px] text-panel-text-label select-none shrink-0">URL</span>
        <input
          type="text"
          value={urlDraft}
          placeholder="https://…"
          onChange={e => setUrlDraft(e.target.value)}
          onBlur={handleUrlCommit}
          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          className="flex-1 min-w-0 bg-transparent text-[11px] text-panel-text-primary focus:outline-none placeholder:text-panel-text-label"
        />
      </div>

      {/* Object-fit */}
      <div className="relative h-[22px] rounded-md border bg-panel-input-bg"
        style={{ borderColor: fitChanged ? 'var(--panel-blue)' : undefined }}
      >
        <select
          value={objectFit}
          onChange={e => set('object-fit', e.target.value, 'Change object fit')}
          style={{ appearance: 'none', WebkitAppearance: 'none' }}
          className="absolute inset-0 w-full h-full pl-1.5 pr-5 bg-transparent text-[11px] text-panel-text-primary focus:outline-none cursor-pointer"
        >
          {OBJECT_FIT_OPTIONS.map(v => (
            <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1).replace('-', ' ')}</option>
          ))}
        </select>
        <div className="absolute right-0 top-0 h-full flex items-center pr-1.5 pointer-events-none">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-panel-text-label">
            <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

    </div>
  );
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

  // <img> elements: use content: url(...) override instead of background-image
  if (el.tagName === 'IMG') {
    return (
      <div className="px-3 pb-3 pt-1">
        <ImgSourceEditor el={el} get={get} getOrig={getOrig} set={set} />
      </div>
    );
  }

  const bgColor = get('background-color');
  const bgImage = get('background-image');

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
      <FillRow
        mode={mode}
        bgColor={bgColor}
        bgImage={bgImage}
        isChanged={isChanged}
        onSwatchClick={() => setPickerOpen(o => !o)}
      />

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
    </div>
  );
}
