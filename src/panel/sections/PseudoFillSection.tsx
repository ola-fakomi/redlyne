/**
 * Detects ::before / ::after pseudo-elements that act as scrims (visible background)
 * and renders an inline color editor for each one found.
 */

import { useRef } from 'react';
import { applyPseudoPreview } from '@/engine/overlay';
import { recordChange } from '@/engine/changeTracker';
import { ColorField } from '../controls/ColorField';

interface Props {
  el: Element;
  onChangeApplied: () => void;
}

type Pseudo = '::before' | '::after';

function getPseudoBg(el: Element, pseudo: Pseudo): string | null {
  try {
    const style = getComputedStyle(el, pseudo);
    const content = style.getPropertyValue('content').trim();
    if (content === 'none' || content === '') return null;
    const display = style.getPropertyValue('display').trim();
    if (display === 'none') return null;
    const bg = style.getPropertyValue('background-color').trim();
    const bgImg = style.getPropertyValue('background-image').trim();
    // Not a visible scrim: skip
    if ((bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') && bgImg === 'none') return null;
    return bg;
  } catch {
    return null;
  }
}

export function PseudoFillSection({ el, onChangeApplied }: Props) {
  const origCache = useRef<Record<string, string>>({});

  const beforeBg = getPseudoBg(el, '::before');
  const afterBg  = getPseudoBg(el, '::after');

  if (!beforeBg && !afterBg) return null;

  function setPseudo(pseudo: Pseudo, prop: string, val: string) {
    const key = `${pseudo}:${prop}`;
    if (origCache.current[key] === undefined) {
      origCache.current[key] = getComputedStyle(el, pseudo).getPropertyValue(prop).trim();
    }
    applyPseudoPreview(el, pseudo, prop, val);
    recordChange(el, `${pseudo}:${prop}`, val, `Change ${pseudo} ${prop}`);
    onChangeApplied();
  }

  const getOrig = (pseudo: Pseudo, prop: string) =>
    origCache.current[`${pseudo}:${prop}`];

  return (
    <div className="px-3 pb-2 space-y-1.5">
      <span className="text-[10px] text-panel-text-label block">Pseudo-elements</span>

      {beforeBg !== null && (
        <div className="space-y-0.5">
          <span className="text-[10px] text-panel-text-label block font-mono">::before</span>
          <ColorField
            value={beforeBg}
            original={getOrig('::before', 'background-color')}
            onChange={val => setPseudo('::before', 'background-color', val)}
          />
        </div>
      )}

      {afterBg !== null && (
        <div className="space-y-0.5">
          <span className="text-[10px] text-panel-text-label block font-mono">::after</span>
          <ColorField
            value={afterBg}
            original={getOrig('::after', 'background-color')}
            onChange={val => setPseudo('::after', 'background-color', val)}
          />
        </div>
      )}
    </div>
  );
}
