import React from 'react';
import { NumericField } from '../controls/NumericField';
import { cn } from '@/lib/utils';

interface Props {
  el: Element;
  get: (prop: string) => string;
  getOrig: (prop: string) => string | undefined;
  set: (prop: string, val: string, desc: string) => void;
}

// 9-cell alignment grid: [justify-content, align-items]
const ALIGN_CELLS: { jc: string; ai: string }[] = [
  { jc: 'flex-start', ai: 'flex-start' },
  { jc: 'center',     ai: 'flex-start' },
  { jc: 'flex-end',   ai: 'flex-start' },
  { jc: 'flex-start', ai: 'center'     },
  { jc: 'center',     ai: 'center'     },
  { jc: 'flex-end',   ai: 'center'     },
  { jc: 'flex-start', ai: 'flex-end'   },
  { jc: 'center',     ai: 'flex-end'   },
  { jc: 'flex-end',   ai: 'flex-end'   },
];

// Direction icons (SVG-ish unicode stand-ins)
const DIR_BUTTONS = [
  { value: 'row',    title: 'Horizontal',
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="1" y="4" width="2" height="4" rx="0.5" fill="currentColor"/>
        <rect x="5" y="2" width="2" height="8" rx="0.5" fill="currentColor"/>
        <rect x="9" y="4" width="2" height="4" rx="0.5" fill="currentColor"/>
      </svg>
    ),
  },
  { value: 'column', title: 'Vertical',
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="4" y="1" width="4" height="2" rx="0.5" fill="currentColor"/>
        <rect x="2" y="5" width="8" height="2" rx="0.5" fill="currentColor"/>
        <rect x="4" y="9" width="4" height="2" rx="0.5" fill="currentColor"/>
      </svg>
    ),
  },
];

export function AutoLayoutSection({ el, get, getOrig, set }: Props) {
  const flexDir = get('flex-direction');
  const isRow   = !flexDir.includes('column');
  const jc      = get('justify-content');
  const ai      = get('align-items');
  const gap     = get('gap') || get('row-gap') || '0px';
  const padT    = get('padding-top');
  const padR    = get('padding-right');
  const padB    = get('padding-bottom');
  const padL    = get('padding-left');

  const currentDir = isRow ? 'row' : 'column';

  return (
    <div className="px-3 pb-3 pt-1 space-y-2">
      {/* Direction + alignment grid in one row */}
      <div className="flex items-start gap-2">
        {/* Direction + gap stacked */}
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1">
            {DIR_BUTTONS.map(d => (
              <button
                key={d.value}
                title={d.title}
                onClick={() => {
                  set('flex-direction', d.value, d.value === 'row' ? 'Arrange children horizontally' : 'Arrange children vertically');
                }}
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-md border transition-colors',
                  currentDir === d.value
                    ? 'border-panel-blue bg-panel-changed-bg text-panel-blue'
                    : 'border-panel-border bg-panel-input-bg text-panel-text-secondary hover:bg-panel-row-hover',
                )}
              >
                {d.icon}
              </button>
            ))}
          </div>
          {/* Gap */}
          <NumericField
            label="Gap"
            value={gap}
            original={getOrig('gap')}
            onChange={v => set('gap', v, parseFloat(v) > parseFloat(gap) ? 'Increase space between items' : 'Reduce space between items')}
          />
        </div>

        {/* 3×3 alignment grid */}
        <div className="grid grid-cols-3 gap-px border border-panel-border rounded-md bg-panel-border w-[66px] h-[66px] shrink-0 overflow-hidden">
          {ALIGN_CELLS.map((cell, i) => {
            const active = cell.jc === jc && cell.ai === ai;
            return (
              <button
                key={i}
                title={`justify: ${cell.jc}, align: ${cell.ai}`}
                onClick={() => {
                  set('justify-content', cell.jc, `Align children`);
                  set('align-items', cell.ai, `Align children`);
                }}
                className={cn(
                  'flex items-center justify-center',
                  active
                    ? 'bg-panel-blue'
                    : 'bg-panel-input-bg hover:bg-panel-row-hover',
                )}
              >
                {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Padding — 2×2 grid */}
      <div className="space-y-1">
        <span className="text-[10px] text-panel-text-label block">Padding</span>
        <div className="grid grid-cols-2 gap-1">
          <NumericField label="T" value={padT} original={getOrig('padding-top')}
            onChange={v => set('padding-top', v, 'Change top padding')} />
          <NumericField label="R" value={padR} original={getOrig('padding-right')}
            onChange={v => set('padding-right', v, 'Change right padding')} />
          <NumericField label="B" value={padB} original={getOrig('padding-bottom')}
            onChange={v => set('padding-bottom', v, 'Change bottom padding')} />
          <NumericField label="L" value={padL} original={getOrig('padding-left')}
            onChange={v => set('padding-left', v, 'Change left padding')} />
        </div>
      </div>
    </div>
  );
}
