/**
 * Numeric input — label sits inside the field on the left (Figma style).
 * Height: 28px (h-7), rounded-md, label in gray, value right-aligned.
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface NumericFieldProps {
  label: string;
  value: string;
  original?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

function stripUnit(v: string): string {
  return v.replace(/[a-z%]+$/i, '').trim();
}

function withUnit(num: string, orig: string): string {
  const unit = orig.match(/[a-z%]+$/i)?.[0] ?? 'px';
  return `${num}${unit}`;
}

export function NumericField({ label, value, original, disabled, onChange }: NumericFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(stripUnit(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(stripUnit(value));
  }, [value, editing]);

  const isChanged = original !== undefined && value !== original;

  function commit(raw: string) {
    let resolved = raw;
    try {
      if (/^[\d\s+\-*/().]+$/.test(raw)) {
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
    <div className="relative flex-1 min-w-0">
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-panel-text-label select-none pointer-events-none z-10">
        {label}
      </span>
      {isChanged && (
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-panel-blue pointer-events-none z-10" />
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
          'w-full h-[22px] pl-5 rounded-md border border-panel-border bg-panel-input-bg',
          'text-[11px] font-panel text-panel-text-primary text-right',
          isChanged ? 'pr-3.5' : 'pr-1.5',
          'focus:outline-none focus:ring-1 focus:ring-panel-blue focus:border-panel-blue',
          'disabled:opacity-40 disabled:cursor-default',
        )}
      />
    </div>
  );
}
