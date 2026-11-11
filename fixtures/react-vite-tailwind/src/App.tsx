/**
 * Redline UI State Gallery
 * All states laid out statically — pointer-events disabled so nothing changes on interaction.
 */
import React from 'react';
import {
  MoonLinearIcon, SunLinearIcon, AddCircleLinearIcon, CloseLinearIcon,
  AddLinearIcon, Grid2x2LinearIcon, MinusLinearIcon, EyeLinearIcon,
  AlignLeftLinearIcon, AlignHorizontalCenterLinearIcon,
  AlignRightLinearIcon, AlignHorizontalSpacingLinearIcon,
  AlignTopLinearIcon, AlignVerticalCenterLinearIcon, AlignBottomLinearIcon,
  RefreshLinearIcon, FlipHorizontalLinearIcon, FlipVerticalLinearIcon,
  LinkMinimalisticLinearIcon,
} from '@solar-icons/react';
import logoDark  from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';

// ─── Icons ────────────────────────────────────────────────────────────────────
function MoonIcon()       { return <MoonLinearIcon size={14} />; }
function SunIcon()        { return <SunLinearIcon size={14} />; }
function PlusCircleIcon() { return <AddCircleLinearIcon size={14} />; }
function XIcon()          { return <CloseLinearIcon size={12} />; }
function PlusIcon()       { return <AddLinearIcon size={10} />; }
function GridIcon()       { return <Grid2x2LinearIcon size={12} />; }
function MinusIcon()      { return <MinusLinearIcon size={10} />; }
function EyeIcon()        { return <EyeLinearIcon size={12} />; }
function AlignLeftIcon()  { return <AlignLeftLinearIcon size={12} />; }
function AlignCenterIcon(){ return <AlignHorizontalCenterLinearIcon size={12} />; }
function AlignRightIcon() { return <AlignRightLinearIcon size={12} />; }
function AlignJustIcon()  { return <AlignHorizontalSpacingLinearIcon size={12} />; }

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
      <div className="w-[300px] flex flex-col rounded-[12px] font-panel select-none bg-panel-outer p-1 gap-[1px]">
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

