import React from 'react';
import { NumericField } from '../controls/NumericField';

interface Props {
  get: (prop: string) => string;
  getOrig: (prop: string) => string | undefined;
  set: (prop: string, val: string, desc: string) => void;
}

export function SpacingSection({ get, getOrig, set }: Props) {
  const mt = get('margin-top');
  const mr = get('margin-right');
  const mb = get('margin-bottom');
  const ml = get('margin-left');

  return (
    <div className="p-2 space-y-1.5">
      <span className="text-panel-xs text-panel-text-label block">Margin</span>
      <div className="grid grid-cols-2 gap-1">
        <NumericField label="T" value={mt} original={getOrig('margin-top')}
          onChange={v => set('margin-top', v, parseFloat(v) > parseFloat(mt) ? 'Increase outer margin on the top' : 'Reduce outer margin on the top')} />
        <NumericField label="R" value={mr} original={getOrig('margin-right')}
          onChange={v => set('margin-right', v, parseFloat(v) > parseFloat(mr) ? 'Increase outer margin on the right' : 'Reduce outer margin on the right')} />
        <NumericField label="B" value={mb} original={getOrig('margin-bottom')}
          onChange={v => set('margin-bottom', v, parseFloat(v) > parseFloat(mb) ? 'Increase outer margin on the bottom' : 'Reduce outer margin on the bottom')} />
        <NumericField label="L" value={ml} original={getOrig('margin-left')}
          onChange={v => set('margin-left', v, parseFloat(v) > parseFloat(ml) ? 'Increase outer margin on the left' : 'Reduce outer margin on the left')} />
      </div>
    </div>
  );
}
