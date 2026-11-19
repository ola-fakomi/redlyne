/**
 * Code tab — shows computed CSS properties not covered by the Design tab UI.
 * Users can edit values directly; changes apply live and are tracked.
 */

import { useMemo, useRef, useState } from 'react';
import { applyPreview } from '@/engine/overlay';
import { recordChange } from '@/engine/changeTracker';
import { cn } from '@/lib/utils';

interface Props {
  el: Element;
  onChangeRecorded: () => void;
}

type PropDef = { prop: string; label: string };
type Group   = { group: string; props: PropDef[] };

const PROP_GROUPS: Group[] = [
  {
    group: 'Layout',
    props: [
      // position / top / right / bottom / left / z-index are in the Design tab → Position section
      { prop: 'float',        label: 'Float'        },
      { prop: 'clear',        label: 'Clear'        },
      { prop: 'aspect-ratio', label: 'Aspect ratio' },
    ],
  },
  {
    group: 'Flex child',
    props: [
      { prop: 'flex-grow',   label: 'Flex grow'   },
      { prop: 'flex-shrink', label: 'Flex shrink' },
      { prop: 'flex-basis',  label: 'Flex basis'  },
      { prop: 'order',       label: 'Order'       },
    ],
  },
  {
    group: 'Grid',
    props: [
      { prop: 'grid-template-columns', label: 'Template columns' },
      { prop: 'grid-template-rows',    label: 'Template rows'    },
      { prop: 'grid-column',           label: 'Column span'      },
      { prop: 'grid-row',              label: 'Row span'         },
      { prop: 'row-gap',               label: 'Row gap'          },
      { prop: 'column-gap',            label: 'Column gap'       },
    ],
  },
  {
    group: 'Text',
    props: [
      { prop: 'white-space',    label: 'White space'    },
      { prop: 'word-break',     label: 'Word break'     },
      { prop: 'overflow-wrap',  label: 'Overflow wrap'  },
      { prop: 'text-overflow',  label: 'Text overflow'  },
      { prop: 'vertical-align', label: 'Vertical align' },
      { prop: 'text-indent',    label: 'Text indent'    },
    ],
  },
  {
    group: 'Visual',
    props: [
      { prop: 'cursor',          label: 'Cursor'          },
      { prop: 'pointer-events',  label: 'Pointer events'  },
      { prop: 'visibility',      label: 'Visibility'      },
      { prop: 'clip-path',       label: 'Clip path'       },
      { prop: 'object-fit',      label: 'Object fit'      },
      { prop: 'object-position', label: 'Object position' },
      { prop: 'outline',         label: 'Outline'         },
      { prop: 'accent-color',    label: 'Accent color'    },
    ],
  },
  {
    group: 'Animation',
    props: [
      { prop: 'transition',      label: 'Transition'      },
      { prop: 'animation',       label: 'Animation'       },
      { prop: 'transform-origin', label: 'Transform origin' },
      { prop: 'will-change',     label: 'Will change'     },
    ],
  },
  {
    group: 'Other',
    props: [
      { prop: 'resize',               label: 'Resize'          },
      { prop: 'user-select',          label: 'User select'     },
      { prop: 'list-style',           label: 'List style'      },
      { prop: 'table-layout',         label: 'Table layout'    },
      { prop: 'scroll-behavior',      label: 'Scroll behavior' },
      { prop: 'overscroll-behavior',  label: 'Overscroll'      },
    ],
  },
];

/** Get browser-default computed values for the element's tag. */
function getDefaults(tag: string): Record<string, string> {
  const allProps = PROP_GROUPS.flatMap(g => g.props.map(p => p.prop));
  const dummy = document.createElement(tag);
  dummy.setAttribute('style', 'position:absolute;visibility:hidden;pointer-events:none;');
  document.body.appendChild(dummy);
  const cs = getComputedStyle(dummy);
  const result: Record<string, string> = {};
  for (const prop of allProps) {
    result[prop] = cs.getPropertyValue(prop).trim();
  }
  document.body.removeChild(dummy);
  return result;
}

export function CodeTab({ el, onChangeRecorded }: Props) {
  const [showAll, setShowAll] = useState(false);
  const origCache = useRef<Record<string, string>>({});

  const defaults = useMemo(
    () => getDefaults(el.tagName.toLowerCase()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [el.tagName],
  );

  function getVal(prop: string): string {
    return getComputedStyle(el).getPropertyValue(prop).trim();
  }

  function set(prop: string, val: string) {
    if (origCache.current[prop] === undefined) origCache.current[prop] = getVal(prop);
    applyPreview(el, prop, val);
    recordChange(el, prop, val, `Change ${prop}`);
    onChangeRecorded();
  }

  // Build resolved groups
  const groups = PROP_GROUPS.map(g => ({
    group: g.group,
    props: g.props.map(pd => {
      const value      = getVal(pd.prop);
      const dflt       = defaults[pd.prop] ?? '';
      const isModified = value !== dflt;
      return { ...pd, value, isModified };
    }).filter(pd => showAll || pd.isModified),
  })).filter(g => g.props.length > 0);

  const hasModified = PROP_GROUPS.some(g =>
    g.props.some(pd => getVal(pd.prop) !== (defaults[pd.prop] ?? '')),
  );

  return (
    <div className="flex flex-col text-[11px] font-panel pb-3">

      {/* Info banner */}
      <div className="mx-3 mt-2 mb-1 px-2.5 py-2 rounded-md bg-panel-input-bg border border-panel-border text-[10px] text-panel-text-label leading-relaxed">
        This tab only previews styling that is not captured by the design tab so you can edit in code.
      </div>

      {/* Modified / All toggle */}
      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="text-[10px] text-panel-text-label">
          {showAll ? 'All properties' : (hasModified ? 'Modified only' : 'No overrides detected')}
        </span>
        <button
          onClick={() => setShowAll(v => !v)}
          className="text-[10px] text-panel-blue hover:underline"
        >
          {showAll ? 'Show modified' : 'Show all'}
        </button>
      </div>

      {/* Property groups */}
      {groups.map(g => (
        <div key={g.group} className="mb-1.5">
          <span className="px-3 pb-0.5 text-[10px] text-panel-text-label font-semibold uppercase tracking-[0.06em] block">
            {g.group}
          </span>
          <div className="px-3 space-y-0.5">
            {g.props.map(pd => (
              <div
                key={pd.prop}
                className={cn(
                  'flex items-center h-[22px] rounded-md border bg-panel-input-bg',
                  pd.isModified ? 'border-panel-blue' : 'border-panel-border',
                )}
              >
                <span className="pl-1.5 text-[10px] text-panel-text-label select-none shrink-0 w-[90px] truncate">
                  {pd.label}
                </span>
                <input
                  type="text"
                  defaultValue={pd.value}
                  key={pd.value}
                  onBlur={e => {
                    const v = e.target.value.trim();
                    if (v && v !== pd.value) set(pd.prop, v);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  }}
                  className={cn(
                    'flex-1 min-w-0 bg-transparent text-[11px] focus:outline-none pr-1.5',
                    pd.isModified ? 'text-panel-blue' : 'text-panel-text-secondary',
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {!showAll && !hasModified && (
        <div className="px-3 py-6 text-center text-[11px] text-panel-text-label">
          No uncovered styles detected on this element.
        </div>
      )}

    </div>
  );
}
