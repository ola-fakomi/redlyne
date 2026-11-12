/**
 * Design tab — Figma-style property sections.
 * Section order: Position · Layout · Auto layout · Appearance · Typography · Fill · Stroke · Effects · Export
 */

import React, { useState } from 'react';
import {
  AddLinearIcon,
  AlignLeftLinearIcon, AlignHorizontalCenterLinearIcon, AlignRightLinearIcon,
  AlignTopLinearIcon, AlignVerticalCenterLinearIcon, AlignBottomLinearIcon,
  RefreshLinearIcon, FlipHorizontalLinearIcon, FlipVerticalLinearIcon,
} from '@solar-icons/react';
import { applyPreview } from '@/engine/overlay';
import { recordChange } from '@/engine/changeTracker';
import { describeChange } from '@/prompt/generator';
import { AutoLayoutSection } from './sections/AutoLayoutSection';
import { EffectsSection } from './sections/EffectsSection';
import { SizeSection } from './sections/SizeSection';
import { FillSection } from './sections/FillSection';
import { TypographySection } from './sections/TypographySection';
import { StrokeSection } from './sections/StrokeSection';
import { NumericField } from './controls/NumericField';
import { readLabel } from '@/engine/styleReader';
import { cn } from '@/lib/utils';

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
        <AddLinearIcon size={10} />
      </button>
    </div>
  );
}

