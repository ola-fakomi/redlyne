import React from 'react';
import { NumericField } from '../controls/NumericField';
import { cn } from '@/lib/utils';

interface Props {
  el: Element;
  get: (prop: string) => string;
  getOrig: (prop: string) => string | undefined;
  set: (prop: string, val: string, desc: string) => void;
}

const DIRECTIONS = [
  { label: 'None', value: 'block', icon: '—' },
  { label: 'Horizontal', value: 'row', icon: '→' },
  { label: 'Vertical', value: 'column', icon: '↓' },
];

const ALIGN_GRID: { jc: string; ai: string; label: string }[] = [
  { jc: 'flex-start', ai: 'flex-start', label: '↖' },
  { jc: 'center',     ai: 'flex-start', label: '↑' },
  { jc: 'flex-end',   ai: 'flex-start', label: '↗' },
  { jc: 'flex-start', ai: 'center',     label: '←' },
  { jc: 'center',     ai: 'center',     label: '·' },
  { jc: 'flex-end',   ai: 'center',     label: '→' },
  { jc: 'flex-start', ai: 'flex-end',   label: '↙' },
  { jc: 'center',     ai: 'flex-end',   label: '↓' },
  { jc: 'flex-end',   ai: 'flex-end',   label: '↘' },
];

export function AutoLayoutSection({ el, get, getOrig, set }: Props) {
  const display = get('display');
  const isFlex = display === 'flex' || display === 'inline-flex';
  const flexDir = get('flex-direction');
  const isRow = !flexDir.includes('column');

  const currentDir = !isFlex ? 'block' : isRow ? 'row' : 'column';
  const jc = get('justify-content');
  const ai = get('align-items');
  const gap = get('gap') || get('row-gap') || '0px';

  const padT = get('padding-top');
  const padR = get('padding-right');
  const padB = get('padding-bottom');
  const padL = get('padding-left');

  function setDirection(dir: string) {
    if (dir === 'block') {
      set('display', 'block', 'Remove auto layout');
    } else {
      set('display', 'flex', dir === 'row' ? 'Arrange children horizontally' : 'Arrange children vertically');
      set('flex-direction', dir, dir === 'row' ? 'Arrange children horizontally' : 'Arrange children vertically');
    }
  }

  function setAlign(jcVal: string, aiVal: string) {
    set('justify-content', jcVal, `Align children to ${jcVal}`);
    set('align-items', aiVal, `Align children to ${aiVal}`);
  }

  return (
    <div className="p-2 space-y-1.5">
      {/* Direction */}
      <div className="flex items-center gap-1">
        <span className="text-panel-xs text-panel-text-label w-[40px] shrink-0">Layout</span>
        <div className="flex gap-0.5">
          {DIRECTIONS.map(d => (
            <button
              key={d.value}
              title={d.label}
              onClick={() => setDirection(d.value)}
              className={cn(
                'h-[22px] w-[22px] rounded text-panel-sm font-panel border transition-colors',
                currentDir === d.value
                  ? 'border-panel-blue bg-panel-changed-bg text-panel-blue'
                  : 'border-panel-border bg-white text-panel-text-secondary hover:bg-panel-row-hover',
              )}
            >
              {d.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Alignment grid — only shown when flex */}
      {isFlex && (
        <div className="flex items-start gap-1">
          <span className="text-panel-xs text-panel-text-label w-[40px] shrink-0 mt-0.5">Align</span>
          <div className="grid grid-cols-3 gap-px border border-panel-border rounded bg-panel-border w-[66px] h-[66px]">
            {ALIGN_GRID.map((cell, i) => {
              const active = cell.jc === jc && cell.ai === ai;
              return (
                <button
                  key={i}
                  title={`justify: ${cell.jc}, align: ${cell.ai}`}
                  onClick={() => setAlign(cell.jc, cell.ai)}
                  className={cn(
                    'flex items-center justify-center text-[9px] transition-colors',
                    active ? 'bg-panel-blue text-white' : 'bg-white hover:bg-panel-row-hover text-panel-text-label',
                  )}
                >
                  {cell.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Gap */}
      {isFlex && (
        <NumericField
          label="Gap"
          value={gap}
          original={getOrig('gap')}
          onChange={v => set('gap', v, parseFloat(v) > parseFloat(gap) ? 'Increase space between child items' : 'Reduce space between child items')}
        />
      )}

      {/* Padding */}
      <div className="space-y-0.5">
        <span className="text-panel-xs text-panel-text-label block">Padding</span>
        <div className="grid grid-cols-2 gap-1">
          <NumericField label="T" value={padT} original={getOrig('padding-top')}
            onChange={v => set('padding-top', v, parseFloat(v) > parseFloat(padT) ? 'Increase inner padding on the top' : 'Reduce inner padding on the top')} />
          <NumericField label="R" value={padR} original={getOrig('padding-right')}
            onChange={v => set('padding-right', v, parseFloat(v) > parseFloat(padR) ? 'Increase inner padding on the right' : 'Reduce inner padding on the right')} />
          <NumericField label="B" value={padB} original={getOrig('padding-bottom')}
            onChange={v => set('padding-bottom', v, parseFloat(v) > parseFloat(padB) ? 'Increase inner padding on the bottom' : 'Reduce inner padding on the bottom')} />
          <NumericField label="L" value={padL} original={getOrig('padding-left')}
            onChange={v => set('padding-left', v, parseFloat(v) > parseFloat(padL) ? 'Increase inner padding on the left' : 'Reduce inner padding on the left')} />
        </div>
      </div>
    </div>
  );
}
