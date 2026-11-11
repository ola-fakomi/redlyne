/**
 * Effects section — Inner shadow, Drop shadow, Layer blur, Background blur.
 * Maps to box-shadow, filter: blur(), backdrop-filter: blur().
 */

import React, { useState } from 'react';
import {
  Grid2x2LinearIcon, AddLinearIcon, EyeLinearIcon, MinusLinearIcon,
  AltArrowDownLinearIcon, SquareDashedLinearIcon, LayersLinearIcon,
  Grid3x3LinearIcon, MaximizeLinearIcon,
} from '@solar-icons/react';

// ── Types ─────────────────────────────────────────────────────────────────────

type EffectType = 'inner-shadow' | 'drop-shadow' | 'layer-blur' | 'background-blur';

const EFFECT_LABELS: Record<EffectType, string> = {
  'inner-shadow':    'Inner shadow',
  'drop-shadow':     'Drop shadow',
  'layer-blur':      'Layer blur',
  'background-blur': 'Background blur',
};

const EFFECT_TYPES: EffectType[] = ['inner-shadow', 'drop-shadow', 'layer-blur', 'background-blur'];

interface ShadowEffect {
  id: string;
  type: 'inner-shadow' | 'drop-shadow';
  enabled: boolean;
  x: number; y: number; blur: number; spread: number;
  color: string; opacity: number;
  showBehind: boolean;
}

interface BlurEffect {
  id: string;
  type: 'layer-blur' | 'background-blur';
  enabled: boolean;
  blur: number;
}

type Effect = ShadowEffect | BlurEffect;

function isShadow(e: Effect): e is ShadowEffect {
  return e.type === 'inner-shadow' || e.type === 'drop-shadow';
}

function uid() { return Math.random().toString(36).slice(2, 9); }

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
}

function makeDefault(type: EffectType): Effect {
  if (type === 'inner-shadow' || type === 'drop-shadow') {
    return { id: uid(), type, enabled: true, x: 1, y: 1, blur: 0, spread: 0, color: '#4f4f4f', opacity: 100, showBehind: false };
  }
  return { id: uid(), type, enabled: true, blur: 4 };
}

function serializeEffects(effects: Effect[]) {
  const activeShadows = effects.filter(e => isShadow(e) && e.enabled) as ShadowEffect[];
  const boxShadow = activeShadows.length
    ? activeShadows.map(s => {
        const inset = s.type === 'inner-shadow' ? 'inset ' : '';
        return `${inset}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${hexToRgba(s.color, s.opacity / 100)}`;
      }).join(', ')
    : 'none';

  const layerBlurs = effects.filter(e => e.type === 'layer-blur' && e.enabled) as BlurEffect[];
  const filter = layerBlurs.length ? layerBlurs.map(b => `blur(${b.blur}px)`).join(' ') : 'none';

  const bgBlurs = effects.filter(e => e.type === 'background-blur' && e.enabled) as BlurEffect[];
  const backdropFilter = bgBlurs.length ? bgBlurs.map(b => `blur(${b.blur}px)`).join(' ') : 'none';

  return { boxShadow, filter, backdropFilter };
}

function EffectTypeIcon({ type }: { type: EffectType }) {
  if (type === 'layer-blur' || type === 'background-blur') return <LayersLinearIcon size={12} />;
  return <SquareDashedLinearIcon size={12} />;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  get: (prop: string) => string;
  set: (prop: string, val: string, desc: string) => void;
}

