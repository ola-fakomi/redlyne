import React from 'react';
import { NumericField } from '../controls/NumericField';
import { cn } from '@/lib/utils';

interface Props {
  get: (prop: string) => string;
  getOrig: (prop: string) => string | undefined;
  set: (prop: string, val: string, desc: string) => void;
}

const WEIGHTS = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];

const TEXT_ALIGNS = [
  { value: 'left',    icon: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <line x1="1" y1="3" x2="11" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="1" y1="6" x2="8"  y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="1" y1="9" x2="10" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )},
  { value: 'center',  icon: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <line x1="1"   y1="3" x2="11"  y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="2.5" y1="6" x2="9.5" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="1"   y1="9" x2="11"  y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )},
  { value: 'right',   icon: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <line x1="1" y1="3"  x2="11" y2="3"  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="4" y1="6"  x2="11" y2="6"  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="2" y1="9"  x2="11" y2="9"  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )},
  { value: 'justify', icon: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <line x1="1" y1="3" x2="11" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="1" y1="9" x2="11" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )},
];

const selectCls = 'flex-1 h-7 rounded-md border border-panel-border bg-panel-input-bg text-[11px] font-panel text-panel-text-primary px-1.5 focus:outline-none focus:ring-1 focus:ring-panel-blue';

export function TypographySection({ get, getOrig, set }: Props) {
  const family    = get('font-family');
  const size      = get('font-size');
  const weight    = get('font-weight');
  const lineH     = get('line-height');
  const letSp     = get('letter-spacing');
  const textAlign = get('text-align');

  return (
    <div className="px-3 pb-3 pt-1 space-y-1.5">
      {/* Font family */}
      <input
        value={family}
        onChange={e => set('font-family', e.target.value, 'Change font family')}
        title={family}
        placeholder="Font family"
        className="w-full h-7 px-2 rounded-md border border-panel-border bg-panel-input-bg text-[11px] font-panel text-panel-text-primary focus:outline-none focus:ring-1 focus:ring-panel-blue"
      />

      {/* Weight + Size */}
      <div className="grid grid-cols-2 gap-1">
        <select
          value={weight}
          onChange={e => set('font-weight', e.target.value, 'Change font weight')}
          className={selectCls}
        >
          {WEIGHTS.map(w => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
        <NumericField
          label="Size"
          value={size}
          original={getOrig('font-size')}
          onChange={v => set('font-size', v, parseFloat(v) > parseFloat(size) ? 'Increase font size' : 'Reduce font size')}
        />
      </div>

      {/* Line height + letter spacing — with sub-labels */}
      <div className="grid grid-cols-2 gap-1">
        <div className="space-y-0.5">
          <span className="text-[10px] text-panel-text-label block">Line</span>
          <NumericField
            label="LH"
            value={lineH}
            original={getOrig('line-height')}
            onChange={v => set('line-height', v, parseFloat(v) > parseFloat(lineH) ? 'Increase line height' : 'Reduce line height')}
          />
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-panel-text-label block">Letter</span>
          <NumericField
            label="LS"
            value={letSp === 'normal' ? '0px' : letSp}
            original={getOrig('letter-spacing')}
            onChange={v => set('letter-spacing', v, 'Change letter spacing')}
          />
        </div>
      </div>

      {/* Text alignment buttons */}
      <div className="flex gap-0.5">
        {TEXT_ALIGNS.map(a => (
          <button
            key={a.value}
            title={`${a.value} align`}
            onClick={() => set('text-align', a.value, `Align text to ${a.value}`)}
            className={cn(
              'flex items-center justify-center flex-1 h-7 rounded-md border transition-colors',
              textAlign === a.value || (a.value === 'left' && (textAlign === 'start' || textAlign === ''))
                ? 'border-panel-blue bg-panel-changed-bg text-panel-blue'
                : 'border-panel-border bg-panel-input-bg text-panel-text-secondary hover:bg-panel-row-hover',
            )}
          >
            {a.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
