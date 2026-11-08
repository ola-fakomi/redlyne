import React from 'react';
import { NumericField } from '../controls/NumericField';
import { ColorField } from '../controls/ColorField';

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
    <div className="p-2 space-y-1.5">
      <ColorField
        label="Stroke"
        value={color}
        original={getOrig('border-color')}
        onChange={v => set('border-color', v, 'Change border color')}
      />
      <div className="flex items-center gap-1">
        <NumericField
          label="W"
          value={width}
          original={getOrig('border-width')}
          onChange={v => set('border-width', v, 'Change border width')}
        />
        <select
          value={style}
          onChange={e => set('border-style', e.target.value, 'Change border style')}
          className="h-[22px] flex-1 rounded border border-panel-border bg-white text-panel-sm font-panel text-panel-text-primary px-1 focus:outline-none focus:ring-1 focus:ring-panel-blue"
        >
          {STYLES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
