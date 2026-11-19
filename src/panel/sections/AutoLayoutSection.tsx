import React, { useState } from 'react';
import { AltArrowDownLinearIcon, LinkMinimalisticLinearIcon } from '@solar-icons/react';
import { cn } from '@/lib/utils';

interface Props {
  el: Element;
  get: (prop: string) => string;
  getOrig: (prop: string) => string | undefined;
  set: (prop: string, val: string, desc: string) => void;
}

type SizeMode = 'fixed' | 'fill' | 'hug';

// ── Flow icons ────────────────────────────────────────────────────────────────
const FlowRowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <rect x="1" y="3.5" width="3" height="5" rx="0.5" stroke="currentColor" strokeWidth="1"/>
    <rect x="5" y="3.5" width="3" height="5" rx="0.5" stroke="currentColor" strokeWidth="1"/>
    <path d="M9.5 4.5v3M11 6H8.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
  </svg>
);
const FlowColumnIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <rect x="3.5" y="1" width="5" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/>
    <rect x="3.5" y="5" width="5" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/>
    <path d="M4.5 9.5h3M6 8.5v3" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
  </svg>
);
const FlowRowWrapIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <rect x="1" y="1.5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/>
    <rect x="5" y="1.5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/>
    <rect x="1" y="6" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/>
    <path d="M9.5 3H10V7.5H5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6.5l-1 1 1 1" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const FlowColumnWrapIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <rect x="1.5" y="1" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/>
    <rect x="1.5" y="5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/>
    <rect x="6" y="1" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/>
    <path d="M3 9.5V10H7.5V5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 6l1-1 1 1" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FLOW_MODES = [
  { dir: 'row',    wrap: 'nowrap', title: 'Horizontal',      Icon: FlowRowIcon },
  { dir: 'column', wrap: 'nowrap', title: 'Vertical',        Icon: FlowColumnIcon },
  { dir: 'row',    wrap: 'wrap',   title: 'Horizontal wrap', Icon: FlowRowWrapIcon },
  { dir: 'column', wrap: 'wrap',   title: 'Vertical wrap',   Icon: FlowColumnWrapIcon },
] as const;

// ── Resizing helpers ──────────────────────────────────────────────────────────
function getWidthMode(el: Element, get: (p: string) => string): SizeMode {
  if (parseFloat(get('flex-grow')) > 0) return 'fill';
  const inlineW = (el as HTMLElement).style.width;
  if (inlineW === 'fit-content' || inlineW === 'max-content') return 'hug';
  return 'fixed';
}
function getHeightMode(el: Element): SizeMode {
  const inlineH = (el as HTMLElement).style.height;
  if (inlineH === '100%') return 'fill';
  if (inlineH === 'fit-content' || inlineH === 'max-content') return 'hug';
  return 'fixed';
}

