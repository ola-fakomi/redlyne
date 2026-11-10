/**
 * Redline UI State Gallery
 * All states laid out statically — pointer-events disabled so nothing changes on interaction.
 */
import React from 'react';
import logoDark  from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';

// ─── Icons ────────────────────────────────────────────────────────────────────
function MoonIcon()       { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11.5 8.5A5 5 0 1 1 5.5 2.5a3.5 3.5 0 0 0 6 6Z" fill="currentColor"/></svg>; }
function SunIcon()        { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="2.5" fill="currentColor"/><line x1="7" y1="1" x2="7" y2="2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="7" y1="11.5" x2="7" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="1" y1="7" x2="2.5" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="11.5" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="2.93" y1="2.93" x2="3.99" y2="3.99" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="10.01" y1="10.01" x2="11.07" y2="11.07" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="11.07" y1="2.93" x2="10.01" y2="3.99" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="3.99" y1="10.01" x2="2.93" y2="11.07" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function PlusCircleIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><line x1="7" y1="4" x2="7" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="4" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function XIcon()          { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function PlusIcon()       { return <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><line x1="5" y1="1" x2="5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function EyeIcon()        { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2.5C3.5 2.5 1.5 6 1.5 6C1.5 6 3.5 9.5 6 9.5C8.5 9.5 10.5 6 10.5 6C10.5 6 8.5 2.5 6 2.5Z" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="6" cy="6" r="1.5" fill="currentColor"/></svg>; }
function AlignLeftIcon()  { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="1" y1="3" x2="11" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="1" y1="6" x2="8" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="1" y1="9" x2="10" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function AlignCenterIcon(){ return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="1" y1="3" x2="11" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="2.5" y1="6" x2="9.5" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="1" y1="9" x2="11" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function AlignRightIcon() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="1" y1="3" x2="11" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="4" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="2" y1="9" x2="11" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function AlignJustIcon()  { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="1" y1="3" x2="11" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="1" y1="9" x2="11" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }

// ─── Static field (read-only display of a labelled numeric input) ──────────────
function Field({ label, value, changed }: { label: string; value: string; changed?: boolean }) {
  return (
    <div className="relative flex-1 min-w-0">
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-panel-text-label select-none z-10">{label}</span>
      {changed && <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-panel-blue z-10" />}
      <div className={`w-full h-[22px] pl-5 rounded-md border border-panel-border bg-panel-input-bg text-[11px] text-panel-text-primary text-right flex items-center justify-end ${changed ? 'pr-3.5' : 'pr-1.5'}`}>
        {value}
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, hasAdd }: { title: string; hasAdd?: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 h-10 border-t border-panel-border shrink-0">
      <span className="text-[13px] font-semibold text-panel-text-primary">{title}</span>
      {hasAdd && (
        <button className="flex items-center justify-center w-5 h-5 rounded text-panel-text-label">
          <PlusIcon />
        </button>
      )}
    </div>
  );
}

// ─── Icon button (header) ─────────────────────────────────────────────────────
function IconBtn({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-center justify-center w-[22px] h-[22px] rounded-lg border ${active ? 'border-panel-blue bg-panel-changed-bg text-panel-blue' : 'border-panel-border bg-panel-bg text-panel-text-secondary'}`}>
      {children}
    </div>
  );
}

// ─── Panel shell ──────────────────────────────────────────────────────────────
function Shell({ dark, children }: { dark: boolean; children: React.ReactNode }) {
  return (
    <div className={`redline-root${dark ? '' : ' light'}`} style={{ display: 'inline-block' }}>
      <div className="w-[300px] flex flex-col rounded-[12px] font-panel select-none bg-panel-outer p-1 gap-[2px]">
        {children}
      </div>
    </div>
  );
}

// ─── Header section ───────────────────────────────────────────────────────────
function Header({ dark, selectActive, withDeselect }: { dark: boolean; selectActive?: boolean; withDeselect?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0 px-[4px] cursor-move shrink-0">
      <img src={dark ? logoDark : logoLight} alt="Redline" style={{ width: 28, height: 28, objectFit: 'contain', display: 'block' }} />
      <div className="flex items-center gap-1.5">
        <IconBtn>{dark ? <SunIcon /> : <MoonIcon />}</IconBtn>
        <IconBtn active={selectActive}><PlusCircleIcon /></IconBtn>
        {withDeselect && <IconBtn><XIcon /></IconBtn>}
      </div>
    </div>
  );
}

// ─── Tabs bar ─────────────────────────────────────────────────────────────────
function TabsBar({ active, changeCount }: { active: 'design' | 'changes'; changeCount?: number }) {
  return (
    <div className="flex border-b border-panel-border shrink-0">
      {(['design', 'changes'] as const).map(t => (
        <div key={t} className={`px-3 py-2 text-[11px] font-medium cursor-pointer ${active === t ? 'text-panel-text-primary border-b-2 border-panel-blue' : 'text-panel-text-secondary'}`}>
          {t === 'design' ? 'Design' : 'Changes'}
          {t === 'changes' && changeCount && changeCount > 0 ? (
            <span className="ml-1 inline-flex items-center justify-center rounded-full bg-panel-blue text-white text-[9px] w-3.5 h-3.5">{changeCount}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

// ─── Select mode banner ───────────────────────────────────────────────────────
function SelectBanner() {
  return (
    <div className="flex items-center justify-center h-7 bg-panel-blue text-white text-[11px] shrink-0">
      Click an element — Esc to cancel
    </div>
  );
}

// ─── Color row (fill/stroke) ──────────────────────────────────────────────────
function ColorRow({ hex, opacity = '100', changed }: { hex: string; opacity?: string; changed?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 flex-1 h-[22px] px-1.5 rounded-md border ${changed ? 'border-panel-blue' : 'border-panel-border'} bg-panel-input-bg`}>
      <div className="w-[14px] h-[14px] rounded-sm border border-black/20 shrink-0" style={{ backgroundColor: hex }} />
      <span className="flex-1 text-[11px] text-panel-text-primary uppercase">{hex.replace('#','')}</span>
      <span className="text-[11px] text-panel-text-secondary w-6 text-right">{opacity}</span>
      <span className="text-[10px] text-panel-text-label">%</span>
    </div>
  );
}
function ColorRowWithEye({ hex, opacity, changed }: { hex: string; opacity?: string; changed?: boolean }) {
  return (
    <div className="flex items-center gap-1 px-3 pb-1.5">
      <ColorRow hex={hex} opacity={opacity} changed={changed} />
      <div className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label shrink-0"><EyeIcon /></div>
    </div>
  );
}

// ─── Design tab: empty ────────────────────────────────────────────────────────
function DesignEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-32 gap-2 text-panel-text-label">
      <PlusCircleIcon />
      <span className="text-[11px]">Click ⊕ above to select an element</span>
    </div>
  );
}

// ─── Design tab: with element ─────────────────────────────────────────────────
function DesignWithElement() {
  return (
    <div className="flex flex-col text-[11px] font-panel">
      {/* Element label */}
      <div className="flex items-center gap-1.5 px-3 h-7 border-b border-panel-border text-[10px] text-panel-text-secondary truncate shrink-0">
        <span className="text-panel-text-label font-semibold">&lt;div&gt;</span>
        <span className="truncate">.panel-header</span>
      </div>

      <SectionHeader title="Position" />
      <div className="px-3 pb-2 pt-0.5">
        <div className="grid grid-cols-2 gap-1">
          <Field label="X" value="128" /><Field label="Y" value="64" />
        </div>
      </div>

      <SectionHeader title="Layout" />
      <div className="px-3 pb-2 pt-1">
        <div className="grid grid-cols-2 gap-1">
          <Field label="W" value="300" changed /><Field label="H" value="48" />
        </div>
      </div>

      <SectionHeader title="Appearance" />
      <div className="px-3 pb-2 pt-1 space-y-1.5">
        <div className="space-y-0.5">
          <span className="text-[10px] text-panel-text-label block">Opacity</span>
          <div className="relative">
            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-panel-text-label z-10">%</span>
            <div className="w-full h-[22px] pl-5 pr-1.5 rounded-md border border-panel-border bg-panel-input-bg text-[11px] text-panel-text-primary text-right flex items-center justify-end">100</div>
          </div>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-panel-text-label block">Corner radius</span>
          <Field label="◯" value="8px" />
        </div>
      </div>

      <SectionHeader title="Typography" />
      <div className="px-3 pb-3 pt-1 space-y-1.5">
        <div className="w-full h-[22px] px-2 rounded-md border border-panel-border bg-panel-input-bg text-[11px] text-panel-text-primary flex items-center">Inter</div>
        <div className="grid grid-cols-2 gap-1">
          <div className="h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-[11px] text-panel-text-primary px-1.5 flex items-center">400</div>
          <Field label="Size" value="14" changed />
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div className="space-y-0.5">
            <span className="text-[10px] text-panel-text-label block">Line</span>
            <Field label="LH" value="1.5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-panel-text-label block">Letter</span>
            <Field label="LS" value="0px" />
          </div>
        </div>
        <div className="flex gap-0.5">
          {[<AlignLeftIcon />, <AlignCenterIcon />, <AlignRightIcon />, <AlignJustIcon />].map((icon, i) => (
            <div key={i} className={`flex items-center justify-center flex-1 h-[22px] rounded-md border ${i === 0 ? 'border-panel-blue bg-panel-changed-bg text-panel-blue' : 'border-panel-border bg-panel-input-bg text-panel-text-secondary'}`}>{icon}</div>
          ))}
        </div>
      </div>

      <SectionHeader title="Fill" hasAdd />
      <ColorRowWithEye hex="#2c2c2c" changed />

      <SectionHeader title="Stroke" hasAdd />
      <div className="px-3 pb-2 pt-1 text-[11px] text-panel-text-label">None</div>

      <SectionHeader title="Effects" />
      <SectionHeader title="Export" />
    </div>
  );
}

// ─── Changes tab: empty ───────────────────────────────────────────────────────
function ChangesEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-32 gap-1 text-panel-text-label font-panel">
      <span className="text-[11px]">No changes yet.</span>
      <span className="text-[10px]">Select an element and edit its properties.</span>
    </div>
  );
}

// ─── Changes tab: with changes ────────────────────────────────────────────────
function ChangesWithItems() {
  const items = [
    { tag: 'div', label: '.panel-header', changes: [
      { prop: 'font-size',   from: '12px',    to: '14px',    copied: false },
      { prop: 'color',       from: '#aaaaaa', to: '#e5e5e5', copied: true  },
    ]},
    { tag: 'button', label: '.copy-btn', changes: [
      { prop: 'background',  from: '#2c2c2c', to: '#383838', copied: false },
    ]},
  ];
  return (
    <div className="flex flex-col font-panel text-[11px]">
      <div className="flex items-center justify-end px-2 py-1 border-b border-panel-border">
        <span className="text-[11px] text-red-500">Revert all</span>
      </div>
      {items.map((el, ei) => (
        <div key={ei} className="border-b border-panel-border">
          <div className="flex items-center justify-between px-2 h-[26px] bg-panel-section-bg">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-[10px] text-panel-text-label">&lt;{el.tag}&gt;</span>
              <span className="text-[10px] font-medium text-panel-text-primary truncate">{el.label}</span>
            </div>
            <span className="text-[10px] text-panel-text-label">Revert</span>
          </div>
          {el.changes.map((c, ci) => (
            <div key={ci} className="flex items-center gap-1.5 px-2 h-[26px]">
              <span className={`w-1 h-1 rounded-full shrink-0 ${c.copied ? 'bg-panel-border' : 'bg-panel-blue'}`} />
              <span className="text-[10px] text-panel-text-label shrink-0 w-[80px] truncate">{c.prop}</span>
              <span className="text-[10px] text-panel-text-secondary shrink-0 max-w-[50px] truncate">{c.from}</span>
              <span className="text-panel-text-label text-[9px] shrink-0">→</span>
              <span className="text-[10px] font-medium text-panel-text-primary flex-1 truncate">{c.to}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
type FooterState = 'none' | 'active' | 'copied';
function Footer({ state, dark }: { state: FooterState; dark: boolean }) {
  const hasChanges = state !== 'none';

  const activeBtnStyle: React.CSSProperties = dark
    ? { height: 28, borderRadius: 8, background: 'linear-gradient(to bottom, #2c2c2c 0%, #2c2c2c 45%, rgba(79,79,79,0.70) 100%)', boxShadow: 'inset 0 0 0 0.5px #383838', border: 'none', color: '#fff', fontSize: 11, fontWeight: 600, padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    : { height: 28, borderRadius: 8, background: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 45%, rgba(79,79,79,0.24) 100%)', boxShadow: 'inset 0 0 0 0.5px rgba(106, 0, 4, 0.25)', border: 'none', color: '#6a0004', fontSize: 11, fontWeight: 600, padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  const disabledBtnStyle: React.CSSProperties = { ...activeBtnStyle, opacity: 0.65, cursor: 'default' };

  return (
    <div className="flex items-center justify-between p-2 bg-panel-header-bg rounded-[12px] shrink-0">
      <div className="flex items-center gap-2">
        {hasChanges ? (
          <div className="h-[28px] px-2 rounded-[8px] border border-panel-border bg-panel-input-bg text-[11px] text-panel-text-secondary flex items-center">
            Clear
          </div>
        ) : (
          <span className="text-[11px] text-panel-text-label">No changes</span>
        )}
      </div>
      {state === 'active' && <div style={activeBtnStyle}>Copy changes</div>}
      {state === 'copied' && <div style={{ ...activeBtnStyle }}>✓ Copied</div>}
      {state === 'none'   && <div style={disabledBtnStyle}>Copy changes</div>}
    </div>
  );
}

// ─── Full panel composition ───────────────────────────────────────────────────
function FullPanel({
  dark,
  tab = 'design',
  content = 'empty',
  footerState = 'none',
  selectMode = false,
  withDeselect = false,
}: {
  dark: boolean;
  tab?: 'design' | 'changes';
  content?: 'empty' | 'element' | 'changes-empty' | 'changes';
  footerState?: FooterState;
  selectMode?: boolean;
  withDeselect?: boolean;
}) {
  return (
    <Shell dark={dark}>
      <Header dark={dark} selectActive={selectMode} withDeselect={withDeselect} />
      <div className="flex flex-col bg-panel-bg rounded-[8px] overflow-hidden flex-1 min-h-0">
        {selectMode && <SelectBanner />}
        <TabsBar active={tab} changeCount={content === 'changes' ? 3 : 0} />
        <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
          {content === 'empty'         && <DesignEmpty />}
          {content === 'element'       && <DesignWithElement />}
          {content === 'changes-empty' && <ChangesEmpty />}
          {content === 'changes'       && <ChangesWithItems />}
        </div>
      </div>
      <Footer state={footerState} dark={dark} />
    </Shell>
  );
}

// ─── Specimen label ───────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#ccc', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
      {children}
    </div>
  );
}

function Col({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'flex-start' }}>{children}</div>;
}

function Specimen({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label>{label}</Label>{children}</div>;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ display: 'flex', gap: 48, padding: 64, minHeight: '100vh', background: '#888', flexWrap: 'wrap', alignItems: 'flex-start' }}>

      {/* Dark column */}
      <Col>
        <Specimen label="Dark — empty">
          <FullPanel dark footerState="none" />
        </Specimen>
        <Specimen label="Dark — element selected · design tab">
          <FullPanel dark content="element" footerState="active" withDeselect />
        </Specimen>
        <Specimen label="Dark — changes tab">
          <FullPanel dark tab="changes" content="changes" footerState="active" withDeselect />
        </Specimen>
        <Specimen label="Dark — select mode">
          <FullPanel dark selectMode />
        </Specimen>
      </Col>

      {/* Light column */}
      <Col>
        <Specimen label="Light — empty">
          <FullPanel dark={false} footerState="none" />
        </Specimen>
        <Specimen label="Light — element selected · design tab">
          <FullPanel dark={false} content="element" footerState="active" withDeselect />
        </Specimen>
        <Specimen label="Light — changes tab">
          <FullPanel dark={false} tab="changes" content="changes" footerState="active" withDeselect />
        </Specimen>
        <Specimen label="Light — select mode">
          <FullPanel dark={false} selectMode />
        </Specimen>
      </Col>

      {/* Footer states column */}
      <Col>
        <Specimen label="Footer — no changes (dark)">
          <div className="redline-root" style={{ display: 'inline-block' }}>
            <div className="w-[300px] rounded-[12px] bg-panel-outer p-1 font-panel"><Footer state="none" dark /></div>
          </div>
        </Specimen>
        <Specimen label="Footer — has changes (dark)">
          <div className="redline-root" style={{ display: 'inline-block' }}>
            <div className="w-[300px] rounded-[12px] bg-panel-outer p-1 font-panel"><Footer state="active" dark /></div>
          </div>
        </Specimen>
        <Specimen label="Footer — copied (dark)">
          <div className="redline-root" style={{ display: 'inline-block' }}>
            <div className="w-[300px] rounded-[12px] bg-panel-outer p-1 font-panel"><Footer state="copied" dark /></div>
          </div>
        </Specimen>
        <Specimen label="Footer — no changes (light)">
          <div className="redline-root light" style={{ display: 'inline-block' }}>
            <div className="w-[300px] rounded-[12px] bg-panel-outer p-1 font-panel"><Footer state="none" dark={false} /></div>
          </div>
        </Specimen>
        <Specimen label="Footer — has changes (light)">
          <div className="redline-root light" style={{ display: 'inline-block' }}>
            <div className="w-[300px] rounded-[12px] bg-panel-outer p-1 font-panel"><Footer state="active" dark={false} /></div>
          </div>
        </Specimen>
        <Specimen label="Footer — copied (light)">
          <div className="redline-root light" style={{ display: 'inline-block' }}>
            <div className="w-[300px] rounded-[12px] bg-panel-outer p-1 font-panel"><Footer state="copied" dark={false} /></div>
          </div>
        </Specimen>
      </Col>

    </div>
  );
}
