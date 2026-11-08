/**
 * Main Redline panel.
 *
 * Lives inside a Shadow DOM overlay created by WXT's createShadowRootUi.
 * Manages hover/click selection, the tab bar, section rendering,
 * Copy changes, and Clear previews.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SelectionOverlay } from './SelectionOverlay';
import { DesignTab } from './DesignTab';
import { ChangesTab } from './ChangesTab';
import {
  getChangeSet,
  pendingCount,
  totalCount,
  markAllCopied,
  revertAll,
} from '@/engine/changeTracker';
import { clearAllPreviews } from '@/engine/overlay';
import { generateCopiedText } from '@/prompt/generator';
import { type ChangeSet } from '@/schema';
import { cn } from '@/lib/utils';

interface Props {
  shadowHost: Element;
}

/** Elements inside the panel that should not trigger page-level selection. */
function isInsidePanel(e: Event, shadowHost: Element): boolean {
  return e.composedPath().includes(shadowHost);
}

export function Panel({ shadowHost }: Props) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [hoveredEl, setHoveredEl] = useState<Element | null>(null);
  const [selectedEl, setSelectedEl] = useState<Element | null>(null);
  const [changeSet, setChangeSet] = useState<ChangeSet>(getChangeSet());
  const [copyLabel, setCopyLabel] = useState<'default' | 'copied'>('default');
  const [tab, setTab] = useState('design');

  // Dragging state
  const [pos, setPos] = useState({ right: 12, top: 48 });
  const dragRef = useRef<{ startX: number; startRight: number; startTop: number; startY: number } | null>(null);

  const refreshChanges = useCallback(() => {
    setChangeSet({ ...getChangeSet() });
  }, []);

  // ---- Keyboard shortcut (Alt+Shift+D handled by background, but also listen locally)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.altKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsSelectMode(m => !m);
      }
      if (e.key === 'Escape') {
        if (selectedEl) { setSelectedEl(null); setIsSelectMode(false); }
        else setIsSelectMode(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEl]);

  // ---- Select-mode mouse events
  useEffect(() => {
    if (!isSelectMode) {
      setHoveredEl(null);
      return;
    }

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
      e.preventDefault();
      e.stopPropagation();
      const target = getTarget(e);
      if (target) {
        setSelectedEl(target);
        setTab('design');
      }
      setIsSelectMode(false);
      setHoveredEl(null);
    }

    window.addEventListener('mousemove', onMove, { capture: true, passive: true });
    window.addEventListener('click', onClick, { capture: true });

    return () => {
      window.removeEventListener('mousemove', onMove, { capture: true });
      window.removeEventListener('click', onClick, { capture: true });
    };
  }, [isSelectMode, shadowHost]);

  // ---- Drag panel header
  function onHeaderMouseDown(e: React.MouseEvent) {
    dragRef.current = { startX: e.clientX, startRight: pos.right, startTop: pos.top, startY: e.clientY };
    function onMove(ev: MouseEvent) {
      if (!dragRef.current) return;
      const dx = dragRef.current.startX - ev.clientX;
      const dy = ev.clientY - dragRef.current.startY;
      setPos({
        right: Math.max(8, dragRef.current.startRight + dx),
        top: Math.max(8, dragRef.current.startTop + dy),
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

  // ---- Copy changes
  async function handleCopy() {
    const cs = getChangeSet();
    const text = generateCopiedText(cs);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback: create hidden textarea in shadow root
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
      shadowHost.shadowRoot?.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      shadowHost.shadowRoot?.removeChild(ta);
    }
    markAllCopied();
    setCopyLabel('copied');
    setTimeout(() => setCopyLabel('default'), 2000);
    refreshChanges();
  }

  // ---- Clear previews
  function handleClear() {
    clearAllPreviews();
    revertAll();
    setSelectedEl(null);
    refreshChanges();
  }

  const pending = pendingCount();
  const total = totalCount();

  return (
    <>
      {/* Hover/selection highlights rendered at the page level */}
      <SelectionOverlay hoveredEl={hoveredEl} selectedEl={selectedEl} />

      {/* The floating panel */}
      <div
        style={{ position: 'fixed', right: pos.right, top: pos.top, zIndex: 2147483647, pointerEvents: 'all' }}
        className="w-[300px] flex flex-col bg-panel-bg border border-panel-border shadow-panel rounded-panel font-panel overflow-hidden select-none"
      >
        {/* Header */}
        <div
          onMouseDown={onHeaderMouseDown}
          className="flex items-center justify-between px-2 h-[36px] bg-panel-header-bg border-b border-panel-border cursor-move shrink-0"
        >
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: 'linear-gradient(135deg, #ff6b6b, #0d99ff)' }}
            />
            <span className="text-panel-base font-semibold text-panel-text-primary">Redline</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSelectMode(m => !m)}
              title={isSelectMode ? 'Cancel selection (Esc)' : 'Select element (click)'}
              className={cn(
                'h-[22px] w-[22px] rounded flex items-center justify-center text-[11px] transition-colors border',
                isSelectMode
                  ? 'border-panel-blue bg-panel-changed-bg text-panel-blue'
                  : 'border-panel-border bg-white text-panel-text-secondary hover:bg-panel-row-hover',
              )}
            >
              ⊕
            </button>
            {selectedEl && (
              <button
                onClick={() => { setSelectedEl(null); setIsSelectMode(false); }}
                title="Deselect"
                className="h-[22px] w-[22px] rounded flex items-center justify-center text-panel-xs border border-panel-border bg-white text-panel-text-secondary hover:bg-panel-row-hover"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Select mode banner */}
        {isSelectMode && (
          <div className="flex items-center justify-center h-[26px] bg-panel-blue text-white text-panel-xs shrink-0">
            Click an element to select it — Esc to cancel
          </div>
        )}

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-1 min-h-0">
          <TabsList className="shrink-0">
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
                <div className="flex flex-col items-center justify-center h-32 gap-1 text-panel-text-label">
                  <span className="text-[20px]">⊕</span>
                  <span className="text-panel-sm">Click ⊕ above to select an element</span>
                </div>
              )}
            </TabsContent>

            <TabsContent value="changes" className="mt-0">
              <ChangesTab changeSet={changeSet} onReverted={refreshChanges} />
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <Separator />
        <div className="flex items-center justify-between px-2 h-[40px] bg-panel-bg shrink-0">
          <span className="text-panel-xs text-panel-text-label">
            {total === 0 ? 'No changes' : `${total} change${total !== 1 ? 's' : ''}`}
          </span>
          <div className="flex items-center gap-1">
            {total > 0 && (
              <Button variant="secondary" size="sm" onClick={handleClear}>
                Clear
              </Button>
            )}
            <Button
              size="sm"
              disabled={pending === 0}
              onClick={handleCopy}
              className="min-w-[96px]"
            >
              {copyLabel === 'copied' ? '✓ Copied' : 'Copy changes'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