// ── Corner radius SVG icons ───────────────────────────────────────────────────
const CornerTLIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0 text-panel-text-label">
    <path d="M8 2H5a3 3 0 00-3 3v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const CornerTRIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0 text-panel-text-label">
    <path d="M2 2h3a3 3 0 013 3v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const CornerBLIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0 text-panel-text-label">
    <path d="M8 8H5a3 3 0 01-3-3V2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const CornerBRIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0 text-panel-text-label">
    <path d="M2 8h3a3 3 0 003-3V2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export function DesignTab({ el, onChangeRecorded }: Props) {
  const [, setVersion] = useState(0);
  const [cornerExpanded, setCornerExpanded] = useState(false);
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

  // Rotation — parse matrix() from computed transform
  const elTransform = get('transform');
  const elRotation = (() => {
    if (!elTransform || elTransform === 'none') return 0;
    const mat = elTransform.match(/matrix\(([^)]+)\)/);
    if (!mat) return 0;
    const [a, b] = mat[1].split(',').map(parseFloat);
    return Math.round(Math.atan2(b, a) * (180 / Math.PI));
  })();

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
      <div className="px-3 pb-2 pt-1 space-y-2">

        {/* Alignment */}
        <div className="space-y-1">
          <span className="text-[10px] text-panel-text-label block">Alignment</span>
          <div className="flex gap-0.5">
            {([
              { icon: <AlignLeftLinearIcon size={12} />,           title: 'Align left',        prop: 'justify-self', val: 'start'  },
              { icon: <AlignHorizontalCenterLinearIcon size={12} />, title: 'Center horizontal', prop: 'justify-self', val: 'center' },
              { icon: <AlignRightLinearIcon size={12} />,          title: 'Align right',       prop: 'justify-self', val: 'end'    },
              { icon: <AlignTopLinearIcon size={12} />,            title: 'Align top',         prop: 'align-self',   val: 'start'  },
              { icon: <AlignVerticalCenterLinearIcon size={12} />, title: 'Center vertical',   prop: 'align-self',   val: 'center' },
              { icon: <AlignBottomLinearIcon size={12} />,         title: 'Align bottom',      prop: 'align-self',   val: 'end'    },
            ] as const).map((btn, i) => {
              const cur = get(btn.prop);
              const active = cur === btn.val || (btn.val === 'start' && (cur === 'flex-start' || cur === 'self-start'));
              return (
                <button
                  key={i}
                  title={btn.title}
                  onClick={() => set(btn.prop, btn.val, btn.title)}
                  className={cn(
                    'flex items-center justify-center flex-1 h-[22px] rounded-md border transition-colors',
                    active
                      ? 'border-panel-blue bg-panel-changed-bg text-panel-blue'
                      : 'border-panel-border bg-panel-input-bg text-panel-text-secondary hover:bg-panel-row-hover',
                  )}
                >
                  {btn.icon}
                </button>
              );
            })}
          </div>
        </div>

        {/* Position X/Y */}
        <div className="space-y-1">
          <span className="text-[10px] text-panel-text-label block">Position</span>
          <div className="grid grid-cols-2 gap-1">
            <NumericField label="X" value={`${elX}px`} disabled onChange={() => {}} />
            <NumericField label="Y" value={`${elY}px`} disabled onChange={() => {}} />
          </div>
        </div>

        {/* Rotation */}
        <div className="space-y-1">
          <span className="text-[10px] text-panel-text-label block">Rotation</span>
          <div className="flex items-center gap-1">
            <div className="flex-1">
              <NumericField
                label="⤾"
                value={`${elRotation}deg`}
                original={getOrig('transform')}
                onChange={v => set('transform', `rotate(${parseFloat(v) || 0}deg)`, 'Rotate element')}
              />
            </div>
            <button title="Rotate 90° clockwise" onClick={() => set('transform', `rotate(${((elRotation + 90) % 360)}deg)`, 'Rotate 90° clockwise')}
              className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label hover:text-panel-text-primary hover:bg-panel-row-hover shrink-0">
              <RefreshLinearIcon size={12} />
            </button>
            <button title="Flip horizontal" onClick={() => set('transform', `${elTransform !== 'none' ? elTransform + ' ' : ''}scaleX(-1)`, 'Flip horizontal')}
              className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label hover:text-panel-text-primary hover:bg-panel-row-hover shrink-0">
              <FlipHorizontalLinearIcon size={12} />
            </button>
            <button title="Flip vertical" onClick={() => set('transform', `${elTransform !== 'none' ? elTransform + ' ' : ''}scaleY(-1)`, 'Flip vertical')}
              className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label hover:text-panel-text-primary hover:bg-panel-row-hover shrink-0">
              <FlipVerticalLinearIcon size={12} />
            </button>
          </div>
        </div>

      </div>

      {/* ── Layout ──────────────────────────── */}
      <SectionHeader title="Layout" />
      {isFlex ? (
        <AutoLayoutSection {...sectionProps} />
      ) : (
        <SizeSection {...sectionProps} />
      )}

      {/* ── Appearance ─────────────────────── */}
      <SectionHeader title="Appearance" />
      <div className="px-3 pb-2 pt-1 space-y-2">

        {/* Labels row */}
        <div className="grid grid-cols-2 gap-1 pr-6">
          <span className="text-[10px] text-panel-text-label">Opacity</span>
          <span className="text-[10px] text-panel-text-label">Corner radius</span>
        </div>

        {/* Fields row: [Opacity] [Corner radius] [expand toggle] */}
        <div className="flex items-center gap-1">

          {/* Opacity field */}
          <div className={cn(
            'flex items-center h-[22px] px-1.5 rounded-md border gap-1 bg-panel-input-bg flex-1 min-w-0',
            getOrig('opacity') !== undefined ? 'border-panel-blue' : 'border-panel-border',
          )}>
            <span
              className="w-3 h-3 rounded-sm border border-panel-border shrink-0"
              style={{ background: 'linear-gradient(135deg, #fff 50%, #bbb 50%)', backgroundSize: '6px 6px' }}
            />
            <input
              key={opacityPct}
              type="text"
              defaultValue={opacityPct}
              onBlur={e => {
                const pct = parseFloat(e.target.value);
                if (!isNaN(pct)) set('opacity', String(Math.min(1, Math.max(0, pct / 100))), pct < opacityPct ? 'Reduce opacity' : 'Increase opacity');
              }}
              onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
              className="flex-1 min-w-0 bg-transparent text-[11px] text-panel-text-primary focus:outline-none"
            />
            <span className="text-[10px] text-panel-text-label shrink-0">%</span>
          </div>

          {/* Corner radius field (uniform) */}
          <div className={cn(
            'flex items-center h-[22px] px-1.5 rounded-md border gap-1 bg-panel-input-bg flex-1 min-w-0',
            getOrig('border-top-left-radius') !== undefined ? 'border-panel-blue' : 'border-panel-border',
          )}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0 text-panel-text-label">
              <path d="M8 1H4a3 3 0 00-3 3v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input
              key={radiusAllSame ? tl : 'mixed'}
              type="text"
              defaultValue={radiusAllSame ? (Math.round(parseFloat(tl)) || 0) : ''}
              placeholder={!radiusAllSame ? 'Mixed' : undefined}
              onBlur={e => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v)) setAllRadius(`${v}px`);
              }}
              onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
              className="flex-1 min-w-0 bg-transparent text-[11px] text-panel-text-primary focus:outline-none placeholder:text-panel-text-label"
            />
          </div>

          {/* Expand corners toggle */}
          <button
            onClick={() => setCornerExpanded(c => !c)}
            title={cornerExpanded ? 'Collapse corners' : 'Expand corners'}
            className={cn(
              'flex items-center justify-center w-5 h-[22px] rounded border shrink-0 transition-colors',
              (cornerExpanded || !radiusAllSame)
                ? 'border-panel-blue bg-panel-changed-bg text-panel-blue'
                : 'border-panel-border bg-panel-input-bg text-panel-text-label hover:bg-panel-row-hover',
            )}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 3V2a1 1 0 011-1h1M6 1h1a1 1 0 011 1v1M9 6v1a1 1 0 01-1 1H7M4 9H3a1 1 0 01-1-1V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Individual corner radius fields */}
        {(cornerExpanded || !radiusAllSame) && (
          <div className="grid grid-cols-2 gap-1">
            {([
              { prop: 'border-top-left-radius',     val: tl, desc: 'Change top-left radius',     Icon: CornerTLIcon },
              { prop: 'border-top-right-radius',    val: tr, desc: 'Change top-right radius',    Icon: CornerTRIcon },
              { prop: 'border-bottom-left-radius',  val: bl, desc: 'Change bottom-left radius',  Icon: CornerBLIcon },
              { prop: 'border-bottom-right-radius', val: br, desc: 'Change bottom-right radius', Icon: CornerBRIcon },
            ] as const).map(({ prop, val, desc, Icon }) => {
              const orig = getOrig(prop);
              const isChanged = orig !== undefined && val !== orig;
              return (
                <div key={prop} className={cn(
                  'flex items-center h-[22px] px-1.5 rounded-md border gap-1 bg-panel-input-bg',
                  isChanged ? 'border-panel-blue' : 'border-panel-border',
                )}>
                  <Icon />
                  <input
                    type="text"
                    defaultValue={Math.round(parseFloat(val)) || 0}
                    key={val}
                    onBlur={e => set(prop, `${parseFloat(e.target.value) || 0}px`, desc)}
                    onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                    className="flex-1 min-w-0 bg-transparent text-[11px] text-panel-text-primary focus:outline-none"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Blend mode */}
        <div className="space-y-1">
          <span className="text-[10px] text-panel-text-label block">Blend mode</span>
          <div className={cn(
            'relative h-[22px] rounded-md border bg-panel-input-bg',
            getOrig('mix-blend-mode') !== undefined ? 'border-panel-blue' : 'border-panel-border',
          )}>
            <select
              value={get('mix-blend-mode') || 'normal'}
              onChange={e => set('mix-blend-mode', e.target.value, `Set blend mode to ${e.target.value}`)}
              style={{ appearance: 'none', WebkitAppearance: 'none' }}
              className="absolute inset-0 w-full h-full pl-1.5 pr-5 bg-transparent text-[11px] text-panel-text-primary focus:outline-none cursor-pointer"
            >
              {[
                'normal', 'multiply', 'screen', 'overlay',
                'darken', 'lighten', 'color-dodge', 'color-burn',
                'hard-light', 'soft-light', 'difference', 'exclusion',
                'hue', 'saturation', 'color', 'luminosity',
              ].map(m => (
                <option key={m} value={m} style={{ background: 'var(--panel-bg, #1e1e1e)', color: 'inherit' }}>
                  {m.charAt(0).toUpperCase() + m.slice(1).replace(/-/g, ' ')}
                </option>
              ))}
            </select>
            <div className="absolute right-0 top-0 h-full flex items-center pr-1.5 pointer-events-none">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-panel-text-label">
                <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

      </div>

      {/* ── Typography ─────────────────────── */}
      {isTextEl && (
        <>
          <SectionHeader title="Typography" />
          <TypographySection
            el={el}
            get={get}
            getOrig={getOrig}
            set={set}
            onTextChange={text => {
              // Update text nodes directly; replace first text node or set textContent
              const textNodes = Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
              if (textNodes.length > 0) {
                textNodes[0].textContent = text;
                textNodes.slice(1).forEach(n => n.parentNode?.removeChild(n));
              } else {
                el.textContent = text;
              }
              onChangeRecorded();
            }}
          />
        </>
      )}

      {/* ── Fill ───────────────────────────── */}
      <SectionHeader title="Fill" onAdd={() => {}} />
      <FillSection {...sectionProps} />

      {/* ── Stroke ─────────────────────────── */}
      <SectionHeader title="Stroke" onAdd={() => {}} />
      <StrokeSection get={get} getOrig={getOrig} set={set} />

      {/* ── Effects ────────────────────────── */}
      <EffectsSection get={get} set={set} />

    </div>
  );
}
