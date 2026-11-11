/**
 * Figma-style fill picker — 3 modes: Solid | Linear Gradient | Image
 * Header: [Solid icon] [Gradient icon] [Image icon]  ·  [× close]
 */

import React, { useState, useRef, useCallback } from 'react';
import { ColorPicker } from './ColorPicker';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

export type FillMode = 'solid' | 'gradient' | 'image';

interface GStop {
  id: string;
  pos: number;     // 0–100
  hex: string;     // '#rrggbb'
  opacity: number; // 0–100
}

interface Grad {
  type: 'linear' | 'radial';
  angle: number;
  stops: GStop[];
}

interface ImgState {
  url: string;
  scaling: 'fill' | 'fit' | 'crop' | 'tile';
  exposure: number;   // -100 to 100
  contrast: number;
  saturation: number;
}

// ── Color utilities ───────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 9); }

function colorToHex(color: string): string {
  if (!color || color === 'transparent' || color === 'none') return '#000000';
  const c = color.trim();
  if (/^#[0-9a-f]{3,8}$/i.test(c)) {
    if (c.length === 4) return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
    return c.slice(0, 7);
  }
  const m = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) return '#' + [m[1], m[2], m[3]].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
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

function alphaFromColor(color: string): number {
  const m = color.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
  return m ? Math.round(parseFloat(m[1]) * 100) : 100;
}

function stopCss(s: GStop): string {
  if (s.opacity >= 100) return s.hex;
  const a = Math.round(s.opacity * 2.55).toString(16).padStart(2, '0');
  return `${s.hex}${a}`;
}

function gradToCss(g: Grad): string {
  const sorted = [...g.stops].sort((a, b) => a.pos - b.pos);
  const stops = sorted.map(s => `${stopCss(s)} ${s.pos}%`).join(', ');
  return g.type === 'linear'
    ? `linear-gradient(${g.angle}deg, ${stops})`
    : `radial-gradient(circle, ${stops})`;
}

