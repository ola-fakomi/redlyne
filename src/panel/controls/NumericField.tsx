/**
 * A single numeric input with a property label.
 * Shows a blue dot when the value differs from the original.
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface NumericFieldProps {
  label: string;
  value: string;         // current CSS value (may include units)
  original?: string;     // the before value (shows changed dot if differs)
  unit?: string;         // display unit hint, e.g. 'px'
  disabled?: boolean;
  onChange: (value: string) => void;
}

/** Strip CSS unit and return just the number string. */
function stripUnit(v: string): string {
  return v.replace(/[a-z%]+$/i, '').trim();
}

/** Re-attach the unit from the original value, or fall back to 'px'. */
function withUnit(num: string, orig: string): string {
  const unit = orig.match(/[a-z%]+$/i)?.[0] ?? 'px';
  return `${num}${unit}`;
}

export function NumericField({ label, value, original, unit = 'px', disabled, onChange }: NumericFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(stripUnit(value));
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync when parent value changes (e.g. revert)
  useEffect(() => {
    if (!editing) setDraft(stripUnit(value));
  }, [value, editing]);

  const isChanged = original !== undefined && value !== original;

  function commit(raw: string) {
    // Support simple math: e.g. "16+4", "24/2"
    let resolved = raw;
    try {
      // Only allow digits, operators, spaces, and dot
      if (/^[\d\s+\-*/().]+$/.test(raw)) {
        // eslint-disable-next-line no-eval
        const result = Function(`"use strict"; return (${raw})`)();
        if (typeof result === 'number' && isFinite(result)) {
          resolved = String(Math.round(result * 100) / 100);
        }
      }
    } catch { /* ignore */ }

    const numeric = parseFloat(resolved);
    if (!isNaN(numeric)) {
      onChange(withUnit(String(numeric), value));
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { commit(draft); }
    if (e.key === 'Escape') { setDraft(stripUnit(value)); setEditing(false); }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const n = parseFloat(draft) || 0;
      const step = e.shiftKey ? 10 : 1;
      const next = String(n + step);
      setDraft(next);
      onChange(withUnit(next, value));
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const n = parseFloat(draft) || 0;
      const step = e.shiftKey ? 10 : 1;
      const next = String(n - step);
      setDraft(next);
      onChange(withUnit(next, value));
    }
  }

  return (
    <div className="flex items-center gap-1 min-w-0">
      <span className="text-panel-xs font-panel text-panel-text-label select-none shrink-0 w-[18px] text-right">
        {label}
      </span>
      <div className="relative flex-1 min-w-0">
        {isChanged && (
          <span
            className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-panel-blue pointer-events-none"
            title="Changed"
          />
        )}
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={editing ? draft : (stripUnit(value) || '—')}
          disabled={disabled}
          onFocus={() => { setEditing(true); setDraft(stripUnit(value)); inputRef.current?.select(); }}
          onBlur={() => commit(draft)}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full h-[22px] rounded border border-panel-border bg-white',
            'text-panel-sm font-panel text-panel-text-primary text-right pr-1',
            isChanged ? 'pl-3' : 'pl-1',
            'focus:outline-none focus:ring-1 focus:ring-panel-blue focus:border-panel-blue',
            'disabled:opacity-40 disabled:cursor-default',
          )}
        />
      </div>
    </div>
  );
}
