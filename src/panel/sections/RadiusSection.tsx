import React from 'react';
import { NumericField } from '../controls/NumericField';

interface Props {
  get: (prop: string) => string;
  getOrig: (prop: string) => string | undefined;
  set: (prop: string, val: string, desc: string) => void;
}

export function RadiusSection({ get, getOrig, set }: Props) {
  const tl = get('border-top-left-radius');
  const tr = get('border-top-right-radius');
  const br = get('border-bottom-right-radius');
  const bl = get('border-bottom-left-radius');

  // If all 4 are the same, show linked
  const allSame = tl === tr && tr === br && br === bl;

  function setAll(v: string) {
    set('border-top-left-radius', v, 'Change corner radius on all corners');
    set('border-top-right-radius', v, 'Change corner radius on all corners');
    set('border-bottom-right-radius', v, 'Change corner radius on all corners');
    set('border-bottom-left-radius', v, 'Change corner radius on all corners');
  }

  return (
    <div className="p-2 space-y-1.5">
      {allSame ? (
        <NumericField
          label="R"
          value={tl}
          original={getOrig('border-top-left-radius')}
          onChange={setAll}
        />
      ) : (
        <div className="grid grid-cols-2 gap-1">
          <NumericField label="TL" value={tl} original={getOrig('border-top-left-radius')}
            onChange={v => set('border-top-left-radius', v, 'Change corner radius on top-left corner')} />
          <NumericField label="TR" value={tr} original={getOrig('border-top-right-radius')}
            onChange={v => set('border-top-right-radius', v, 'Change corner radius on top-right corner')} />
          <NumericField label="BR" value={br} original={getOrig('border-bottom-right-radius')}
            onChange={v => set('border-bottom-right-radius', v, 'Change corner radius on bottom-right corner')} />
          <NumericField label="BL" value={bl} original={getOrig('border-bottom-left-radius')}
            onChange={v => set('border-bottom-left-radius', v, 'Change corner radius on bottom-left corner')} />
        </div>
      )}
    </div>
  );
}
