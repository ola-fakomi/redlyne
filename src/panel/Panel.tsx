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

import React, { useState, useEffect, useCallback, useRef, Component } from 'react';
import { SunLinearIcon, MoonLinearIcon, AddCircleLinearIcon, CloseLinearIcon } from '@solar-icons/react';
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

// ── Layer tree ─────────────────────────────────────────────────────────────
interface LayerNodeData {
  id: string;
  el: Element;
  name: string;
  children: LayerNodeData[];
}

const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'meta', 'link', 'head', 'title', 'svg', 'path', 'g']);
let _layerIdCount = 0;

function getLayerName(el: Element): string {
  if (el.id) return `#${el.id}`;
  const aria = el.getAttribute('aria-label') || el.getAttribute('placeholder');
  if (aria) return aria.slice(0, 32);
  const testId = el.getAttribute('data-testid');
  if (testId) return testId;
  const text = Array.from(el.childNodes)
    .filter(n => n.nodeType === Node.TEXT_NODE)
    .map(n => n.textContent?.trim())
    .filter(Boolean)
    .join(' ');
  if (text && text.length <= 36) return text;
  return el.tagName.toLowerCase();
}

// Returns the ancestor id path (root → target) if found, else null
function findPathToEl(node: LayerNodeData, el: Element): string[] | null {
  if (node.el === el) return [node.id];
  for (const child of node.children) {
    const path = findPathToEl(child, el);
    if (path) return [node.id, ...path];
  }
  return null;
}

function buildLayerTree(el: Element, depth = 0): LayerNodeData | null {
  const tag = el.tagName.toLowerCase();
  if (SKIP_TAGS.has(tag) || tag.includes('-')) return null; // skip shadow hosts
  if ((el as HTMLElement).hidden) return null;
  const children = depth < 15
    ? Array.from(el.children)
        .slice(0, 30)
        .map(c => buildLayerTree(c, depth + 1))
        .filter((n): n is LayerNodeData => n !== null)
    : [];
  return { id: `l${++_layerIdCount}`, el, name: getLayerName(el), children };
}

function LayerTreeRow({
  node, depth, expanded, selectedId, onToggle, onSelect,
}: {
  node: LayerNodeData; depth: number; expanded: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string, el: Element) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isExp = expanded.has(node.id);
  const isSel = selectedId === node.id;
  return (
    <>
      <div
        onClick={() => { onSelect(node.id, node.el); if (hasChildren) onToggle(node.id); }}
        className={cn(
          'flex items-center gap-1 cursor-pointer rounded text-[11px]',
          isSel ? 'bg-panel-changed-bg text-panel-blue' : 'text-panel-text-secondary hover:bg-panel-row-hover',
        )}
        style={{ paddingLeft: 6 + depth * 10, paddingRight: 6, height: 22 }}
      >
        <span style={{ width: 8, fontSize: 7, opacity: 0.5, flexShrink: 0, textAlign: 'center' }}>
          {hasChildren ? (isExp ? '▾' : '▸') : '·'}
        </span>
        <span className="truncate">{node.name}</span>
      </div>
      {hasChildren && isExp && node.children.map(c => (
        <LayerTreeRow key={c.id} node={c} depth={depth + 1}
          expanded={expanded} selectedId={selectedId}
          onToggle={onToggle} onSelect={onSelect} />
      ))}
    </>
  );
}

const EXT_VERSION: string = (() => {
  try { return (globalThis as any).chrome?.runtime?.getManifest?.()?.version ?? '0.0.1'; }
  catch { return '0.0.1'; }
})();

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
      alt="Redlyne"
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

