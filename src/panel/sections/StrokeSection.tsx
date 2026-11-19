import { useRef, useState, useEffect } from 'react';
import { EyeLinearIcon, EyeOffLinearIcon, MinusLinearIcon } from '@solar-icons/react';
import { FillPicker } from '../controls/FillPicker';
import { NumericField } from '../controls/NumericField';
import { cn } from '@/lib/utils';

interface Props {
  get: (prop: string) => string;
  getOrig: (prop: string) => string | undefined;
  set: (prop: string, val: string, desc: string) => void;
}

type SideMode = 'all' | 'top' | 'right' | 'bottom' | 'left' | 'custom';

const STYLES = ['none', 'solid', 'dashed', 'dotted'];

function colorToHex(color: string): string {
  if (!color || color === 'transparent' || color === 'none') return '#000000';
  const c = color.trim();
  if (/^#[0-9a-f]{3,8}$/i.test(c)) {
    if (c.length === 4) return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
    return c.slice(0, 7);
  }
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }
  }
  return '#000000';
}

function extractOpacity(color: string): number {
  const m = color.match(/rgba\([^)]+,\s*([\d.]+)\s*\)/);
  return m ? Math.round(parseFloat(m[1]) * 100) : 100;
}

function isGradient(val: string) {
  return val && val !== 'none' &&
    (val.includes('linear-gradient') || val.includes('radial-gradient'));
}

