import React from 'react';
import { ColorField } from '../controls/ColorField';
import { NumericField } from '../controls/NumericField';
import { cn } from '@/lib/utils';

interface Props {
  get: (prop: string) => string;
  getOrig: (prop: string) => string | undefined;
  set: (prop: string, val: string, desc: string) => void;
}

const STYLES = ['none', 'solid', 'dashed', 'dotted'];

export function StrokeSection({ get, getOrig, set }: Props) {
  const color = get('border-color');
  const width = get('border-width');
  const style = get('border-style');

  return (
    <div className="px-3 pb-3 pt-1 space-y-1">
      {/* Color row */}
      <ColorField
        value={color}
        original={getOrig('border-color')}
        onChange={v => set('border-color', v, 'Change border color')}
      />

      {/* Width + style */}
      <div className="flex items-center gap-1">
        <div className="w-[72px] shrink-0">
          <NumericField
            label="W"
            value={width}
            original={getOrig('border-width')}
            onChange={v => set('border-width', v, 'Change border width')}
          />
        </div>
        <select
          value={style}
          onChange={e => set('border-style', e.target.value, 'Change border style')}
          className="flex-1 h-7 rounded-md border border-panel-border bg-panel-input-bg text-[11px] font-panel text-panel-text-primary px-1.5 focus:outline-none focus:ring-1 focus:ring-panel-blue"
        >
          {STYLES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