// ─── Static FillPicker header ─────────────────────────────────────────────────
function FillPickerHeader({ active }: { active: 'solid' | 'gradient' | 'image' }) {
  return (
    <div className="flex items-center justify-between px-2 pt-2 pb-1.5 border-b border-panel-border">
      <div className="flex items-center gap-0.5">
        {/* Solid */}
        <div className={`flex items-center justify-center w-6 h-6 rounded-md ${active === 'solid' ? 'bg-panel-row-hover' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={active === 'solid' ? 'text-panel-text-primary' : 'text-panel-text-label'}>
            <rect x="2" y="2" width="10" height="10" rx="2" fill="currentColor"/>
          </svg>
        </div>
        {/* Gradient */}
        <div className={`flex items-center justify-center w-6 h-6 rounded-md ${active === 'gradient' ? 'bg-panel-row-hover' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={active === 'gradient' ? 'text-panel-text-primary' : 'text-panel-text-label'}>
            <defs><linearGradient id="fp-gi" x1="2" y1="7" x2="12" y2="7" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="currentColor"/><stop offset="100%" stopColor="currentColor" stopOpacity="0.1"/></linearGradient></defs>
            <rect x="2" y="2" width="10" height="10" rx="2" fill="url(#fp-gi)"/>
          </svg>
        </div>
        {/* Image */}
        <div className={`flex items-center justify-center w-6 h-6 rounded-md ${active === 'image' ? 'bg-panel-row-hover' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={active === 'image' ? 'text-panel-text-primary' : 'text-panel-text-label'}>
            <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M2 10l3-3 2 2 2-3 3 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="5.5" cy="5.5" r="1" fill="currentColor"/>
          </svg>
        </div>
      </div>
      {/* Close */}
      <div className="flex items-center justify-center w-6 h-6 rounded-md text-panel-text-label">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

function FillPickerSolid() {
  return (
    <div className="rounded-lg border border-panel-border bg-panel-bg select-none" style={{ width: 232 }}>
      <FillPickerHeader active="solid" />
      <div className="p-2 space-y-2">
        <div className="relative w-full rounded" style={{ height: 110 }}>
          <div className="absolute inset-0 rounded" style={{ background: 'linear-gradient(to right, #fff, #2563eb)' }} />
          <div className="absolute inset-0 rounded" style={{ background: 'linear-gradient(to bottom, transparent, #000)' }} />
          <div className="absolute rounded-full border-2 border-white shadow" style={{ width: 12, height: 12, left: '72%', top: '38%', transform: 'translate(-50%,-50%)' }} />
        </div>
        <div className="relative h-3 rounded-full" style={{ background: 'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' }}>
          <div className="absolute rounded-full border-2 border-white shadow" style={{ width: 12, height: 12, left: '65%', top: '50%', transform: 'translate(-50%,-50%)', background: '#2563eb' }} />
        </div>
        <div className="relative h-3 rounded-full" style={{ background: 'linear-gradient(to right, transparent, #2563eb), conic-gradient(#ccc 90deg, #fff 90deg 180deg, #ccc 180deg 270deg, #fff 270deg) 0 0 / 8px 8px' }}>
          <div className="absolute rounded-full border-2 border-white shadow" style={{ width: 12, height: 12, left: '100%', top: '50%', transform: 'translate(-50%,-50%)', background: '#2563eb' }} />
        </div>
        <div className="flex items-center gap-1 pt-0.5">
          <div className="flex items-center justify-center h-[22px] px-1.5 rounded-md border border-panel-border bg-panel-input-bg w-9 shrink-0">
            <span className="text-[9px] text-panel-text-secondary tracking-wide font-medium">HEX</span>
          </div>
          <div className="flex items-center h-[22px] px-1.5 rounded-md border border-panel-border bg-panel-input-bg flex-1">
            <span className="text-[11px] text-panel-text-primary uppercase">2563EB</span>
          </div>
          <div className="flex items-center h-[22px] px-1.5 rounded-md border border-panel-border bg-panel-input-bg w-14 shrink-0 gap-0.5">
            <span className="flex-1 text-[11px] text-panel-text-primary text-right">100</span>
            <span className="text-[10px] text-panel-text-label">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FillPickerGradient() {
  const gradCss = 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)';
  return (
    <div className="rounded-lg border border-panel-border bg-panel-bg select-none" style={{ width: 232 }}>
      <FillPickerHeader active="gradient" />
      <div className="p-2 space-y-2">
        {/* Type + angle + reverse */}
        <div className="flex items-center gap-1">
          <div className="relative flex-1 h-[22px] rounded-md border border-panel-border bg-panel-input-bg">
            <span className="absolute inset-0 flex items-center pl-1.5 text-[11px] text-panel-text-primary pointer-events-none">Linear</span>
            <div className="absolute right-0 top-0 h-full flex items-center pr-1.5 pointer-events-none">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-panel-text-label"><path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          <div className="flex items-center h-[22px] px-1.5 rounded-md border border-panel-border bg-panel-input-bg w-14 gap-0.5">
            <span className="flex-1 text-[11px] text-panel-text-primary text-right">90</span>
            <span className="text-[10px] text-panel-text-label">°</span>
          </div>
          <div className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4h7M7 2l2 2-2 2M10 8H3M5 6l-2 2 2 2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        {/* Gradient bar */}
        <div className="relative pb-3">
          <div className="h-4 rounded" style={{ background: gradCss }} />
          <div className="absolute bottom-0 rounded-full border-2 border-white shadow ring-1 ring-panel-blue z-10" style={{ width: 12, height: 12, left: '0%', transform: 'translateX(-50%)', background: '#2563eb' }} />
          <div className="absolute bottom-0 rounded-full border-2 border-white/80 shadow" style={{ width: 12, height: 12, left: '100%', transform: 'translateX(-50%)', background: '#7c3aed' }} />
        </div>
        {/* Mini color picker for selected stop */}
        <div className="relative w-full rounded" style={{ height: 80 }}>
          <div className="absolute inset-0 rounded" style={{ background: 'linear-gradient(to right, #fff, #2563eb)' }} />
          <div className="absolute inset-0 rounded" style={{ background: 'linear-gradient(to bottom, transparent, #000)' }} />
          <div className="absolute rounded-full border-2 border-white shadow" style={{ width: 12, height: 12, left: '72%', top: '38%', transform: 'translate(-50%,-50%)' }} />
        </div>
        <div className="relative h-3 rounded-full" style={{ background: 'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' }}>
          <div className="absolute rounded-full border-2 border-white shadow" style={{ width: 12, height: 12, left: '65%', top: '50%', transform: 'translate(-50%,-50%)', background: '#2563eb' }} />
        </div>
        <div className="relative h-3 rounded-full" style={{ background: 'linear-gradient(to right, transparent, #2563eb), conic-gradient(#ccc 90deg, #fff 90deg 180deg, #ccc 180deg 270deg, #fff 270deg) 0 0 / 8px 8px' }}>
          <div className="absolute rounded-full border-2 border-white shadow" style={{ width: 12, height: 12, left: '100%', top: '50%', transform: 'translate(-50%,-50%)', background: '#2563eb' }} />
        </div>
        <div className="flex items-center gap-1 pt-0.5">
          <div className="flex items-center justify-center h-[22px] px-1.5 rounded-md border border-panel-border bg-panel-input-bg w-9 shrink-0">
            <span className="text-[9px] text-panel-text-secondary tracking-wide font-medium">HEX</span>
          </div>
          <div className="flex items-center h-[22px] px-1.5 rounded-md border border-panel-border bg-panel-input-bg flex-1">
            <span className="text-[11px] text-panel-text-primary uppercase">2563EB</span>
          </div>
          <div className="flex items-center h-[22px] px-1.5 rounded-md border border-panel-border bg-panel-input-bg w-14 shrink-0 gap-0.5">
            <span className="flex-1 text-[11px] text-panel-text-primary text-right">100</span>
            <span className="text-[10px] text-panel-text-label">%</span>
          </div>
        </div>
        {/* Stops list */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-panel-text-label">Stops</span>
            <span className="text-[10px] text-panel-text-label">+</span>
          </div>
          <div className="space-y-0.5">
            {[
              { pos: 0,   hex: '2563EB', bg: '#2563eb', selected: true  },
              { pos: 100, hex: '7C3AED', bg: '#7c3aed', selected: false },
            ].map((s, i) => (
              <div key={i} className={`flex items-center gap-1 h-[22px] px-1.5 rounded-md border ${s.selected ? 'border-panel-blue bg-panel-input-bg' : 'border-panel-border bg-panel-input-bg'}`}>
                <span className="text-[10px] text-panel-text-secondary w-7 shrink-0">{s.pos}%</span>
                <div className="w-[12px] h-[12px] rounded-sm border border-black/20 shrink-0" style={{ background: s.bg }} />
                <span className="flex-1 text-[11px] text-panel-text-primary truncate uppercase">{s.hex}</span>
                <span className="text-[10px] text-panel-text-secondary w-7 text-right shrink-0">100%</span>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-panel-text-label ml-0.5"><path d="M1.5 4h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FillPickerImage() {
  return (
    <div className="rounded-lg border border-panel-border bg-panel-bg select-none" style={{ width: 232 }}>
      <FillPickerHeader active="image" />
      <div className="p-2 space-y-2">
        {/* Scaling */}
        <div className="relative h-[22px] rounded-md border border-panel-border bg-panel-input-bg">
          <span className="absolute inset-0 flex items-center pl-1.5 text-[11px] text-panel-text-primary pointer-events-none">Fill</span>
          <div className="absolute right-0 top-0 h-full flex items-center pr-1.5 pointer-events-none">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-panel-text-label"><path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        {/* Preview — empty checkerboard */}
        <div className="w-full rounded-md border border-panel-border" style={{ height: 80, background: 'conic-gradient(#444 90deg, #333 90deg 180deg, #444 180deg 270deg, #333 270deg) 0 0 / 12px 12px' }} />
        {/* Upload */}
        <div className="w-full h-[26px] rounded-md border border-panel-border bg-panel-input-bg text-[11px] text-panel-text-primary flex items-center justify-center">
          Upload from computer
        </div>
        {/* Adjustments */}
        <div className="space-y-1">
          <span className="text-[10px] text-panel-text-label block">Adjustments</span>
          {[
            { label: 'Exposure',   val: 0   },
            { label: 'Contrast',   val: 10  },
            { label: 'Saturation', val: -20 },
          ].map(({ label, val }) => (
            <div key={label} className="flex items-center gap-2 h-[22px]">
              <span className="text-[10px] text-panel-text-label w-[72px] shrink-0">{label}</span>
              <div className="flex-1 h-[3px] rounded-full bg-panel-border relative">
                <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-panel-text-secondary border border-panel-bg shadow" style={{ left: `${50 + val / 2}%`, transform: 'translate(-50%, -50%)' }} />
              </div>
              <span className="text-[10px] text-panel-text-secondary w-7 text-right shrink-0">{val > 0 ? `+${val}` : val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Design tab: empty ────────────────────────────────────────────────────────
function DesignEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-32 gap-2 text-panel-text-label">
      <PlusCircleIcon />
      <span className="text-[11px]">Click or Press <kbd className="px-1 py-px rounded border border-panel-border bg-panel-input-bg font-mono text-[10px] text-panel-text-primary not-italic">v</kbd> to select an element</span>
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
      <div className="px-3 pb-2 pt-1 space-y-2">
        {/* Alignment */}
        <div className="space-y-1">
          <span className="text-[10px] text-panel-text-label block">Alignment</span>
          <div className="flex gap-0.5">
            {[
              { icon: <AlignLeftLinearIcon size={12} />,             title: 'Align left',        active: false },
              { icon: <AlignHorizontalCenterLinearIcon size={12} />, title: 'Center horizontal', active: false },
              { icon: <AlignRightLinearIcon size={12} />,            title: 'Align right',       active: false },
              { icon: <AlignTopLinearIcon size={12} />,              title: 'Align top',         active: false },
              { icon: <AlignVerticalCenterLinearIcon size={12} />,   title: 'Center vertical',   active: false },
              { icon: <AlignBottomLinearIcon size={12} />,           title: 'Align bottom',      active: false },
            ].map((btn, i) => (
              <div key={i} title={btn.title}
                className="flex items-center justify-center flex-1 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-secondary">
                {btn.icon}
              </div>
            ))}
          </div>
        </div>
        {/* Position X/Y */}
        <div className="space-y-1">
          <span className="text-[10px] text-panel-text-label block">Position</span>
          <div className="grid grid-cols-2 gap-1">
            <Field label="X" value="128" /><Field label="Y" value="64" />
          </div>
        </div>
        {/* Rotation */}
        <div className="space-y-1">
          <span className="text-[10px] text-panel-text-label block">Rotation</span>
          <div className="flex items-center gap-1">
            <div className="flex-1"><Field label="⤾" value="0deg" /></div>
            <div className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label shrink-0"><RefreshLinearIcon size={12} /></div>
            <div className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label shrink-0"><FlipHorizontalLinearIcon size={12} /></div>
            <div className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label shrink-0"><FlipVerticalLinearIcon size={12} /></div>
          </div>
        </div>
      </div>

      <SectionHeader title="Layout" />
      <div className="px-3 pb-3 pt-1 space-y-2">
        {/* Flow */}
        <div className="space-y-1">
          <span className="text-[10px] text-panel-text-label block">Flow</span>
          <div className="flex gap-0.5">
            {/* Row (active), Column, Row-wrap, Col-wrap */}
            <div className="flex items-center justify-center flex-1 h-[22px] rounded-md border border-panel-blue bg-panel-changed-bg text-panel-blue">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="3.5" width="3" height="5" rx="0.5" stroke="currentColor" strokeWidth="1"/><rect x="5" y="3.5" width="3" height="5" rx="0.5" stroke="currentColor" strokeWidth="1"/><path d="M9.5 4.5v3M11 6H8.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/></svg>
            </div>
            {['col','wrap-r','wrap-c'].map((k,i) => (
              <div key={k} className="flex items-center justify-center flex-1 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-secondary">
                {i === 0 && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="3.5" y="1" width="5" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/><rect x="3.5" y="5" width="5" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/><path d="M4.5 9.5h3M6 8.5v3" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/></svg>}
                {i === 1 && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1.5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/><rect x="5" y="1.5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/><rect x="1" y="6" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/><path d="M9.5 3H10V7.5H5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6.5l-1 1 1 1" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                {i === 2 && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/><rect x="1.5" y="5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/><rect x="6" y="1" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/><path d="M3 9.5V10H7.5V5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 6l1-1 1 1" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            ))}
          </div>
        </div>
        {/* Resizing */}
        <div className="space-y-1">
          <span className="text-[10px] text-panel-text-label block">Resizing</span>
          <div className="flex items-center gap-1">
            {/* W — Fill mode */}
            <div className="flex-1 flex items-center h-[22px] px-1.5 rounded-md border border-panel-border bg-panel-input-bg gap-1">
              <span className="text-[10px] text-panel-text-label select-none shrink-0">W</span>
              <span className="flex-1 text-[11px] text-panel-text-secondary">Fill</span>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-panel-text-label shrink-0"><path d="M2 3l2 2 2-2" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            {/* Aspect lock */}
            <div className="flex items-center justify-center w-5 h-5 rounded border border-panel-border bg-panel-input-bg text-panel-text-label shrink-0">
              <LinkMinimalisticLinearIcon size={10} />
            </div>
            {/* H — Fixed 40 */}
            <div className="flex-1 flex items-center h-[22px] px-1.5 rounded-md border border-panel-border bg-panel-input-bg gap-1">
              <span className="text-[10px] text-panel-text-label select-none shrink-0">H</span>
              <span className="flex-1 text-[11px] text-panel-text-primary">40</span>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-panel-text-label shrink-0"><path d="M2 3l2 2 2-2" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>
        {/* Spacing */}
        <div className="space-y-1">
          <span className="text-[10px] text-panel-text-label block">Spacing</span>
          <div className="flex items-center h-[22px] px-1.5 rounded-md border border-panel-border bg-panel-input-bg gap-1.5">
            <AlignHorizontalSpacingLinearIcon size={10} className="text-panel-text-label shrink-0" />
            <span className="text-[11px] text-panel-text-primary">8</span>
          </div>
        </div>
        {/* Clip content */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" className="w-3 h-3 rounded shrink-0" style={{ accentColor: 'var(--panel-accent)' }} />
          <span className="text-[11px] text-panel-text-primary">Clip content</span>
        </label>
      </div>

      <SectionHeader title="Appearance" />
      <div className="px-3 pb-2 pt-1 space-y-2">
        {/* Labels */}
        <div className="grid grid-cols-2 gap-1 pr-6">
          <span className="text-[10px] text-panel-text-label">Opacity</span>
          <span className="text-[10px] text-panel-text-label">Corner radius</span>
        </div>
        {/* Fields */}
        <div className="flex items-center gap-1">
          <div className="flex items-center h-[22px] px-1.5 rounded-md border border-panel-border bg-panel-input-bg gap-1 flex-1 min-w-0">
            <span className="w-3 h-3 rounded-sm border border-panel-border shrink-0" style={{ background: 'linear-gradient(135deg, #fff 50%, #bbb 50%)' }} />
            <span className="flex-1 text-[11px] text-panel-text-primary">100</span>
            <span className="text-[10px] text-panel-text-label shrink-0">%</span>
          </div>
          <div className="flex items-center h-[22px] px-1.5 rounded-md border border-panel-border bg-panel-input-bg gap-1 flex-1 min-w-0">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0 text-panel-text-label">
              <path d="M8 1H4a3 3 0 00-3 3v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span className="flex-1 text-[11px] text-panel-text-primary">8</span>
          </div>
          <div className="flex items-center justify-center w-5 h-[22px] rounded border border-panel-border bg-panel-input-bg text-panel-text-label shrink-0">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 3V2a1 1 0 011-1h1M6 1h1a1 1 0 011 1v1M9 6v1a1 1 0 01-1 1H7M4 9H3a1 1 0 01-1-1V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        {/* Blend mode */}
        <div className="space-y-1">
          <span className="text-[10px] text-panel-text-label block">Blend mode</span>
          <div className="flex items-center h-[22px] px-1.5 rounded-md border border-panel-border bg-panel-input-bg">
            <span className="flex-1 text-[11px] text-panel-text-primary">Normal</span>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="shrink-0 text-panel-text-label pointer-events-none">
              <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
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
      <div className="px-3 pb-2 pt-1 space-y-1.5">
        {/* Fill row — solid, changed (blue border) */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1.5 flex-1 h-[22px] px-1.5 rounded-md border border-panel-blue bg-panel-input-bg">
            <div className="w-[14px] h-[14px] rounded-sm border border-black/20 shrink-0" style={{ backgroundColor: '#2563eb' }} />
            <span className="flex-1 text-[11px] text-panel-text-primary uppercase">2563EB</span>
            <span className="text-[11px] text-panel-text-secondary w-6 text-right">100</span>
            <span className="text-[10px] text-panel-text-label shrink-0">%</span>
          </div>
          <div className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label shrink-0"><EyeIcon /></div>
          <div className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label shrink-0"><MinusIcon /></div>
        </div>
        {/* FillPicker open — Solid mode */}
        <FillPickerSolid />
      </div>

      <SectionHeader title="Stroke" hasAdd />
      <div className="px-3 pb-2 pt-1 text-[11px] text-panel-text-label">None</div>

      {/* Effects */}
      <div className="flex items-center justify-between px-3 h-10 border-t border-panel-border shrink-0">
        <span className="text-[13px] font-semibold text-panel-text-primary">Effects</span>
        <div className="flex items-center gap-1.5">
          <span className="text-panel-text-label"><GridIcon /></span>
          <button className="flex items-center justify-center w-5 h-5 rounded text-panel-text-label"><PlusIcon /></button>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-3 h-7">
        <input type="checkbox" defaultChecked className="w-3 h-3 shrink-0" style={{ accentColor: 'var(--panel-accent)' }} />
        <span className="flex-1 text-[11px] text-panel-text-primary">Drop shadow</span>
        <div className="flex items-center justify-center w-4 h-4 text-panel-text-label"><EyeIcon /></div>
        <div className="flex items-center justify-center w-4 h-4 text-panel-text-label"><MinusIcon /></div>
      </div>
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
    : { height: 28, borderRadius: 8, background: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 50%, #deedff 100%)', boxShadow: 'inset 0 0 0 0.5px rgba(106, 0, 4, 0.25)', border: 'none', color: '#6a0004', fontSize: 11, fontWeight: 600, padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  const disabledBtnStyle: React.CSSProperties = { ...activeBtnStyle, opacity: 0.65, cursor: 'default' };

  return (
    <div className="flex items-center justify-between p-2 bg-panel-header-bg rounded-[8px] shrink-0">
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

      {/* FillPicker states column */}
      <Col>
        <Specimen label="FillPicker — Solid (dark)">
          <div className="redline-root" style={{ display: 'inline-block' }}>
            <div className="font-panel p-2 bg-panel-outer rounded-[12px]"><FillPickerSolid /></div>
          </div>
        </Specimen>
        <Specimen label="FillPicker — Gradient (dark)">
          <div className="redline-root" style={{ display: 'inline-block' }}>
            <div className="font-panel p-2 bg-panel-outer rounded-[12px]"><FillPickerGradient /></div>
          </div>
        </Specimen>
        <Specimen label="FillPicker — Image (dark)">
          <div className="redline-root" style={{ display: 'inline-block' }}>
            <div className="font-panel p-2 bg-panel-outer rounded-[12px]"><FillPickerImage /></div>
          </div>
        </Specimen>
        <Specimen label="FillPicker — Solid (light)">
          <div className="redline-root light" style={{ display: 'inline-block' }}>
            <div className="font-panel p-2 bg-panel-outer rounded-[12px]"><FillPickerSolid /></div>
          </div>
        </Specimen>
        <Specimen label="FillPicker — Gradient (light)">
          <div className="redline-root light" style={{ display: 'inline-block' }}>
            <div className="font-panel p-2 bg-panel-outer rounded-[12px]"><FillPickerGradient /></div>
          </div>
        </Specimen>
        <Specimen label="FillPicker — Image (light)">
          <div className="redline-root light" style={{ display: 'inline-block' }}>
            <div className="font-panel p-2 bg-panel-outer rounded-[12px]"><FillPickerImage /></div>
          </div>
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
