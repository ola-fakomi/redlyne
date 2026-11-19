import React from 'react';
import { NumericField } from '../controls/NumericField';
import { cn } from '@/lib/utils';

interface Props {
  el: Element;
  get: (prop: string) => string;
  getOrig: (prop: string) => string | undefined;
  set: (prop: string, val: string, desc: string) => void;
}

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

export function SizeSection({ el, get, getOrig, set }: Props) {
  const flexDir  = get('flex-direction');
  const flexWrap = get('flex-wrap');
  const width    = get('width');
  const height   = get('height');
  const overflow = get('overflow');

  function applyFlow(dir: string, wrap: string, title: string) {
    // Clicking a flow button on a plain div also converts it to flex
    set('display', 'flex', 'Add auto layout');
    set('flex-direction', dir, `Set flow to ${title}`);
    set('flex-wrap', wrap, `Set wrap to ${wrap}`);
  }

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
                key={`${dir}-${wrap}`}
                title={title}
                onClick={() => applyFlow(dir, wrap, title)}
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

      {/* Dimensions */}
      <div className="space-y-1">
        <span className="text-[10px] text-panel-text-label block">Dimensions</span>
        <div className="grid grid-cols-2 gap-1">
          <NumericField
            label="W"
            value={width === 'fit-content' ? '0px' : width}
            original={getOrig('width')}
            onChange={v => set('width', v, parseFloat(v) > parseFloat(width) ? 'Increase width' : 'Reduce width')}
          />
          <NumericField
            label="H"
            value={height === 'fit-content' ? '0px' : height}
            original={getOrig('height')}
            onChange={v => set('height', v, parseFloat(v) > parseFloat(height) ? 'Increase height' : 'Reduce height')}
          />
        </div>
      </div>

      {/* Padding */}
      <div className="space-y-1">
        <span className="text-[10px] text-panel-text-label block">Padding</span>
        <div className="grid grid-cols-2 gap-1">
          {([
            { label: 'T', prop: 'padding-top',    desc: 'Change top padding'    },
            { label: 'R', prop: 'padding-right',  desc: 'Change right padding'  },
            { label: 'B', prop: 'padding-bottom', desc: 'Change bottom padding' },
            { label: 'L', prop: 'padding-left',   desc: 'Change left padding'   },
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
