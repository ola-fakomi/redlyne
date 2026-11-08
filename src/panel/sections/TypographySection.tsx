import React from 'react';
import { NumericField } from '../controls/NumericField';
import { Input } from '@/components/ui/input';

interface Props {
  get: (prop: string) => string;
  getOrig: (prop: string) => string | undefined;
  set: (prop: string, val: string, desc: string) => void;
}

const WEIGHTS = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];

export function TypographySection({ get, getOrig, set }: Props) {
  const family = get('font-family');
  const size = get('font-size');
  const weight = get('font-weight');
  const lineH = get('line-height');
  const letSp = get('letter-spacing');

  return (
    <div className="p-2 space-y-1.5">
      {/* Font family */}
      <div className="flex items-center gap-1">
        <span className="text-panel-xs text-panel-text-label shrink-0 w-[40px]">Family</span>
        <Input
          value={family}
          onChange={e => set('font-family', e.target.value, 'Change font family')}
          className="flex-1 text-[10px]"
          title={family}
        />
      </div>

      {/* Size + Weight row */}
      <div className="grid grid-cols-2 gap-1">
        <NumericField
          label="Size"
          value={size}
          original={getOrig('font-size')}
          onChange={v => set('font-size', v, parseFloat(v) > parseFloat(size) ? 'Increase font size' : 'Reduce font size')}
        />
        <div className="flex items-center gap-1">
          <span className="text-panel-xs text-panel-text-label shrink-0 w-[18px] text-right">W</span>
          <select
            value={weight}
            onChange={e => set('font-weight', e.target.value, 'Change font weight')}
            className="flex-1 h-[22px] rounded border border-panel-border bg-white text-panel-sm font-panel text-panel-text-primary px-1 focus:outline-none focus:ring-1 focus:ring-panel-blue"
          >
            {WEIGHTS.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Line height + letter spacing */}
      <div className="grid grid-cols-2 gap-1">
        <NumericField
          label="LH"
          value={lineH}
          original={getOrig('line-height')}
          onChange={v => set('line-height', v, parseFloat(v) > parseFloat(lineH) ? 'Increase line height' : 'Reduce line height')}
        />
        <NumericField
          label="LS"
          value={letSp === 'normal' ? '0px' : letSp}
          original={getOrig('letter-spacing')}
          onChange={v => set('letter-spacing', v, 'Change letter spacing')}
        />
      </div>
    </div>
  );
}
