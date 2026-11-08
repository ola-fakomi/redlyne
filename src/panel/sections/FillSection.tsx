import React from 'react';
import { ColorField } from '../controls/ColorField';

interface Props {
  el: Element;
  get: (prop: string) => string;
  getOrig: (prop: string) => string | undefined;
  set: (prop: string, val: string, desc: string) => void;
}

export function FillSection({ el, get, getOrig, set }: Props) {
  const isText = el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE;
  const bg = get('background-color');
  const color = get('color');

  return (
    <div className="p-2 space-y-1.5">
      <ColorField
        label="Fill"
        value={bg}
        original={getOrig('background-color')}
        onChange={v => set('background-color', v, 'Change background color')}
      />
      {(isText || el.tagName === 'P' || el.tagName === 'SPAN' || el.tagName === 'H1' ||
        el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'H4' ||
        el.tagName === 'H5' || el.tagName === 'H6' || el.tagName === 'A' ||
        el.tagName === 'BUTTON' || el.tagName === 'LABEL') && (
        <ColorField
          label="Color"
          value={color}
          original={getOrig('color')}
          onChange={v => set('color', v, 'Change text color')}
        />
      )}
    </div>
  );
}