export function EffectsSection({ set }: Props) {
  const [effects, setEffects] = useState<Effect[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [typePickerId, setTypePickerId] = useState<string | null>(null);

  function applyAll(next: Effect[]) {
    const { boxShadow, filter, backdropFilter } = serializeEffects(next);
    set('box-shadow', boxShadow, 'Change shadow effect');
    set('filter', filter, 'Change layer blur');
    set('backdrop-filter', backdropFilter, 'Change background blur');
  }

  function addEffect(type: EffectType) {
    const e = makeDefault(type);
    const next = [...effects, e];
    setEffects(next);
    setAddOpen(false);
    applyAll(next);
  }

  function removeEffect(id: string) {
    const next = effects.filter(e => e.id !== id);
    setEffects(next);
    applyAll(next);
  }

  function toggleEnabled(id: string) {
    const next = effects.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e);
    setEffects(next);
    applyAll(next);
  }

  function changeType(id: string, type: EffectType) {
    const next = effects.map(e => e.id === id ? { ...makeDefault(type), id } : e);
    setEffects(next);
    setTypePickerId(null);
    applyAll(next);
  }

  function patchShadow(id: string, patch: Partial<ShadowEffect>) {
    const next = effects.map(e => e.id === id ? { ...e, ...patch } : e) as Effect[];
    setEffects(next);
    applyAll(next);
  }

  function patchBlur(id: string, blur: number) {
    const next = effects.map(e => e.id === id ? { ...e, blur } : e) as Effect[];
    setEffects(next);
    applyAll(next);
  }

  const inputCls = 'w-full h-[22px] pr-1.5 rounded-md border border-panel-border bg-panel-input-bg text-[11px] font-panel text-panel-text-primary text-right focus:outline-none focus:ring-1 focus:ring-panel-blue';

  return (
    <>
      {/* ── Section header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 h-10 border-t border-panel-border shrink-0">
        <span className="text-[13px] font-semibold text-panel-text-primary">Effects</span>
        <div className="flex items-center gap-1.5">
          <span className="text-panel-text-label"><Grid2x2LinearIcon size={12} /></span>
          <div className="relative">
            <button
              onClick={() => { setAddOpen(o => !o); setTypePickerId(null); }}
              className="flex items-center justify-center w-5 h-5 rounded text-panel-text-label hover:text-panel-text-primary hover:bg-panel-row-hover"
            >
              <AddLinearIcon size={10} />
            </button>
            {addOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-panel-bg border border-panel-border rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                {EFFECT_TYPES.map((type, i) => (
                  <button
                    key={type}
                    onClick={() => addEffect(type)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] hover:bg-panel-blue hover:text-white ${i === 0 ? 'bg-panel-blue text-white' : 'text-panel-text-primary'}`}
                  >
                    <EffectTypeIcon type={type} />
                    {EFFECT_LABELS[type]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Effect rows ────────────────────────────────────────── */}
      {effects.map(effect => (
        <div key={effect.id} className="border-b border-panel-border last:border-b-0">

          {/* Row header */}
          <div className="flex items-center gap-1.5 px-3 h-7">
            <input
              type="checkbox"
              checked={effect.enabled}
              onChange={() => toggleEnabled(effect.id)}
              className="w-3 h-3 shrink-0"
              style={{ accentColor: 'var(--panel-accent)' }}
            />
            <div className="relative flex-1 min-w-0">
              <button
                onClick={() => setTypePickerId(typePickerId === effect.id ? null : effect.id)}
                className="flex items-center gap-1 text-[11px] text-panel-text-primary w-full text-left"
              >
                <span>{EFFECT_LABELS[effect.type]}</span>
                <AltArrowDownLinearIcon size={8} />
              </button>
              {typePickerId === effect.id && (
                <div className="absolute left-0 top-full mt-0.5 w-44 bg-panel-bg border border-panel-border rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                  {EFFECT_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => changeType(effect.id, type)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] ${effect.type === type ? 'bg-panel-blue text-white' : 'text-panel-text-primary hover:bg-panel-row-hover'}`}
                    >
                      <EffectTypeIcon type={type} />
                      {EFFECT_LABELS[type]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => toggleEnabled(effect.id)}
              className={`flex items-center justify-center w-4 h-4 hover:text-panel-text-primary ${effect.enabled ? 'text-panel-text-label' : 'text-panel-text-label opacity-30'}`}
            >
              <EyeLinearIcon size={12} />
            </button>
            <button
              onClick={() => removeEffect(effect.id)}
              className="flex items-center justify-center w-4 h-4 text-panel-text-label hover:text-panel-text-primary"
            >
              <MinusLinearIcon size={10} />
            </button>
          </div>

          {/* Shadow properties */}
          {isShadow(effect) && (
            <div className="px-3 pb-2.5 pt-0.5 space-y-1.5">
              {/* Position X / Y */}
              <div className="flex items-center gap-2">
                <span className="w-14 text-[10px] text-panel-text-label shrink-0">Position</span>
                <div className="flex gap-1 flex-1">
                  <div className="relative flex-1">
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-panel-text-label z-10 pointer-events-none">X</span>
                    <input type="text" defaultValue={effect.x} key={`${effect.id}-x`}
                      className={`${inputCls} pl-5`}
                      onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) patchShadow(effect.id, { x: v }); }}
                      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-panel-text-label z-10 pointer-events-none">Y</span>
                    <input type="text" defaultValue={effect.y} key={`${effect.id}-y`}
                      className={`${inputCls} pl-5`}
                      onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) patchShadow(effect.id, { y: v }); }}
                      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                    />
                  </div>
                </div>
              </div>
              {/* Blur */}
              <div className="flex items-center gap-2">
                <span className="w-14 text-[10px] text-panel-text-label shrink-0">Blur</span>
                <div className="relative flex-1">
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-panel-text-label z-10 pointer-events-none"><Grid3x3LinearIcon size={12} /></span>
                  <input type="text" defaultValue={effect.blur} key={`${effect.id}-blur`}
                    className={`${inputCls} pl-6`}
                    onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) patchShadow(effect.id, { blur: v }); }}
                    onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                  />
                </div>
              </div>
              {/* Spread */}
              <div className="flex items-center gap-2">
                <span className="w-14 text-[10px] text-panel-text-label shrink-0">Spread</span>
                <div className="relative flex-1">
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-panel-text-label z-10 pointer-events-none"><MaximizeLinearIcon size={12} /></span>
                  <input type="text" defaultValue={effect.spread} key={`${effect.id}-spread`}
                    className={`${inputCls} pl-6`}
                    onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) patchShadow(effect.id, { spread: v }); }}
                    onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                  />
                </div>
              </div>
              {/* Color */}
              <div className="flex items-center gap-2">
                <span className="w-14 text-[10px] text-panel-text-label shrink-0">Color</span>
                <div className="flex items-center gap-1 flex-1 h-[22px] px-1.5 rounded-md border border-panel-border bg-panel-input-bg">
                  <div className="w-3.5 h-3.5 rounded-sm border border-black/20 shrink-0" style={{ backgroundColor: effect.color }} />
                  <input
                    type="text"
                    key={`${effect.id}-color`}
                    defaultValue={effect.color.replace('#', '').toUpperCase()}
                    onBlur={e => {
                      const v = e.target.value.replace('#', '');
                      if (/^[0-9A-Fa-f]{6}$/.test(v)) patchShadow(effect.id, { color: `#${v.toLowerCase()}` });
                    }}
                    onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                    className="flex-1 w-0 bg-transparent text-[11px] font-panel text-panel-text-primary uppercase focus:outline-none"
                  />
                  <input
                    type="text"
                    key={`${effect.id}-opacity`}
                    defaultValue={effect.opacity}
                    onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) patchShadow(effect.id, { opacity: Math.min(100, Math.max(0, v)) }); }}
                    onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                    className="w-7 shrink-0 bg-transparent text-[11px] font-panel text-panel-text-primary text-right focus:outline-none"
                  />
                  <span className="text-[10px] text-panel-text-label shrink-0">%</span>
                </div>
              </div>
              {/* Show behind transparent (drop shadow only) */}
              {effect.type === 'drop-shadow' && (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <input
                    type="checkbox"
                    checked={effect.showBehind}
                    onChange={() => patchShadow(effect.id, { showBehind: !effect.showBehind })}
                    className="w-3 h-3 shrink-0"
                    style={{ accentColor: 'var(--panel-accent)' }}
                  />
                  <span className="text-[10px] text-panel-text-label">Show behind transparent areas</span>
                </div>
              )}
            </div>
          )}

          {/* Blur properties */}
          {!isShadow(effect) && (
            <div className="px-3 pb-2.5 pt-0.5">
              <div className="flex items-center gap-2">
                <span className="w-14 text-[10px] text-panel-text-label shrink-0">Blur</span>
                <div className="relative flex-1">
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-panel-text-label z-10 pointer-events-none"><Grid3x3LinearIcon size={12} /></span>
                  <input type="text" defaultValue={(effect as BlurEffect).blur} key={`${effect.id}-blur`}
                    className={`${inputCls} pl-6`}
                    onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) patchBlur(effect.id, v); }}
                    onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      ))}
    </>
  );
}