// ── Error boundary ───────────────────────────────────────────────
class DesignErrorBoundary extends Component<
  { children: React.ReactNode; onReset: () => void },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onReset: () => void }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error('[Redlyne] DesignTab crash:', error.message, error.stack); }
  render() {
    if (this.state.error) {
      return (
        <div className="p-4 flex flex-col gap-2 text-[11px]">
          <span className="text-red-400 font-medium">Could not read this element.</span>
          <button
            onClick={() => { this.setState({ error: null }); this.props.onReset(); }}
            className="text-panel-blue underline text-left"
          >
            Deselect and try another
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Icons (lucide-react) ─────────────────────────────────────────
function SunIcon()        { return <SunLinearIcon size={14} />; }
function MoonIcon()       { return <MoonLinearIcon size={14} />; }
function PlusCircleIcon() { return <AddCircleLinearIcon size={14} />; }
function XIcon()          { return <CloseLinearIcon size={12} />; }

// ── Main panel component ─────────────────────────────────────────
export function Panel({ shadowHost }: Props) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [hoveredEl, setHoveredEl]       = useState<Element | null>(null);
  const [selectedEl, setSelectedEl]     = useState<Element | null>(null);
  const [changeSet, setChangeSet]       = useState<ChangeSet>(getChangeSet());
  const [copyLabel, setCopyLabel]       = useState<'default' | 'copied'>('default');
  const [tab, setTab]                   = useState('design');
  const [layersOpen, setLayersOpen]     = useState(false);
  const [layerTree, setLayerTree]       = useState<LayerNodeData | null>(null);
  const [layerExpanded, setLayerExpanded] = useState<Set<string>>(new Set());
  const [layerSelected, setLayerSelected] = useState<string | null>(null);
  const [isDark, setIsDark]             = useState(() => {
    try {
      // Migrate theme preference from old key (pre-rename)
      const legacy = localStorage.getItem('redline-theme');
      if (legacy !== null) {
        localStorage.setItem('redlyne-theme', legacy);
        localStorage.removeItem('redline-theme');
      }
      return localStorage.getItem('redlyne-theme') !== 'light';
    } catch { return true; }
  });

  // Theme
  useEffect(() => {
    const container = shadowHost.shadowRoot?.querySelector('.redlyne-root');
    if (container) container.classList.toggle('light', !isDark);
    try { localStorage.setItem('redlyne-theme', isDark ? 'dark' : 'light'); } catch {}
  }, [isDark, shadowHost]);

  // Drag position
  const [pos, setPos] = useState({ right: 12, top: 48 });
  const dragRef = useRef<{ startX: number; startRight: number; startTop: number; startY: number } | null>(null);

  const refreshChanges = useCallback(() => { setChangeSet({ ...getChangeSet() }); }, []);

  // Build layer tree rooted at selectedEl whenever selection or panel changes
  useEffect(() => {
    if (!layersOpen) return;
    if (!selectedEl) { setLayersOpen(false); return; }
    _layerIdCount = 0;
    const tree = buildLayerTree(selectedEl);
    setLayerTree(tree);
    setLayerSelected(tree?.id ?? null);
    setLayerExpanded(tree ? new Set([tree.id]) : new Set());
  }, [layersOpen, selectedEl]);

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
          const domEl = document.querySelector(`[data-redlyne-track="${entry.elementId}"]`);
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
        background: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 50%, #deedff 100%)',
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

      {/* ── Outer wrapper (flex-row: trigger + tree + main panel) ── */}
      <div style={{ position: 'fixed', right: pos.right, top: pos.top, zIndex: 2147483647, pointerEvents: 'all', display: 'flex', flexDirection: 'row', gap: 0, alignItems: 'flex-start' }}>

        {/* ── Layers trigger (only when closed) ──────────── */}
        {!layersOpen && (
          <button
            onClick={() => setLayersOpen(l => !l)}
            className="flex items-center justify-center rounded-l-[8px] font-panel select-none border-0 cursor-pointer bg-panel-outer text-panel-text-label"
            style={{ width: 20, padding: '16px 0', marginTop: 32 }}
            title="Toggle layers"
          >
            <span className="text-[9px] font-semibold tracking-[0.08em] uppercase" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              Layers
            </span>
          </button>
        )}

        {/* ── Layers tree panel (only when open) ──────────── */}
        {layersOpen && (
          <div className="flex flex-col rounded-l-[12px] font-panel select-none bg-panel-outer overflow-hidden" style={{ width: 150, maxHeight: '85vh', marginTop: 32 }}>
            <div className="flex items-center justify-between px-3 h-9 shrink-0 border-b border-panel-border">
              <span className="text-[10px] font-semibold text-panel-text-label uppercase tracking-[0.07em]">Layers</span>
              <button
                onClick={() => setLayersOpen(false)}
                className="flex items-center justify-center w-4 h-4 rounded text-panel-text-label hover:text-panel-text-primary hover:bg-panel-row-hover border-0 cursor-pointer bg-transparent"
                title="Close layers"
              >
                <span style={{ fontSize: 9, lineHeight: 1 }}>✕</span>
              </button>
            </div>
            {layerTree ? (
              <div className="overflow-y-auto p-1 flex-1 min-h-0">
                <LayerTreeRow
                  node={layerTree} depth={0}
                  expanded={layerExpanded} selectedId={layerSelected}
                  onToggle={id => setLayerExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; })}
                  onSelect={(id, el) => { setSelectedEl(el); setTab('design'); setIsSelectMode(false); }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center flex-1 p-3 text-center text-[10px] text-panel-text-label leading-relaxed">
                Select an element on the page to explore its layers
              </div>
            )}
          </div>
        )}

        {/* ── Main panel ──────────────────────────────────── */}
        <div
          className="w-[300px] flex flex-col rounded-[12px] font-panel select-none max-h-[85vh] bg-panel-outer p-1 gap-[1px]"
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
                  <DesignErrorBoundary onReset={() => setSelectedEl(null)}>
                    <DesignTab el={selectedEl} onChangeRecorded={refreshChanges} />
                  </DesignErrorBoundary>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 gap-2 text-panel-text-label">
                    <PlusCircleIcon />
                    <span className="text-[11px]">Click or Press <kbd className="px-1 py-px rounded border border-panel-border bg-panel-input-bg font-mono text-[10px] text-panel-text-primary not-italic">v</kbd> to select an element</span>
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
        <div className="flex items-center justify-between p-2 bg-panel-header-bg rounded-[8px] shrink-0">
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
              <span className="text-[11px] text-panel-text-label">No changes · v{EXT_VERSION}</span>
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

        </div> {/* end main panel */}
      </div> {/* end flex-row wrapper */}
    </>
  );
}
