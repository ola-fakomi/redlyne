/**
 * Main Redline panel — 3-section floating card.
 *
 * Section 1: Header (logo + icon buttons) — inherits outer container bg
 * Section 2: Design / Changes tabs (scrollable)
 * Section 3: Footer (Clear + Copy changes)
 *
 * Outer container: rounded-[32px], bg-panel-outer
 * Inner sections:  rounded-[8px], bg-panel-bg
 * Gap between sections: 8px (gap-2)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SelectionOverlay } from './SelectionOverlay';
import { DesignTab } from './DesignTab';
import { ChangesTab } from './ChangesTab';
import {
  getChangeSet,
  pendingCount,
  totalCount,
  markAllCopied,
  revertAll,
  revertChange,
  popUndo,
} from '@/engine/changeTracker';
import { clearAllPreviews, removePreview } from '@/engine/overlay';
import { generateCopiedText } from '@/prompt/generator';
import { type ChangeSet } from '@/schema';
import { cn } from '@/lib/utils';

interface Props {
  shadowHost: Element;
}

function isInsidePanel(e: Event, shadowHost: Element): boolean {
  return e.composedPath().includes(shadowHost);
}

// ── Logo ────────────────────────────────────────────────────────
function RedlineLogo({ isDark }: { isDark: boolean }) {
  return (
    <img
      src={isDark ? logoDark : logoLight}
      alt="Redline"
      style={{ width: 28, height: 28, objectFit: 'contain', display: 'block', userSelect: 'none' }}
      draggable={false}
    />
  );
}

// ── Header icon button ───────────────────────────────────────────
function IconBtn({
  onClick, title, active = false, children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'flex items-center justify-center w-[22px] h-[22px] rounded-lg border transition-colors',
        active
          ? 'border-panel-blue bg-panel-changed-bg text-panel-blue'
          : 'border-panel-border bg-panel-bg text-panel-text-secondary hover:bg-panel-row-hover',
      )}
    >
      {children}
    </button>
  );
}

// ── SVG icons ───────────────────────────────────────────────────
function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2.5" fill="currentColor"/>
      <line x1="7" y1="1"    x2="7"    y2="2.5"  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="7" y1="11.5" x2="7"    y2="13"   stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="1" y1="7"    x2="2.5"  y2="7"    stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="11.5" y1="7" x2="13"   y2="7"    stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="2.93" y1="2.93"   x2="3.99" y2="3.99"   stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="10.01" y1="10.01" x2="11.07" y2="11.07" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="11.07" y1="2.93"  x2="10.01" y2="3.99"  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="3.99" y1="10.01"  x2="2.93"  y2="11.07" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M11.5 8.5A5 5 0 1 1 5.5 2.5a3.5 3.5 0 0 0 6 6Z" fill="currentColor"/>
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="7" y1="4" x2="7" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="4" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ── Main panel component ─────────────────────────────────────────
export function Panel({ shadowHost }: Props) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [hoveredEl, setHoveredEl]       = useState<Element | null>(null);
  const [selectedEl, setSelectedEl]     = useState<Element | null>(null);
  const [changeSet, setChangeSet]       = useState<ChangeSet>(getChangeSet());
  const [copyLabel, setCopyLabel]       = useState<'default' | 'copied'>('default');
  const [tab, setTab]                   = useState('design');
  const [isDark, setIsDark]             = useState(() => {
    try { return localStorage.getItem('redline-theme') !== 'light'; } catch { return true; }
  });

  // Theme
  useEffect(() => {
    const container = shadowHost.shadowRoot?.querySelector('.redline-root');
    if (container) container.classList.toggle('light', !isDark);
    try { localStorage.setItem('redline-theme', isDark ? 'dark' : 'light'); } catch {}
  }, [isDark, shadowHost]);

  // Drag position
  const [pos, setPos] = useState({ right: 12, top: 48 });
  const dragRef = useRef<{ startX: number; startRight: number; startTop: number; startY: number } | null>(null);

  const refreshChanges = useCallback(() => { setChangeSet({ ...getChangeSet() }); }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.altKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault(); setIsSelectMode(m => !m);
      }
      if ((e.key === 'v' || e.key === 'V') && !e.altKey && !e.ctrlKey && !e.metaKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          e.preventDefault(); setIsSelectMode(m => !m);
        }
      }
      if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        const entry = popUndo();
        if (entry) {
          const domEl = document.querySelector(`[data-redline-track="${entry.elementId}"]`);
          if (domEl) removePreview(domEl, entry.property);
          revertChange(entry.elementId, entry.changeId);
          setChangeSet({ ...getChangeSet() });
        }
      }
      if (e.key === 'Escape') {
        if (selectedEl) { setSelectedEl(null); setIsSelectMode(false); }
        else setIsSelectMode(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEl]);

  // Select-mode mouse tracking
  useEffect(() => {
    if (!isSelectMode) { setHoveredEl(null); return; }

    function getTarget(e: MouseEvent): Element | null {
      const els = document.elementsFromPoint(e.clientX, e.clientY);
      for (const el of els) {
        if (el === shadowHost || shadowHost.contains(el)) continue;
        if (el === document.documentElement || el === document.body) continue;
        return el;
      }
      return null;
    }

    function onMove(e: MouseEvent) {
      if (isInsidePanel(e, shadowHost)) return;
      setHoveredEl(getTarget(e));
    }

    function onClick(e: MouseEvent) {
      if (isInsidePanel(e, shadowHost)) return;
      e.preventDefault(); e.stopPropagation();
      const target = getTarget(e);
      if (target) { setSelectedEl(target); setTab('design'); }
      setIsSelectMode(false); setHoveredEl(null);
    }

    window.addEventListener('mousemove', onMove, { capture: true, passive: true });
    window.addEventListener('click', onClick, { capture: true });
    return () => {
      window.removeEventListener('mousemove', onMove, { capture: true });
      window.removeEventListener('click', onClick, { capture: true });
    };
  }, [isSelectMode, shadowHost]);

  // Panel drag
  function onHeaderMouseDown(e: React.MouseEvent) {
    dragRef.current = { startX: e.clientX, startRight: pos.right, startTop: pos.top, startY: e.clientY };
    function onMove(ev: MouseEvent) {
      if (!dragRef.current) return;
      setPos({
        right: Math.max(8, dragRef.current.startRight + (dragRef.current.startX - ev.clientX)),
        top:   Math.max(8, dragRef.current.startTop  + (ev.clientY - dragRef.current.startY)),
      });
    }
    function onUp() {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // Copy changes
  async function handleCopy() {
    const text = generateCopiedText(getChangeSet());
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
      shadowHost.shadowRoot?.appendChild(ta);
      ta.focus(); ta.select(); document.execCommand('copy');
      shadowHost.shadowRoot?.removeChild(ta);
    }
    markAllCopied();
    setCopyLabel('copied');
    setTimeout(() => setCopyLabel('default'), 2000);
    refreshChanges();
  }

  function handleClear() {
    clearAllPreviews(); revertAll(); setSelectedEl(null); refreshChanges();
  }

  const pending = pendingCount();
  const total   = totalCount();

  // Copy button — flat fill, no gradient or shadow
  const copyBtnBase: React.CSSProperties = isDark
    ? {
        height: 28, borderRadius: 8,
        background: 'linear-gradient(to bottom, #2c2c2c 0%, #2c2c2c 45%, rgba(79,79,79,0.70) 100%)',
        boxShadow: 'inset 0 0 0 0.5px #383838',
        border: 'none',
        color: '#ffffff',
        fontSize: 11,
        fontWeight: 600,
        padding: '0 12px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }
    : {
        height: 28, borderRadius: 8,
        background: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 45%, rgba(79,79,79,0.24) 100%)',
        boxShadow: 'inset 0 0 0 0.5px rgba(106, 0, 4, 0.25)',
        border: 'none',
        color: '#6a0004',
        fontSize: 11,
        fontWeight: 600,
        padding: '0 12px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      };

  const copyBtnStyle: React.CSSProperties = { ...copyBtnBase, cursor: 'pointer' };
  const copyBtnDisabledStyle: React.CSSProperties = { ...copyBtnBase, cursor: 'default', opacity: 0.65 };

  return (
    <>
      {/* Page-level highlight overlays */}
      <SelectionOverlay hoveredEl={hoveredEl} selectedEl={selectedEl} />

      {/* ── Outer container ─────────────────────────────────── */}
      <div
        style={{ position: 'fixed', right: pos.right, top: pos.top, zIndex: 2147483647, pointerEvents: 'all' }}
        className="w-[300px] flex flex-col rounded-[12px] font-panel select-none max-h-[85vh] bg-panel-outer p-1 gap-[2px]"
      >

        {/* ── SECTION 1: Header / Logo ─────────────────────── */}
        <div
          onMouseDown={onHeaderMouseDown}
          className="flex items-center justify-between py-0 px-[4px] cursor-move shrink-0"
        >
          <RedlineLogo isDark={isDark} />

          <div className="flex items-center gap-1.5">
            {/* Theme toggle */}
            <IconBtn
              onClick={() => setIsDark(d => !d)}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </IconBtn>

            {/* Select mode */}
            <IconBtn
              onClick={() => setIsSelectMode(m => !m)}
              title={isSelectMode ? 'Cancel selection (Esc)' : 'Select element (V)'}
              active={isSelectMode}
            >
              <PlusCircleIcon />
            </IconBtn>

            {/* Deselect */}
            {selectedEl && (
              <IconBtn
                onClick={() => { setSelectedEl(null); setIsSelectMode(false); }}
                title="Deselect element"
              >
                <XIcon />
              </IconBtn>
            )}
          </div>
        </div>

        {/* ── SECTION 2: Tabs + content (scrollable) ────────── */}
        <div className="flex flex-col bg-panel-bg rounded-[8px] overflow-hidden flex-1 min-h-0">

          {/* Select-mode banner */}
          {isSelectMode && (
            <div className="flex items-center justify-center h-7 bg-panel-blue text-white text-[11px] shrink-0">
              Click an element — Esc to cancel
            </div>
          )}

          <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-1 min-h-0">
            <TabsList className="shrink-0 rounded-none">
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="changes">
                Changes
                {total > 0 && (
                  <Badge variant={pending > 0 ? 'blue' : 'default'} className="ml-0.5">
                    {total}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto min-h-0">
              <TabsContent value="design" className="mt-0">
                {selectedEl ? (
                  <DesignTab el={selectedEl} onChangeRecorded={refreshChanges} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 gap-2 text-panel-text-label">
                    <PlusCircleIcon />
                    <span className="text-[11px]">Click ⊕ above to select an element</span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="changes" className="mt-0">
                <ChangesTab changeSet={changeSet} onReverted={refreshChanges} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* ── SECTION 3: Footer ────────────────────────────── */}
        <div className="flex items-center justify-between p-2 bg-panel-header-bg rounded-[12px] shrink-0">
          <div className="flex items-center gap-2">
            {total > 0 && (
              <button
                onClick={handleClear}
                className="h-[28px] px-2 rounded-[8px] border border-panel-border bg-panel-input-bg text-[11px] text-panel-text-secondary hover:bg-panel-row-hover transition-colors"
              >
                Clear
              </button>
            )}
            {total === 0 && (
              <span className="text-[11px] text-panel-text-label">No changes</span>
            )}
          </div>

          {/* Copy changes button */}
          {pending > 0 ? (
            <button onClick={handleCopy} style={copyBtnStyle}>
              {copyLabel === 'copied' ? '✓ Copied' : 'Copy changes'}
            </button>
          ) : (
            <button disabled style={copyBtnDisabledStyle}>
              Copy changes
            </button>
          )}
        </div>

      </div>
    </>
  );
}
