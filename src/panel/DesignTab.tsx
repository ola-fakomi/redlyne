/**
 * Design tab — Figma-style property sections.
 * Section order: Position · Layout · Auto layout · Appearance · Typography · Fill · Stroke · Effects · Export
 */

import React, { useState } from 'react';
import { applyPreview } from '@/engine/overlay';
import { recordChange } from '@/engine/changeTracker';
import { describeChange } from '@/prompt/generator';
import { AutoLayoutSection } from './sections/AutoLayoutSection';
import { SizeSection } from './sections/SizeSection';
import { FillSection } from './sections/FillSection';
import { TypographySection } from './sections/TypographySection';
import { StrokeSection } from './sections/StrokeSection';
import { NumericField } from './controls/NumericField';
import { readLabel } from '@/engine/styleReader';

interface Props {
  el: Element;
  onChangeRecorded: () => void;
}

function makeAccessors(el: Element) {
  const origCache: Record<string, string> = {};

  function get(prop: string): string {
    return getComputedStyle(el).getPropertyValue(prop).trim();
  }

  function getOrig(prop: string): string | undefined {
    return origCache[prop];
  }

  function set(prop: string, val: string, desc: string) {
    if (!origCache[prop]) origCache[prop] = get(prop);
    applyPreview(el, prop, val);
    recordChange(el, prop, val, desc || describeChange(prop, origCache[prop] ?? '', val));
  }

  return { get, getOrig, set };
}

