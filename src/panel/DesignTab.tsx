/**
 * Design tab — shows property sections for the selected element.
 * Each section reads live computed values and writes previews.
 */

import React, { useState } from 'react';
import { readComputed } from '@/engine/styleReader';
import { applyPreview } from '@/engine/overlay';
import { recordChange } from '@/engine/changeTracker';
import { describeChange } from '@/prompt/generator';
import { AutoLayoutSection } from './sections/AutoLayoutSection';
import { SizeSection } from './sections/SizeSection';
import { SpacingSection } from './sections/SpacingSection';
import { FillSection } from './sections/FillSection';
import { TypographySection } from './sections/TypographySection';
import { RadiusSection } from './sections/RadiusSection';
import { StrokeSection } from './sections/StrokeSection';
import { readLabel, buildCssPath } from '@/engine/styleReader';

interface Props {
  el: Element;
  onChangeRecorded: () => void;  // triggers panel re-render
}

/** Helpers that read live computed values (after previews are applied). */
function makeAccessors(el: Element) {
  // Cache for the before values (read before any change this session)
  const origCache: Record<string, string> = {};

  function get(prop: string): string {
    return getComputedStyle(el).getPropertyValue(prop).trim();
  }

  function getOrig(prop: string): string | undefined {
    return origCache[prop];
  }

  function set(prop: string, val: string, desc: string) {
    // Stash original before first change
    if (!origCache[prop]) {
      origCache[prop] = get(prop);
    }
    applyPreview(el, prop, val);
    recordChange(el, prop, val, desc || describeChange(prop, origCache[prop] ?? '', val));
  }

  return { get, getOrig, set };
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center px-2 h-[26px] border-b border-panel-border bg-panel-header-bg">
      <span className="text-panel-xs font-panel font-semibold text-panel-text-label uppercase tracking-wide">
        {title}
      </span>
    </div>
  );
}

export function DesignTab({ el, onChangeRecorded }: Props) {
  // Increment on each change to force re-render so sections read updated computed values
  const [, setVersion] = useState(0);

  // Create accessors once per element; origCache persists across re-renders for the same el
  const { get, getOrig, set: rawSet } = React.useMemo(() => makeAccessors(el), [el]);

  function set(prop: string, val: string, desc: string) {
    rawSet(prop, val, desc);
    setVersion(v => v + 1);  // triggers re-render → sections call get() again
    onChangeRecorded();
  }

  const display = get('display');
  const isFlex = display === 'flex' || display === 'inline-flex';
  const tag = el.tagName.toLowerCase();
  const isTextEl = ['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'li', 'label', 'button'].includes(tag)
    || (el.childElementCount === 0 && (el.textContent?.trim().length ?? 0) > 0);

  const label = readLabel(el);
  const path = buildCssPath(el);

  const sectionProps = { el, get, getOrig, set };

  return (
    <div className="flex flex-col text-panel-sm font-panel">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 px-2 h-[26px] border-b border-panel-border text-panel-xs text-panel-text-secondary truncate">
        <span className="text-panel-text-label">&lt;{tag}&gt;</span>
        <span className="truncate">{label}</span>
      </div>

      {/* Auto Layout / Padding */}
      <SectionHeader title="Auto Layout" />
      <AutoLayoutSection {...sectionProps} />

      {/* Size */}
      <SectionHeader title="Size" />
      <SizeSection {...sectionProps} />

      {/* Spacing */}
      <SectionHeader title="Spacing" />
      <SpacingSection {...sectionProps} />

      {/* Fill */}
      <SectionHeader title="Fill" />
      <FillSection {...sectionProps} />

      {/* Typography — only for text elements */}
      {isTextEl && (
        <>
          <SectionHeader title="Typography" />
          <TypographySection {...sectionProps} />
        </>
      )}

      {/* Corner Radius */}
      <SectionHeader title="Corner radius" />
      <RadiusSection {...sectionProps} />

      {/* Stroke */}
      <SectionHeader title="Stroke" />
      <StrokeSection {...sectionProps} />
    </div>
  );
}
