import React from 'react';
import { ColorField } from '../controls/ColorField';

interface Props {
  el: Element;
  get: (prop: string) => string;
  getOrig: (prop: string) => string | undefined;
  set: (prop: string, val: string, desc: string) => void;
}

const TEXT_TAGS = new Set(['P','SPAN','H1','H2','H3','H4','H5','H6','A','BUTTON','LABEL','LI']);

export function FillSection({ el, get, getOrig, set }: Props) {
  const isTextEl = TEXT_TAGS.has(el.tagName) || (el.childElementCount === 0 && (el.textContent?.trim().length ?? 0) > 0);
  const bg    = get('background-color');
  const color = get('color');

  return (
    <div className="px-3 pb-3 pt-1 space-y-1">
      <ColorField
        value={bg}
        original={getOrig('background-color')}
        onChange={v => set('background-color', v, 'Change background color')}
      />
      {isTextEl && (
        <ColorField
          value={color}
          original={getOrig('color')}
          onChange={v => set('color', v, 'Change text color')}
        />
      )}
    </div>
  );
}
