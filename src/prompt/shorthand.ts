/**
 * Shorthand merging — display-only.
 * The change set stays in longhand; this collapses for output only.
 */

import { type ChangeRecord } from '../schema';

export interface DisplayChange {
  property: string;
  from:     string;
  to:       string;
  dynamic?: boolean;
  media?:   string; // e.g. 'min-width: 768px' when applies === 'current'
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fromStr(changes: ChangeRecord[]): string {
  const vals = changes.map(c => c.before.authored ?? c.before.computed);
  const unique = new Set(vals);
  return unique.size === 1 ? [...unique][0] : vals.join(' ');
}

function allSameTo(changes: ChangeRecord[]): boolean {
  const vals = new Set(changes.map(c => c.after.value));
  return vals.size === 1;
}

function toDisplayChange(c: ChangeRecord): DisplayChange {
  return {
    property: c.property,
    from:     c.before.authored ?? c.before.computed,
    to:       c.after.value,
    dynamic:  c.dynamic_content || undefined,
    media:    c.breakpoint.applies === 'current' ? (c.breakpoint.active_media[0] ?? 'current') : undefined,
  };
}

// ── Shorthand groups ─────────────────────────────────────────────────────────

interface Group {
  short: string;
  sides: string[];
}

const FOUR_SIDE_GROUPS: Group[] = [
  { short: 'padding',      sides: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'] },
  { short: 'margin',       sides: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'] },
  { short: 'inset',        sides: ['inset-top', 'inset-right', 'inset-bottom', 'inset-left'] },
  { short: 'border-width', sides: ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'] },
  { short: 'border-color', sides: ['border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'] },
  { short: 'border-style', sides: ['border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style'] },
];

const RADIUS_GROUP: Group = {
  short: 'border-radius',
  sides: ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
};

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Merge longhands for display. The source ChangeRecord[] is unchanged.
 * Returns a list of DisplayChange with shorthands collapsed where all sides
 * changed to the same value.
 */
export function mergeForDisplay(changes: ChangeRecord[]): DisplayChange[] {
  const map = new Map<string, ChangeRecord>(changes.map(c => [c.property, c]));
  const handled = new Set<string>();
  const output: DisplayChange[] = [];

  function tryGroup(group: Group) {
    const present = group.sides.map(s => map.get(s)).filter((c): c is ChangeRecord => c !== undefined);
    if (present.length === 0) return;

    if (present.length === group.sides.length && allSameTo(present)) {
      // All sides changed to same value → shorthand
      output.push({
        property: group.short,
        from:     fromStr(present),
        to:       present[0].after.value,
        dynamic:  present.some(c => c.dynamic_content) || undefined,
        media:    present.some(c => c.breakpoint.applies === 'current')
          ? (present.find(c => c.breakpoint.applies === 'current')?.breakpoint.active_media[0] ?? 'current')
          : undefined,
      });
      group.sides.forEach(s => handled.add(s));
    } else {
      // Partial — list each changed longhand
      present.forEach(c => {
        output.push(toDisplayChange(c));
        handled.add(c.property);
      });
    }
  }

  // Try four-sided groups
  for (const g of FOUR_SIDE_GROUPS) tryGroup(g);

  // Border-radius
  tryGroup(RADIUS_GROUP);

  // gap: row-gap + column-gap → gap
  const rowGap = map.get('row-gap');
  const colGap = map.get('column-gap');
  if (rowGap && colGap) {
    if (rowGap.after.value === colGap.after.value) {
      output.push({
        property: 'gap',
        from: `${rowGap.before.authored ?? rowGap.before.computed} / ${colGap.before.authored ?? colGap.before.computed}`,
        to:   rowGap.after.value,
      });
      handled.add('row-gap');
      handled.add('column-gap');
    } else {
      output.push(toDisplayChange(rowGap));
      output.push(toDisplayChange(colGap));
      handled.add('row-gap');
      handled.add('column-gap');
    }
  }

  // Remaining unhandled changes — in original order
  for (const c of changes) {
    if (!handled.has(c.property)) output.push(toDisplayChange(c));
  }

  return output;
}
