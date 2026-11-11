/**
 * Figma-style HSB color picker.
 * Canvas (sat × bri) + hue rainbow slider + opacity slider + hex / opacity inputs.
 */

import React, { useState, useRef, useEffect } from 'react';

// ── Color math ────────────────────────────────────────────────────────────────

function hexToHsv(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r)      h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else                h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return [h, max === 0 ? 0 : Math.round((d / max) * 100), Math.round(max * 100)];
}

export function hsvToHex(h: number, s: number, v: number): string {
  s /= 100; v /= 100;
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  let r = 0, g = 0, b = 0;
  if      (h < 60)  { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else              { r = c; b = x; }
  return '#' + [r, g, b].map(n => Math.round((n + m) * 255).toString(16).padStart(2, '0')).join('');
}

// ── Draggable slider ──────────────────────────────────────────────────────────

function Slider({ value, onChange, track, thumb }: {
  value: number;
  onChange: (v: number) => void;
  track: React.CSSProperties;
  thumb: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function calc(e: { clientX: number }) {
    const r = ref.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  }

  function down(e: React.MouseEvent) {
    e.preventDefault();
    onChange(calc(e));
    const mv = (ev: MouseEvent) => onChange(calc(ev));
    const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
  }

  return (
    <div ref={ref} className="relative h-3 rounded-full cursor-crosshair select-none" style={track} onMouseDown={down}>
      <div
        className="absolute rounded-full border-2 border-white shadow pointer-events-none"
        style={{ width: 12, height: 12, left: `${value * 100}%`, top: '50%', transform: 'translate(-50%,-50%)', background: thumb, boxSizing: 'border-box' }}
      />
    </div>
  );
}

// ── Main picker ───────────────────────────────────────────────────────────────

interface ColorPickerProps {
  hex: string;      // '#rrggbb'
  opacity: number;  // 0–100
  onChange: (hex: string, opacity: number) => void;
}

export function ColorPicker({ hex, opacity, onChange }: ColorPickerProps) {
  const safeHex = hex.length === 7 ? hex : '#000000';
  const [hue, setHue] = useState(() => hexToHsv(safeHex)[0]);
  const [sat, setSat] = useState(() => hexToHsv(safeHex)[1]);
  const [bri, setBri] = useState(() => hexToHsv(safeHex)[2]);
  const [opa, setOpa] = useState(opacity);
  const [hexIn, setHexIn] = useState(() => safeHex.slice(1).toUpperCase());
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hex.length === 7) {
      const [h, s, v] = hexToHsv(hex);
      setHue(h); setSat(s); setBri(v);
      setHexIn(hex.slice(1).toUpperCase());
    }
  }, [hex]);

  useEffect(() => { setOpa(opacity); }, [opacity]);

  const hueHex = hsvToHex(hue, 100, 100);
  const curHex = hsvToHex(hue, sat, bri);

  function fire(nh = hue, ns = sat, nv = bri, na = opa) {
    onChange(hsvToHex(nh, ns, nv), na);
  }

  function onCanvasDown(e: React.MouseEvent) {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    function update(ev: { clientX: number; clientY: number }) {
      const ns = Math.round(Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100)));
      const nv = Math.round(Math.max(0, Math.min(100, (1 - (ev.clientY - rect.top) / rect.height) * 100)));
      setSat(ns); setBri(nv);
      fire(hue, ns, nv, opa);
    }
    update(e);
    const mv = (ev: MouseEvent) => update(ev);
    const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
  }

  return (
    <div className="select-none space-y-2">
      {/* HSB canvas */}
      <div ref={canvasRef} className="relative w-full cursor-crosshair" style={{ height: 120 }} onMouseDown={onCanvasDown}>
        <div className="absolute inset-0 rounded" style={{ background: `linear-gradient(to right, #fff, ${hueHex})` }} />
        <div className="absolute inset-0 rounded" style={{ background: 'linear-gradient(to bottom, transparent, #000)' }} />
        <div
          className="absolute rounded-full border-2 border-white shadow pointer-events-none"
          style={{ width: 12, height: 12, left: `${sat}%`, top: `${100 - bri}%`, transform: 'translate(-50%,-50%)' }}
        />
      </div>

      {/* Hue slider */}
      <Slider
        value={hue / 360}
        track={{ background: 'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' }}
        thumb={hueHex}
        onChange={v => { const hv = Math.round(v * 360); setHue(hv); fire(hv, sat, bri, opa); }}
      />

      {/* Opacity slider — checkerboard base + color-to-transparent gradient */}
      <Slider
        value={opa / 100}
        track={{
          background: `linear-gradient(to right, transparent, ${curHex}), conic-gradient(#ccc 90deg, #fff 90deg 180deg, #ccc 180deg 270deg, #fff 270deg) 0 0 / 8px 8px`,
        }}
        thumb={curHex}
        onChange={v => { const av = Math.round(v * 100); setOpa(av); fire(hue, sat, bri, av); }}
      />

      {/* Hex + opacity inputs */}
      <div className="flex items-center gap-1 pt-0.5">
        <div className="flex items-center justify-center h-[22px] px-1.5 rounded-md border border-panel-border bg-panel-input-bg w-9 shrink-0">
          <span className="text-[9px] text-panel-text-secondary tracking-wide font-medium">HEX</span>
        </div>
        <div className="flex items-center h-[22px] px-1.5 rounded-md border border-panel-border bg-panel-input-bg flex-1">
          <input
            type="text"
            value={hexIn}
            onChange={e => {
              const v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6).toUpperCase();
              setHexIn(v);
              if (v.length === 6) {
                const full = `#${v.toLowerCase()}`;
                const [h, s, bv] = hexToHsv(full);
                setHue(h); setSat(s); setBri(bv);
                onChange(full, opa);
              }
            }}
            className="w-full bg-transparent text-[11px] text-panel-text-primary focus:outline-none uppercase"
          />
        </div>
        <div className="flex items-center h-[22px] px-1.5 rounded-md border border-panel-border bg-panel-input-bg w-14 shrink-0 gap-0.5">
          <input
            type="text"
            value={opa}
            onChange={e => {
              const av = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
              setOpa(av);
              fire(hue, sat, bri, av);
            }}
            onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="flex-1 min-w-0 bg-transparent text-[11px] text-panel-text-primary focus:outline-none text-right"
          />
          <span className="text-[10px] text-panel-text-label">%</span>
        </div>
      </div>
    </div>
  );
}
