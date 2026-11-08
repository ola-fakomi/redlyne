import React from 'react';
import { NumericField } from '../controls/NumericField';
import { cn } from '@/lib/utils';

interface Props {
  el: Element;
  get: (prop: string) => string;
  getOrig: (prop: string) => string | undefined;
  set: (prop: string, val: string, desc: string) => void;
}

type SizeMode = 'fixed' | 'hug' | 'fill';

function detectMode(val: string, flex: string): SizeMode {
  if (val === 'fit-content' || val.includes('fit-content')) return 'hug';
  if (flex === '1 1 0%' || flex === '1' || val === '100%') return 'fill';
  return 'fixed';
}

const MODE_LABELS: Record<SizeMode, string> = { fixed: 'Fixed', hug: 'Hug', fill: 'Fill' };

function ModePicker({
  mode, onChange,
}: {
  mode: SizeMode;
  onChange: (m: SizeMode) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {(['fixed', 'hug', 'fill'] as SizeMode[]).map(m => (
        <button
          key={m}
          title={MODE_LABELS[m]}
          onClick={() => onChange(m)}
          className={cn(
            'h-[18px] px-1.5 rounded text-[9px] font-panel border transition-colors',
            mode === m
              ? 'border-panel-blue bg-panel-changed-bg text-panel-blue'
              : 'border-panel-border bg-white text-panel-text-label hover:bg-panel-row-hover',
          )}
        >
          {m === 'fixed' ? '—' : m === 'hug' ? '⤢' : '↔'}
        </button>
      ))}
    </div>
  );
}

export function SizeSection({ el, get, getOrig, set }: Props) {
  const width = get('width');
  const height = get('height');
  const flexSelf = get('align-self');
  const flexBasis = get('flex');

  const wMode = detectMode(width, flexBasis);
  const hMode = detectMode(height, flexBasis);

  function applyWidth(mode: SizeMode) {
    const rect = el.getBoundingClientRect();
    if (mode === 'fixed') set('width', `${Math.round(rect.width)}px`, 'Set fixed width');
    else if (mode === 'hug') set('width', 'fit-content', 'Make width fit its content (Hug)');
    else set('width', '100%', 'Make width fill its container (Fill)');
  }

  function applyHeight(mode: SizeMode) {
    const rect = el.getBoundingClientRect();
    if (mode === 'fixed') set('height', `${Math.round(rect.height)}px`, 'Set fixed height');
    else if (mode === 'hug') set('height', 'fit-content', 'Make height fit its content (Hug)');
    else set('height', '100%', 'Make height fill its container (Fill)');
  }

  return (
    <div className="p-2 space-y-1.5">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-panel-xs text-panel-text-label">W</span>
          <ModePicker mode={wMode} onChange={applyWidth} />
        </div>
        <NumericField
          label="W"
          value={width === 'fit-content' ? '' : width}
          original={getOrig('width')}
          disabled={wMode !== 'fixed'}
          onChange={v => set('width', v, parseFloat(v) > parseFloat(width) ? 'Increase width' : 'Reduce width')}
        />
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-panel-xs text-panel-text-label">H</span>
          <ModePicker mode={hMode} onChange={applyHeight} />
        </div>
        <NumericField
          label="H"
          value={height === 'fit-content' ? '' : height}
          original={getOrig('height')}
          disabled={hMode !== 'fixed'}
          onChange={v => set('height', v, parseFloat(v) > parseFloat(height) ? 'Increase height' : 'Reduce height')}
        />
      </div>
    </div>
  );
}