/** SVG icon: rectangle outline with active sides highlighted */
function SidesIcon({ mode }: { mode: SideMode }) {
  const active = 'currentColor';
  const dim = 'var(--color-panel-text-label, #666)';
  const t = mode === 'all' || mode === 'top'    || mode === 'custom' ? active : dim;
  const r = mode === 'all' || mode === 'right'  || mode === 'custom' ? active : dim;
  const b = mode === 'all' || mode === 'bottom' || mode === 'custom' ? active : dim;
  const l = mode === 'all' || mode === 'left'   || mode === 'custom' ? active : dim;
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <line x1="2" y1="1.5" x2="10" y2="1.5"  stroke={t} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10.5" y1="2" x2="10.5" y2="10" stroke={r} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="10.5" x2="10" y2="10.5" stroke={b} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1.5" y1="2" x2="1.5" y2="10"   stroke={l} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const SIDE_OPTIONS: { value: SideMode; label: string }[] = [
  { value: 'all',    label: 'All' },
  { value: 'top',    label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left',   label: 'Left' },
  { value: 'right',  label: 'Right' },
  { value: 'custom', label: 'Custom' },
];

export function StrokeSection({ get, getOrig, set }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [visible, setVisible]       = useState(true);
  const [sideMode, setSideMode]     = useState<SideMode>('all');
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close side menu on outside click.
  // Must use composedPath() — in a shadow DOM e.target is retargeted to the
  // shadow host, so contains() always returns false and the menu would close
  // before the option's click fires.
  useEffect(() => {
    if (!sideMenuOpen) return;
    function onDown(e: MouseEvent) {
      const path = e.composedPath();
      if (menuRef.current && !path.includes(menuRef.current as EventTarget)) {
        setSideMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [sideMenuOpen]);

  const color     = get('border-top-color');  // longhands always work in getComputedStyle
  const borderImg = get('border-image');

  // Chrome does not return shorthand computed values — always use longhands
  const widthTop    = get('border-top-width');
  const widthRight  = get('border-right-width');
  const widthBottom = get('border-bottom-width');
  const widthLeft   = get('border-left-width');
  const styleTop    = get('border-top-style');  // representative for the style dropdown

  const hasGradient = isGradient(borderImg);
  const isChanged =
    (getOrig('border-top-color') !== undefined && color !== getOrig('border-top-color')) ||
    (getOrig('border-image')     !== undefined && borderImg !== getOrig('border-image'));

  const swatchBg = hasGradient
    ? borderImg.replace(/\s+\d+$/, '')
    : (visible ? colorToHex(color) : 'transparent');
  const label = hasGradient
    ? (borderImg.includes('radial') ? 'Radial' : 'Linear')
    : colorToHex(color).slice(1).toUpperCase();
  const opacity = hasGradient ? 100 : extractOpacity(color);

  function handleSolidChange(hex: string, op: number) {
    const val = op < 100
      ? `${hex}${Math.round(op * 2.55).toString(16).padStart(2, '00')}`
      : hex;
    set('border-top-color',    val,  'Change stroke color');
    set('border-right-color',  val,  'Change stroke color');
    set('border-bottom-color', val,  'Change stroke color');
    set('border-left-color',   val,  'Change stroke color');
    set('border-image', 'none', 'Change stroke color');
  }

  function handleGradientChange(css: string) {
    set('border-image', `${css} 1`, 'Change stroke gradient');
    set('border-top-color',    'transparent', 'Change stroke gradient');
    set('border-right-color',  'transparent', 'Change stroke gradient');
    set('border-bottom-color', 'transparent', 'Change stroke gradient');
    set('border-left-color',   'transparent', 'Change stroke gradient');
  }

  function setAllWidths(v: string) {
    set('border-top-width',    v, 'Change border width');
    set('border-right-width',  v, 'Change border width');
    set('border-bottom-width', v, 'Change border width');
    set('border-left-width',   v, 'Change border width');
  }

  function setAllStyles(v: string) {
    set('border-top-style',    v, 'Change border style');
    set('border-right-style',  v, 'Change border style');
    set('border-bottom-style', v, 'Change border style');
    set('border-left-style',   v, 'Change border style');
  }

  function pickSide(mode: SideMode) {
    // Determine the "current" width to carry into the new mode
    const activeWidth =
      sideMode === 'right'  ? widthRight :
      sideMode === 'bottom' ? widthBottom :
      sideMode === 'left'   ? widthLeft :
      widthTop; // covers 'all', 'top', 'custom'

    if (mode === 'top' || mode === 'right' || mode === 'bottom' || mode === 'left') {
      // Only the selected side keeps the width; all others go to 0
      set('border-top-width',    mode === 'top'    ? activeWidth : '0px', 'Change border sides');
      set('border-right-width',  mode === 'right'  ? activeWidth : '0px', 'Change border sides');
      set('border-bottom-width', mode === 'bottom' ? activeWidth : '0px', 'Change border sides');
      set('border-left-width',   mode === 'left'   ? activeWidth : '0px', 'Change border sides');
    } else if (mode === 'all') {
      // Restore all sides equally from the previously active side's width
      setAllWidths(activeWidth);
    }
    // 'custom' — keep whatever values are currently on the element

    setSideMode(mode);
    setSideMenuOpen(false);
  }

  // Single-side label for the width field
  const singleSideLabel: Record<SideMode, string> = {
    all: 'W', top: 'T', right: 'R', bottom: 'B', left: 'L', custom: 'W',
  };

  return (
    <div className="px-3 pb-3 pt-1 space-y-1">
      {/* Color swatch row */}
      <div className="flex items-center gap-1">
        <div className={cn(
          'flex items-center gap-1.5 flex-1 h-[22px] px-1.5 rounded-md border bg-panel-input-bg',
          isChanged ? 'border-panel-blue' : 'border-panel-border',
        )}>
          <button
            onClick={() => setPickerOpen(o => !o)}
            className="shrink-0 rounded-sm border border-black/20 outline-none focus:ring-1 focus:ring-panel-blue"
            style={{ width: 14, height: 14, background: swatchBg }}
          />
          <span className="flex-1 text-[11px] text-panel-text-primary truncate">{label}</span>
          <span className="w-6 text-right text-[11px] text-panel-text-secondary">{opacity}</span>
          <span className="text-[10px] text-panel-text-label shrink-0">%</span>
        </div>

        <button
          onClick={() => setVisible(v => !v)}
          className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label hover:text-panel-text-primary hover:bg-panel-row-hover shrink-0"
        >
          {visible ? <EyeLinearIcon size={12} /> : <EyeOffLinearIcon size={12} />}
        </button>

        <button
          className="flex items-center justify-center w-6 h-[22px] rounded-md border border-panel-border bg-panel-input-bg text-panel-text-label hover:text-red-400 hover:bg-panel-row-hover shrink-0"
        >
          <MinusLinearIcon size={10} />
        </button>
      </div>

      {/* FillPicker */}
      {pickerOpen && (
        <div className="mt-1">
          <FillPicker
            modes={['solid', 'gradient']}
            initialMode={hasGradient ? 'gradient' : 'solid'}
            solidHex={colorToHex(color)}
            solidOpacity={extractOpacity(color)}
            gradientCss={hasGradient ? borderImg.replace(/\s+\d+$/, '') : undefined}
            onSolidChange={handleSolidChange}
            onGradientChange={handleGradientChange}
            onImageChange={() => {}}
            onClose={() => setPickerOpen(false)}
          />
        </div>
      )}

      {/* Width + style + sides button */}
      <div className="flex items-center gap-1">
        {sideMode !== 'custom' && (
          <div className="w-[72px] shrink-0">
            <NumericField
              label={singleSideLabel[sideMode]}
              value={
                sideMode === 'all'    ? widthTop :
                sideMode === 'top'    ? widthTop :
                sideMode === 'right'  ? widthRight :
                sideMode === 'bottom' ? widthBottom :
                                        widthLeft
              }
              original={
                sideMode === 'all'    ? getOrig('border-top-width') :
                sideMode === 'top'    ? getOrig('border-top-width') :
                sideMode === 'right'  ? getOrig('border-right-width') :
                sideMode === 'bottom' ? getOrig('border-bottom-width') :
                                        getOrig('border-left-width')
              }
              onChange={v => {
                if (sideMode === 'all') {
                  setAllWidths(v);
                } else {
                  set(`border-${sideMode}-width`, v, `Change ${sideMode} border width`);
                }
              }}
            />
          </div>
        )}

        <div className="relative flex-1 h-[22px] rounded-md border border-panel-border bg-panel-input-bg">
          <select
            value={styleTop}
            onChange={e => setAllStyles(e.target.value)}
            style={{ appearance: 'none', WebkitAppearance: 'none' }}
            className="absolute inset-0 w-full h-full pl-1.5 pr-5 bg-transparent text-[11px] text-panel-text-primary focus:outline-none cursor-pointer"
          >
            {STYLES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="absolute right-0 top-0 h-full flex items-center pr-1.5 pointer-events-none">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-panel-text-label">
              <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Sides toggle button */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setSideMenuOpen(o => !o)}
            className={cn(
              'flex items-center justify-center w-6 h-[22px] rounded-md border bg-panel-input-bg shrink-0',
              sideMenuOpen || sideMode !== 'all'
                ? 'border-panel-blue text-panel-text-primary'
                : 'border-panel-border text-panel-text-label hover:text-panel-text-primary hover:bg-panel-row-hover',
            )}
            title="Select border sides"
          >
            <SidesIcon mode={sideMode} />
          </button>

          {sideMenuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-28 rounded-md border border-panel-border bg-panel-bg shadow-lg py-0.5">
              {SIDE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => pickSide(opt.value)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2.5 py-1 text-[11px] hover:bg-panel-row-hover',
                    sideMode === opt.value ? 'text-panel-blue' : 'text-panel-text-primary',
                  )}
                >
                  <span className="w-3 h-3 flex items-center justify-center">
                    <SidesIcon mode={opt.value} />
                  </span>
                  {opt.label}
                  {sideMode === opt.value && (
                    <svg className="ml-auto" width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3.5 6L6.5 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom: 4-side grid */}
      {sideMode === 'custom' && (
        <div className="grid grid-cols-2 gap-1">
          <NumericField label="T" value={widthTop}    original={getOrig('border-top-width')}
            onChange={v => set('border-top-width', v, 'Change top border width')} />
          <NumericField label="R" value={widthRight}  original={getOrig('border-right-width')}
            onChange={v => set('border-right-width', v, 'Change right border width')} />
          <NumericField label="B" value={widthBottom} original={getOrig('border-bottom-width')}
            onChange={v => set('border-bottom-width', v, 'Change bottom border width')} />
          <NumericField label="L" value={widthLeft}   original={getOrig('border-left-width')}
            onChange={v => set('border-left-width', v, 'Change left border width')} />
        </div>
      )}
    </div>
  );
}