/** Figma-style section header with + button on the right */
function SectionHeader({ title, onAdd }: { title: string; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between px-3 h-10 border-t border-panel-border shrink-0">
      <span className="text-[13px] font-semibold text-panel-text-primary">{title}</span>
      {onAdd !== undefined && (
        <button
          onClick={onAdd}
          className="flex items-center justify-center w-5 h-5 rounded text-panel-text-label hover:text-panel-text-primary hover:bg-panel-row-hover"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <line x1="5" y1="1" x2="5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}

/** Collapsed section — header only, no content */
function CollapsedSection({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-3 h-10 border-t border-panel-border shrink-0">
      <span className="text-[13px] font-semibold text-panel-text-primary">{title}</span>
      <button className="flex items-center justify-center w-5 h-5 rounded text-panel-text-label hover:text-panel-text-primary hover:bg-panel-row-hover">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <line x1="5" y1="1" x2="5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

export function DesignTab({ el, onChangeRecorded }: Props) {
  const [, setVersion] = useState(0);
  const { get, getOrig, set: rawSet } = React.useMemo(() => makeAccessors(el), [el]);

  function set(prop: string, val: string, desc: string) {
    rawSet(prop, val, desc);
    setVersion(v => v + 1);
    onChangeRecorded();
  }

  const display  = get('display');
  const isFlex   = display === 'flex' || display === 'inline-flex';
  const tag      = el.tagName.toLowerCase();
  const isTextEl = ['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'li', 'label', 'button'].includes(tag)
    || (el.childElementCount === 0 && (el.textContent?.trim().length ?? 0) > 0);

  const label = readLabel(el);

  // Position (read-only)
  const rect = el.getBoundingClientRect();
  const elX  = Math.round(rect.left + window.scrollX);
  const elY  = Math.round(rect.top  + window.scrollY);

  // Opacity
  const opacity    = get('opacity');
  const opacityPct = Math.round(parseFloat(opacity || '1') * 100);

  // Corner radius
  const tl = get('border-top-left-radius');
  const tr = get('border-top-right-radius');
  const br = get('border-bottom-right-radius');
  const bl = get('border-bottom-left-radius');
  const radiusAllSame = tl === tr && tr === br && br === bl;

  function setAllRadius(v: string) {
    set('border-top-left-radius',     v, 'Change corner radius');
    set('border-top-right-radius',    v, 'Change corner radius');
    set('border-bottom-right-radius', v, 'Change corner radius');
    set('border-bottom-left-radius',  v, 'Change corner radius');
  }

  const sectionProps = { el, get, getOrig, set };

  return (
    <div className="flex flex-col text-[11px] font-panel">

      {/* Element label row */}
      <div className="flex items-center gap-1.5 px-3 h-7 border-b border-panel-border text-[10px] text-panel-text-secondary truncate shrink-0">
        <span className="text-panel-text-label font-semibold">&lt;{tag}&gt;</span>
        <span className="truncate">{label}</span>
      </div>

      {/* ── Position ───────────────────────── */}
      <SectionHeader title="Position" />
      <div className="px-3 pb-2 pt-0.5">
        <div className="grid grid-cols-2 gap-1">
          <NumericField label="X" value={`${elX}px`} disabled onChange={() => {}} />
          <NumericField label="Y" value={`${elY}px`} disabled onChange={() => {}} />
        </div>
      </div>

      {/* ── Layout (W / H) ─────────────────── */}
      <SectionHeader title="Layout" />
      <SizeSection {...sectionProps} />

      {/* ── Auto layout (flex only) ─────────── */}
      {isFlex && (
        <>
          <SectionHeader title="Auto layout" />
          <AutoLayoutSection {...sectionProps} />
        </>
      )}

      {/* ── Appearance ─────────────────────── */}
      <SectionHeader title="Appearance" />
      <div className="px-3 pb-2 pt-1 space-y-1.5">
        {/* Opacity */}
        <div className="space-y-0.5">
          <span className="text-[10px] text-panel-text-label block">Opacity</span>
          <div className="relative flex-1">
            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-panel-text-label select-none pointer-events-none z-10">%</span>
            <input
              key={opacityPct}
              type="text"
              defaultValue={opacityPct}
              onBlur={e => {
                const pct = parseFloat(e.target.value);
                if (!isNaN(pct)) set('opacity', String(Math.min(1, Math.max(0, pct / 100))), pct < opacityPct ? 'Reduce opacity' : 'Increase opacity');
              }}
              onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
              className="w-full h-7 pl-5 pr-1.5 rounded-md border border-panel-border bg-panel-input-bg text-[11px] font-panel text-panel-text-primary text-right focus:outline-none focus:ring-1 focus:ring-panel-blue"
            />
          </div>
        </div>

        {/* Corner radius */}
        <div className="space-y-0.5">
          <span className="text-[10px] text-panel-text-label block">Corner radius</span>
          {radiusAllSame ? (
            <NumericField
              label="◯"
              value={tl}
              original={getOrig('border-top-left-radius')}
              onChange={setAllRadius}
            />
          ) : (
            <div className="grid grid-cols-2 gap-1">
              <NumericField label="TL" value={tl} original={getOrig('border-top-left-radius')}
                onChange={v => set('border-top-left-radius',    v, 'Change top-left radius')} />
              <NumericField label="TR" value={tr} original={getOrig('border-top-right-radius')}
                onChange={v => set('border-top-right-radius',   v, 'Change top-right radius')} />
              <NumericField label="BR" value={br} original={getOrig('border-bottom-right-radius')}
                onChange={v => set('border-bottom-right-radius',v, 'Change bottom-right radius')} />
              <NumericField label="BL" value={bl} original={getOrig('border-bottom-left-radius')}
                onChange={v => set('border-bottom-left-radius', v, 'Change bottom-left radius')} />
            </div>
          )}
        </div>
      </div>

      {/* ── Typography ─────────────────────── */}
      {isTextEl && (
        <>
          <SectionHeader title="Typography" />
          <TypographySection get={get} getOrig={getOrig} set={set} />
        </>
      )}

      {/* ── Fill ───────────────────────────── */}
      <SectionHeader title="Fill" onAdd={() => {}} />
      <FillSection {...sectionProps} />

      {/* ── Stroke ─────────────────────────── */}
      <SectionHeader title="Stroke" onAdd={() => {}} />
      <StrokeSection get={get} getOrig={getOrig} set={set} />

      {/* ── Effects (collapsed) ────────────── */}
      <CollapsedSection title="Effects" />

      {/* ── Export (collapsed) ─────────────── */}
      <CollapsedSection title="Export" />

    </div>
  );
}