function parseGrad(css: string): Grad {
  const type: 'linear' | 'radial' = css.includes('radial') ? 'radial' : 'linear';
  const angleMatch = css.match(/linear-gradient\((\d+)deg/);
  const angle = angleMatch ? parseInt(angleMatch[1]) : 90;

  const inner = css.match(/(?:linear|radial)-gradient\((.+)\)$/s);
  if (!inner) return defaultGrad();

  const parts: string[] = [];
  let depth = 0, cur = '';
  for (const ch of inner[1]) {
    if (ch === '(') { depth++; cur += ch; }
    else if (ch === ')') { depth--; cur += ch; }
    else if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());

  const colorParts = parts.filter(p =>
    p.startsWith('rgb') || p.startsWith('#') || p.startsWith('hsl') ||
    /^(red|blue|green|white|black|transparent)/.test(p)
  );

  if (colorParts.length < 2) return defaultGrad();

  const stops: GStop[] = colorParts.map((p, i) => {
    const tokens = p.trim().split(/\s+/);
    const last = tokens[tokens.length - 1];
    const hasPos = /^[\d.]+(%|px|em|rem)$/.test(last);
    const pos = hasPos ? parseFloat(last) : Math.round((i / (colorParts.length - 1)) * 100);
    const colorStr = hasPos ? tokens.slice(0, -1).join(' ') : tokens.join(' ');
    return { id: uid(), pos: Math.round(pos), hex: colorToHex(colorStr), opacity: alphaFromColor(colorStr) };
  });

  return { type, angle, stops };
}

function defaultGrad(): Grad {
  return { type: 'linear', angle: 90, stops: [
    { id: uid(), pos: 0, hex: '#000000', opacity: 100 },
    { id: uid(), pos: 100, hex: '#ffffff', opacity: 100 },
  ]};
}

function imgToFilter(s: ImgState): string {
  const br = (1 + s.exposure / 100).toFixed(2);
  const co = (1 + s.contrast / 100).toFixed(2);
  const sa = Math.max(0, 1 + s.saturation / 100).toFixed(2);
  return `brightness(${br}) contrast(${co}) saturate(${sa})`;
}

// ── Header icon SVGs ──────────────────────────────────────────────────────────

function SolidIcon({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={active ? 'text-panel-text-primary' : 'text-panel-text-label'}>
      <rect x="2" y="2" width="10" height="10" rx="2" fill="currentColor"/>
    </svg>
  );
}

function GradientIcon({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={active ? 'text-panel-text-primary' : 'text-panel-text-label'}>
      <defs>
        <linearGradient id="gi" x1="2" y1="7" x2="12" y2="7" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.1"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="10" height="10" rx="2" fill="url(#gi)"/>
    </svg>
  );
}

function ImageFillIcon({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={active ? 'text-panel-text-primary' : 'text-panel-text-label'}>
      <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M2 10l3-3 2 2 2-3 3 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="5.5" cy="5.5" r="1" fill="currentColor"/>
    </svg>
  );
}

// ── Gradient bar ──────────────────────────────────────────────────────────────

function GradientBar({ grad, selectedId, onSelect, onChange }: {
  grad: Grad;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChange: (stops: GStop[]) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const css = gradToCss(grad);

  function addStop(e: React.MouseEvent) {
    if ((e.target as HTMLElement).dataset.stopId) return;
    const r = barRef.current!.getBoundingClientRect();
    const pos = Math.round(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
    const s: GStop = { id: uid(), pos, hex: '#808080', opacity: 100 };
    onChange([...grad.stops, s]);
    onSelect(s.id);
  }

  function startDrag(e: React.MouseEvent, stopId: string) {
    e.preventDefault();
    e.stopPropagation();
    onSelect(stopId);
    const r = barRef.current!.getBoundingClientRect();
    const mv = (ev: MouseEvent) => {
      const pos = Math.round(Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100)));
      onChange(grad.stops.map(s => s.id === stopId ? { ...s, pos } : s));
    };
    const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
  }

  return (
    <div className="relative pb-3">
      {/* Bar */}
      <div
        ref={barRef}
        className="h-4 rounded cursor-crosshair"
        style={{ background: css }}
        onClick={addStop}
      />
      {/* Stop handles — teardrop pins below bar */}
      {grad.stops.map(s => (
        <div
          key={s.id}
          data-stop-id={s.id}
          onMouseDown={e => startDrag(e, s.id)}
          title={`${s.pos}%`}
          className={cn(
            'absolute bottom-0 w-3 h-3 rounded-full border-2 cursor-grab shadow',
            selectedId === s.id ? 'border-white ring-1 ring-panel-blue z-10' : 'border-white/80',
          )}
          style={{ left: `${s.pos}%`, transform: 'translateX(-50%)', background: stopCss(s) }}
        />
      ))}
    </div>
  );
}

// ── Adjust slider (image) ─────────────────────────────────────────────────────

function AdjustSlider({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 h-[22px]">
      <span className="text-[10px] text-panel-text-label w-[72px] shrink-0">{label}</span>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 h-[3px] cursor-pointer accent-panel-blue"
        style={{ accentColor: 'var(--panel-blue, #0d99ff)' }}
      />
      <span className="text-[10px] text-panel-text-secondary w-7 text-right shrink-0">{value > 0 ? `+${value}` : value}</span>
    </div>
  );
}

// ── FillPicker ────────────────────────────────────────────────────────────────

export interface FillPickerProps {
  initialMode?: FillMode;
  modes?: FillMode[];        // which tabs to show (default: all 3)
  solidHex?: string;         // '#rrggbb'
  solidOpacity?: number;     // 0–100
  gradientCss?: string;      // existing CSS gradient string
  onSolidChange: (hex: string, opacity: number) => void;
  onGradientChange: (css: string) => void;
  onImageChange: (bgImage: string, filter: string) => void;
  onClose: () => void;
}

export function FillPicker({
  initialMode = 'solid',
  modes = ['solid', 'gradient', 'image'],
  solidHex = '#000000',
  solidOpacity = 100,
  gradientCss,
  onSolidChange,
  onGradientChange,
  onImageChange,
  onClose,
}: FillPickerProps) {
  const [mode, setMode] = useState<FillMode>(() =>
    modes.includes(initialMode) ? initialMode : modes[0]
  );

  // ── Gradient state ──────────────────────────────────────────────────────────
  const [grad, setGrad] = useState<Grad>(() =>
    gradientCss ? parseGrad(gradientCss) : defaultGrad()
  );
  const [selStopId, setSelStopId] = useState<string | null>(() =>
    gradientCss ? parseGrad(gradientCss).stops[0]?.id ?? null : defaultGrad().stops[0].id
  );

  const selStop = grad.stops.find(s => s.id === selStopId) ?? grad.stops[0] ?? null;

  function updateGrad(next: Grad) {
    setGrad(next);
    onGradientChange(gradToCss(next));
  }

  function updateStops(stops: GStop[]) { updateGrad({ ...grad, stops }); }

  function reverseStops() {
    const reversed = [...grad.stops].map(s => ({ ...s, pos: 100 - s.pos }));
    updateGrad({ ...grad, stops: reversed });
  }

  function removeStop(id: string) {
    if (grad.stops.length <= 2) return;
    const next = grad.stops.filter(s => s.id !== id);
    updateGrad({ ...grad, stops: next });
    if (selStopId === id) setSelStopId(next[0]?.id ?? null);
  }

  function onStopColorChange(hex: string, opacity: number) {
    if (!selStopId) return;
    updateStops(grad.stops.map(s => s.id === selStopId ? { ...s, hex, opacity } : s));
  }

  // ── Image state ─────────────────────────────────────────────────────────────
  const [img, setImg] = useState<ImgState>({
    url: '', scaling: 'fill', exposure: 0, contrast: 0, saturation: 0,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  function updateImg(next: Partial<ImgState>) {
    const s = { ...img, ...next };
    setImg(s);
    if (s.url) onImageChange(`url("${s.url}")`, imgToFilter(s));
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => updateImg({ url: ev.target?.result as string });
    reader.readAsDataURL(file);
  }

  const GRADIENT_TYPES = ['linear', 'radial'] as const;
  const SCALING_MODES = ['fill', 'fit', 'crop', 'tile'] as const;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-lg border border-panel-border bg-panel-bg select-none" style={{ width: 232 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-2 pt-2 pb-1.5 border-b border-panel-border">
        <div className="flex items-center gap-0.5">
          {([
            ['solid',    <SolidIcon    key="s" active={mode === 'solid'}    />],
            ['gradient', <GradientIcon key="g" active={mode === 'gradient'} />],
            ['image',    <ImageFillIcon key="i" active={mode === 'image'}   />],
          ] as [FillMode, React.ReactNode][]).filter(([m]) => modes.includes(m)).map(([m, icon]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              title={m.charAt(0).toUpperCase() + m.slice(1)}
              className={cn(
                'flex items-center justify-center w-6 h-6 rounded-md transition-colors',
                mode === m ? 'bg-panel-row-hover' : 'hover:bg-panel-row-hover',
              )}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="flex items-center justify-center w-6 h-6 rounded-md text-panel-text-label hover:text-panel-text-primary hover:bg-panel-row-hover"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* ── SOLID ── */}
      {mode === 'solid' && (
        <div className="p-2">
          <ColorPicker
            hex={solidHex}
            opacity={solidOpacity}
            onChange={onSolidChange}
          />
        </div>
      )}

      {/* ── GRADIENT ── */}
      {mode === 'gradient' && (
        <div className="p-2 space-y-2">
          {/* Type + angle row */}
          <div className="flex items-center gap-1">
            <div className="relative flex-1 h-[22px] rounded-md border border-panel-border bg-panel-input-bg">
              <select
                value={grad.type}
                onChange={e => updateGrad({ ...grad, type: e.target.value as 'linear' | 'radial' })}
                style={{ appearance: 'none', WebkitAppearance: 'none' }}
                className="absolute inset-0 w-full h-full pl-1.5 pr-5 bg-transparent text-[11px] text-panel-text-primary focus:outline-none cursor-pointer capitalize"
              >
                {GRADIENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              <div className="absolute right-0 top-0 h-full flex items-center pr-1.5 pointer-events-none">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-panel-text-label">
                  <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {grad.type === 'linear' && (
              <div className="flex items-center h-[22px] px-1.5 rounded-md border border-panel-border bg-panel-input-bg w-14 gap-0.5">
                <input
                  type="text"
                  value={grad.angle}
                  onChange={e => {
                    const v = Math.max(0, Math.min(360, parseInt(e.target.value) || 0));
                    updateGrad({ ...grad, angle: v });
                  }}
                  className="flex-1 min-w-0 bg-transparent text-[11px] text-panel-text-primary focus:outline-none text-right"
                />
                <span className="text-[10px] text-panel-text-label shrink-0">°</span>
              </div>
            )}

            {/* Reverse */}
            <button
              onClick={reverseStops}
              title="Reverse stops"
              className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label hover:text-panel-text-primary hover:bg-panel-row-hover shrink-0"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4h7M7 2l2 2-2 2M10 8H3M5 6l-2 2 2 2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Gradient bar + stop handles */}
          <GradientBar
            grad={grad}
            selectedId={selStopId}
            onSelect={setSelStopId}
            onChange={updateStops}
          />

          {/* Color picker for selected stop */}
          {selStop && (
            <ColorPicker
              hex={selStop.hex}
              opacity={selStop.opacity}
              onChange={onStopColorChange}
            />
          )}

          {/* Stops list */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-panel-text-label">Stops</span>
              <button
                onClick={() => {
                  const s: GStop = { id: uid(), pos: 50, hex: '#808080', opacity: 100 };
                  updateStops([...grad.stops, s]);
                  setSelStopId(s.id);
                }}
                className="text-[10px] text-panel-text-label hover:text-panel-text-primary leading-none"
              >
                +
              </button>
            </div>
            <div className="space-y-0.5">
              {[...grad.stops].sort((a, b) => a.pos - b.pos).map(s => (
                <div
                  key={s.id}
                  onClick={() => setSelStopId(s.id)}
                  className={cn(
                    'flex items-center gap-1 h-[22px] px-1.5 rounded-md border cursor-pointer',
                    selStopId === s.id
                      ? 'border-panel-blue bg-panel-input-bg'
                      : 'border-panel-border bg-panel-input-bg hover:border-panel-blue/50',
                  )}
                >
                  {/* Position */}
                  <span className="text-[10px] text-panel-text-secondary w-7 shrink-0">{s.pos}%</span>
                  {/* Swatch */}
                  <div className="w-[12px] h-[12px] rounded-sm border border-black/20 shrink-0" style={{ background: stopCss(s) }}/>
                  {/* Hex */}
                  <span className="flex-1 text-[11px] text-panel-text-primary truncate uppercase">{s.hex.slice(1)}</span>
                  {/* Opacity */}
                  <span className="text-[10px] text-panel-text-secondary w-7 text-right shrink-0">{s.opacity}%</span>
                  {/* Remove */}
                  <button
                    onClick={e => { e.stopPropagation(); removeStop(s.id); }}
                    disabled={grad.stops.length <= 2}
                    className="text-panel-text-label hover:text-red-400 disabled:opacity-30 ml-0.5"
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── IMAGE ── */}
      {mode === 'image' && (
        <div className="p-2 space-y-2">
          {/* Scaling dropdown */}
          <div className="relative h-[22px] rounded-md border border-panel-border bg-panel-input-bg">
            <select
              value={img.scaling}
              onChange={e => updateImg({ scaling: e.target.value as ImgState['scaling'] })}
              style={{ appearance: 'none', WebkitAppearance: 'none' }}
              className="absolute inset-0 w-full h-full pl-1.5 pr-5 bg-transparent text-[11px] text-panel-text-primary focus:outline-none cursor-pointer capitalize"
            >
              {SCALING_MODES.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
            </select>
            <div className="absolute right-0 top-0 h-full flex items-center pr-1.5 pointer-events-none">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-panel-text-label">
                <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Preview */}
          <div
            className="w-full rounded-md border border-panel-border overflow-hidden"
            style={{
              height: 80,
              background: img.url
                ? undefined
                : 'conic-gradient(#444 90deg, #333 90deg 180deg, #444 180deg 270deg, #333 270deg) 0 0 / 12px 12px',
            }}
          >
            {img.url && (
              <img
                src={img.url}
                alt="fill"
                className="w-full h-full"
                style={{
                  objectFit: img.scaling === 'tile' ? 'none' : img.scaling === 'fit' ? 'contain' : 'cover',
                  filter: imgToFilter(img),
                }}
              />
            )}
          </div>

          {/* Upload button */}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-[26px] rounded-md border border-panel-border bg-panel-input-bg text-[11px] text-panel-text-primary hover:bg-panel-row-hover transition-colors"
          >
            Upload from computer
          </button>

          {/* Adjustments */}
          <div className="space-y-1">
            <span className="text-[10px] text-panel-text-label block">Adjustments</span>
            <AdjustSlider label="Exposure"   value={img.exposure}   min={-100} max={100} onChange={v => updateImg({ exposure: v })}   />
            <AdjustSlider label="Contrast"   value={img.contrast}   min={-100} max={100} onChange={v => updateImg({ contrast: v })}   />
            <AdjustSlider label="Saturation" value={img.saturation} min={-100} max={100} onChange={v => updateImg({ saturation: v })} />
          </div>
        </div>
      )}
    </div>
  );
}
