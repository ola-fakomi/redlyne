/**
 * Renders the hover/selection highlight inside the shadow DOM overlay.
 * Uses position:fixed divs sized to the element's bounding rect.
 */

import React, { useEffect, useState } from 'react';
import { readLabel } from '@/engine/styleReader';

interface Props {
  hoveredEl: Element | null;
  selectedEl: Element | null;
}

interface Rect { top: number; left: number; width: number; height: number }

function useRect(el: Element | null): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!el) { setRect(null); return; }
    function update() {
      const r = el!.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    window.addEventListener('scroll', update, { passive: true });
    return () => { obs.disconnect(); window.removeEventListener('scroll', update); };
  }, [el]);

  return rect;
}

function Highlight({
  el, color, label, showLabel,
}: {
  el: Element;
  color: string;
  label?: string;
  showLabel?: boolean;
}) {
  const rect = useRect(el);
  if (!rect || rect.width === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        outline: `1.5px solid ${color}`,
        outlineOffset: '1px',
        pointerEvents: 'none',
        zIndex: 2147483646,
      }}
    >
      {showLabel && label && (
        <span
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: 2,
            background: color,
            color: '#fff',
            fontSize: '10px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
            padding: '1px 4px',
            borderRadius: 2,
            lineHeight: '14px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {label} {Math.round(rect.width)} × {Math.round(rect.height)}
        </span>
      )}
    </div>
  );
}

export function SelectionOverlay({ hoveredEl, selectedEl }: Props) {
  return (
    <>
      {hoveredEl && hoveredEl !== selectedEl && (
        <Highlight el={hoveredEl} color="#0d99ff" label={readLabel(hoveredEl)} showLabel />
      )}
      {selectedEl && (
        <Highlight el={selectedEl} color="#0d99ff" label={readLabel(selectedEl)} showLabel />
      )}
    </>
  );
}
