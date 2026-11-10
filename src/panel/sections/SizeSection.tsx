import React from 'react';
import { NumericField } from '../controls/NumericField';

interface Props {
  el: Element;
  get: (prop: string) => string;
  getOrig: (prop: string) => string | undefined;
  set: (prop: string, val: string, desc: string) => void;
}

export function SizeSection({ el, get, getOrig, set }: Props) {
  const width  = get('width');
  const height = get('height');

  return (
    <div className="px-3 pb-2 pt-1">
      <div className="grid grid-cols-2 gap-1">
        <NumericField
          label="W"
          value={width === 'fit-content' ? '' : width}
          original={getOrig('width')}
          onChange={v => set('width', v, parseFloat(v) > parseFloat(width) ? 'Increase width' : 'Reduce width')}
        />
        <NumericField
          label="H"
          value={height === 'fit-content' ? '' : height}
          original={getOrig('height')}
          onChange={v => set('height', v, parseFloat(v) > parseFloat(height) ? 'Increase height' : 'Reduce height')}
        />
      </div>
    </div>
  );
}