// ── Resize field ──────────────────────────────────────────────────────────────
interface ResizeFieldProps {
  label: string; value: string; mode: SizeMode; original?: string;
  onChange: (v: string) => void; onModeChange: (m: SizeMode) => void;
}
function ResizeField({ label, value, mode, original, onChange, onModeChange }: ResizeFieldProps) {
  const isChanged = original !== undefined && value !== original;
  const numVal = Math.round(parseFloat(value)) || 0;
  return (
    <div className={cn(
      'flex items-center h-[22px] px-1.5 rounded-md border gap-1 bg-panel-input-bg flex-1 min-w-0',
      isChanged ? 'border-panel-blue' : 'border-panel-border',
    )}>
      <span className="text-[10px] text-panel-text-label select-none shrink-0">{label}</span>
      {mode !== 'fixed' ? (
        <span className="flex-1 text-[11px] text-panel-text-secondary truncate">
          {mode === 'fill' ? 'Fill' : 'Hug'}
        </span>
      ) : (
        <input
          type="text" defaultValue={numVal} key={numVal}
          onBlur={e => onChange(`${parseFloat(e.target.value) || 0}px`)}
          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          className="flex-1 min-w-0 bg-transparent text-[11px] text-panel-text-primary focus:outline-none"
        />
      )}
      <div className="relative shrink-0 flex items-center">
        <AltArrowDownLinearIcon size={8} className="text-panel-text-label pointer-events-none" />
        <select
          value={mode} onChange={e => onModeChange(e.target.value as SizeMode)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        >
          <option value="fixed">Fixed</option>
          <option value="fill">Fill container</option>
          <option value="hug">Hug contents</option>
        </select>
      </div>
    </div>
  );
}

// ── Alignment dot grid ────────────────────────────────────────────────────────
// Rows = vertical axis (align-items for row, justify-content for column)
// Cols = horizontal axis (justify-content for row, align-items for column)
const ALIGN_VALUES = ['flex-start', 'center', 'flex-end'] as const;
type AlignVal = typeof ALIGN_VALUES[number];

// Small SVG representing item position inside a cell
function AlignCellIcon({ rowIdx, colIdx, active }: { rowIdx: number; colIdx: number; active: boolean }) {
  // A tiny 7×7 frame with a 2×2 filled square at the corresponding corner/edge/center
  const positions = [1, 2.5, 4] as const;
  const x = positions[colIdx];
  const y = positions[rowIdx];
  return (
    <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
      <rect x="0.5" y="0.5" width="6" height="6" rx="0.5"
        stroke={active ? 'currentColor' : 'currentColor'} strokeWidth="0.6" strokeOpacity={active ? 1 : 0.4} />
      <rect x={x} y={y} width="2" height="2" rx="0.3"
        fill={active ? 'currentColor' : 'currentColor'} fillOpacity={active ? 1 : 0.4} />
    </svg>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export function AutoLayoutSection({ el, get, getOrig, set }: Props) {
  const [aspectLocked, setAspectLocked] = useState(false);

  const flexDir        = get('flex-direction');
  const flexWrap       = get('flex-wrap');
  const width          = get('width');
  const height         = get('height');
  const overflow       = get('overflow');
  const gap            = get('gap') || get('row-gap') || '0px';
  const justifyContent = get('justify-content') || 'flex-start';
  const alignItems     = get('align-items') || 'flex-start';

  const isRow  = flexDir !== 'column';
  const wMode  = getWidthMode(el, get);
  const hMode  = getHeightMode(el);
  const wPx    = parseFloat(width)  || 0;
  const hPx    = parseFloat(height) || 0;
  const aspect = hPx > 0 ? wPx / hPx : 1;

  const gapChanged = getOrig('gap') !== undefined && gap !== getOrig('gap');

  function applyWidthMode(m: SizeMode, v = width) {
    if (m === 'fill')     { set('flex-grow', '1', 'Fill container'); set('width', 'auto', 'Fill container'); }
    else if (m === 'hug') { set('flex-grow', '0', 'Hug contents');   set('width', 'fit-content', 'Hug contents'); }
    else                  { set('flex-grow', '0', 'Fixed width');     set('width', v, 'Set width'); }
  }
  function applyHeightMode(m: SizeMode, v = height) {
    if (m === 'fill')     set('height', '100%',         'Fill container');
    else if (m === 'hug') set('height', 'fit-content',  'Hug contents');
    else                  set('height', v,              'Set height');
  }
  function onWidthChange(v: string) {
    applyWidthMode('fixed', v);
    if (aspectLocked && hPx > 0) set('height', `${Math.round(parseFloat(v) / aspect)}px`, 'Maintain aspect ratio');
  }
  function onHeightChange(v: string) {
    applyHeightMode('fixed', v);
    if (aspectLocked && wPx > 0) set('width', `${Math.round(parseFloat(v) * aspect)}px`, 'Maintain aspect ratio');
  }

  // Map grid row/col to CSS values based on flex direction
  function getAlignPair(rowV: AlignVal, colV: AlignVal) {
    return isRow
      ? { ai: rowV, jc: colV }   // row: rows=align-items, cols=justify-content
      : { ai: colV, jc: rowV };  // col: rows=justify-content, cols=align-items
  }
  function isCellActive(rowV: AlignVal, colV: AlignVal) {
    const { ai, jc } = getAlignPair(rowV, colV);
    return alignItems === ai && justifyContent === jc;
  }
  function handleAlignClick(rowV: AlignVal, colV: AlignVal) {
    const { ai, jc } = getAlignPair(rowV, colV);
    set('align-items',     ai, 'Change alignment');
    set('justify-content', jc, 'Change alignment');
  }

  const padT = get('padding-top');
  const padR = get('padding-right');
  const padB = get('padding-bottom');
  const padL = get('padding-left');

  return (
    <div className="px-3 pb-3 pt-1 space-y-2">

      {/* Flow */}
      <div className="space-y-1">
        <span className="text-[10px] text-panel-text-label block">Flow</span>
        <div className="flex gap-0.5">
          {FLOW_MODES.map(({ dir, wrap, title, Icon }) => {
            const active = flexDir === dir && (flexWrap === wrap || (!flexWrap && wrap === 'nowrap'));
            return (
              <button
                key={`${dir}-${wrap}`} title={title}
                onClick={() => { set('flex-direction', dir, `Set flow to ${title}`); set('flex-wrap', wrap, `Set wrap`); }}
                className={cn(
                  'flex items-center justify-center flex-1 h-[22px] rounded-md border transition-colors',
                  active
                    ? 'border-panel-blue bg-panel-changed-bg text-panel-blue'
                    : 'border-panel-border bg-panel-input-bg text-panel-text-secondary hover:bg-panel-row-hover',
                )}
              >
                <Icon />
              </button>
            );
          })}
        </div>
      </div>

      {/* Resizing */}
      <div className="space-y-1">
        <span className="text-[10px] text-panel-text-label block">Resizing</span>
        <div className="flex items-center gap-1">
          <ResizeField label="W" value={width} mode={wMode} original={getOrig('width')}
            onChange={onWidthChange} onModeChange={m => applyWidthMode(m)} />
          <button
            title={aspectLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
            onClick={() => setAspectLocked(l => !l)}
            className={cn(
              'flex items-center justify-center w-5 h-5 rounded border shrink-0 transition-colors',
              aspectLocked
                ? 'border-panel-blue bg-panel-changed-bg text-panel-blue'
                : 'border-panel-border bg-panel-input-bg text-panel-text-label hover:bg-panel-row-hover',
            )}
          >
            <LinkMinimalisticLinearIcon size={10} />
          </button>
          <ResizeField label="H" value={height} mode={hMode} original={getOrig('height')}
            onChange={onHeightChange} onModeChange={m => applyHeightMode(m)} />
        </div>
      </div>

      {/* Alignment + Gap — side by side */}
      <div className="space-y-1">
        <div className="flex items-center">
          <span className="text-[10px] text-panel-text-label flex-1">Alignment</span>
          <span className="text-[10px] text-panel-text-label">Gap</span>
        </div>
        <div className="flex items-start gap-2">

          {/* 3×3 alignment grid */}
          <div className="grid grid-cols-3 gap-0.5 p-1 rounded-md border border-panel-border bg-panel-input-bg">
            {ALIGN_VALUES.map((rowV, ri) =>
              ALIGN_VALUES.map((colV, ci) => {
                const active = isCellActive(rowV, colV);
                return (
                  <button
                    key={`${rowV}-${colV}`}
                    title={`${isRow ? rowV : colV} / ${isRow ? colV : rowV}`}
                    onClick={() => handleAlignClick(rowV, colV)}
                    className={cn(
                      'w-[18px] h-[18px] flex items-center justify-center rounded-sm transition-colors',
                      active
                        ? 'bg-panel-blue text-white'
                        : 'text-panel-text-label hover:bg-panel-row-hover',
                    )}
                  >
                    <AlignCellIcon rowIdx={ri} colIdx={ci} active={active} />
                  </button>
                );
              })
            )}
          </div>

          {/* Gap field */}
          <div className="flex-1">
            <div className={cn(
              'flex items-center h-[22px] px-1.5 rounded-md border gap-1.5 bg-panel-input-bg',
              gapChanged ? 'border-panel-blue' : 'border-panel-border',
            )}>
              {/* Gap icon */}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-panel-text-label shrink-0">
                <path d="M1 3h8M1 5h8M1 7h8" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
                <path d="M0 1v2M0 7v2M10 1v2M10 7v2" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                defaultValue={Math.round(parseFloat(gap)) || 0}
                key={gap}
                onBlur={e => set('gap', `${parseFloat(e.target.value) || 0}px`, 'Change gap')}
                onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                className="flex-1 min-w-0 bg-transparent text-[11px] text-panel-text-primary focus:outline-none"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Padding */}
      <div className="space-y-1">
        <span className="text-[10px] text-panel-text-label block">Padding</span>
        <div className="grid grid-cols-2 gap-1">
          {([
            { label: 'T', val: padT, prop: 'padding-top',    desc: 'Change top padding'    },
            { label: 'R', val: padR, prop: 'padding-right',  desc: 'Change right padding'  },
            { label: 'B', val: padB, prop: 'padding-bottom', desc: 'Change bottom padding' },
            { label: 'L', val: padL, prop: 'padding-left',   desc: 'Change left padding'   },
          ] as const).map(({ label, val, prop, desc }) => {
            const orig = getOrig(prop);
            const isChanged = orig !== undefined && val !== orig;
            const numVal = Math.round(parseFloat(val)) || 0;
            return (
              <div key={prop} className={cn(
                'flex items-center h-[22px] px-1.5 rounded-md border gap-1 bg-panel-input-bg',
                isChanged ? 'border-panel-blue' : 'border-panel-border',
              )}>
                <span className="text-[10px] text-panel-text-label select-none shrink-0">{label}</span>
                <input
                  type="text" defaultValue={numVal} key={numVal}
                  onBlur={e => set(prop, `${parseFloat(e.target.value) || 0}px`, desc)}
                  onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                  className="flex-1 min-w-0 bg-transparent text-[11px] text-panel-text-primary focus:outline-none"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Margin */}
      <div className="space-y-1">
        <span className="text-[10px] text-panel-text-label block">Margin</span>
        <div className="grid grid-cols-2 gap-1">
          {([
            { label: 'T', prop: 'margin-top',    desc: 'Change top margin'    },
            { label: 'R', prop: 'margin-right',  desc: 'Change right margin'  },
            { label: 'B', prop: 'margin-bottom', desc: 'Change bottom margin' },
            { label: 'L', prop: 'margin-left',   desc: 'Change left margin'   },
          ] as const).map(({ label, prop, desc }) => {
            const val = get(prop);
            const orig = getOrig(prop);
            const isChanged = orig !== undefined && val !== orig;
            const numVal = Math.round(parseFloat(val)) || 0;
            return (
              <div key={prop} className={cn(
                'flex items-center h-[22px] px-1.5 rounded-md border gap-1 bg-panel-input-bg',
                isChanged ? 'border-panel-blue' : 'border-panel-border',
              )}>
                <span className="text-[10px] text-panel-text-label select-none shrink-0">{label}</span>
                <input
                  type="text" defaultValue={numVal} key={numVal}
                  onBlur={e => set(prop, `${parseFloat(e.target.value) || 0}px`, desc)}
                  onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                  className="flex-1 min-w-0 bg-transparent text-[11px] text-panel-text-primary focus:outline-none"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Clip content */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={overflow === 'hidden' || overflow === 'clip'}
          onChange={e => set('overflow', e.target.checked ? 'hidden' : 'visible', e.target.checked ? 'Clip content' : 'Show overflow')}
          className="w-3 h-3 rounded shrink-0"
          style={{ accentColor: 'var(--panel-accent)' }}
        />
        <span className="text-[11px] text-panel-text-primary">Clip content</span>
      </label>

    </div>
  );
}
