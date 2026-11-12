import React from 'react';
import { AlignLeftLinearIcon, AlignHorizontalCenterLinearIcon, AlignRightLinearIcon, AlignHorizontalSpacingLinearIcon } from '@solar-icons/react';
import { NumericField } from '../controls/NumericField';
import { cn } from '@/lib/utils';

interface Props {
  el: Element;
  get: (prop: string) => string;
  getOrig: (prop: string) => string | undefined;
  set: (prop: string, val: string, desc: string) => void;
  onTextChange: (text: string) => void;
}

const WEIGHTS = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];

const TEXT_ALIGNS = [
  { value: 'left',    icon: <AlignLeftLinearIcon size={12} /> },
  { value: 'center',  icon: <AlignHorizontalCenterLinearIcon size={12} /> },
  { value: 'right',   icon: <AlignRightLinearIcon size={12} /> },
  { value: 'justify', icon: <AlignHorizontalSpacingLinearIcon size={12} /> },
];

const selectCls = 'flex-1 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-[11px] font-panel text-panel-text-primary px-1.5 focus:outline-none focus:ring-1 focus:ring-panel-blue';

export function TypographySection({ el, get, getOrig, set, onTextChange }: Props) {
  const family    = get('font-family');
  const size      = get('font-size');
  const weight    = get('font-weight');
  const lineH     = get('line-height');
  const letSp     = get('letter-spacing');
  const textAlign = get('text-align');

  const textContent = Array.from(el.childNodes)
    .filter(n => n.nodeType === Node.TEXT_NODE)
    .map(n => n.textContent ?? '')
    .join('') || el.textContent?.trim() || '';

  return (
    <div className="px-3 pb-3 pt-1 space-y-1.5">
      {/* Text content */}
      <textarea
        key={textContent}
        defaultValue={textContent}
        rows={2}
        onBlur={e => onTextChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); (e.target as HTMLTextAreaElement).blur(); } }}
        placeholder="Text content…"
        className="w-full px-2 py-1.5 rounded-md border border-panel-border bg-panel-input-bg text-[11px] font-panel text-panel-text-primary focus:outline-none focus:ring-1 focus:ring-panel-blue resize-none leading-relaxed placeholder:text-panel-text-label"
      />

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
