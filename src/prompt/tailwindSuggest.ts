/**
 * Tailwind class suggestion — given a CSS property + target value, find the
 * Tailwind class the agent should change from/to, by scanning live stylesheets.
 *
 * Never guesses. Only suggests when it can read a matching rule from the page.
 * Falls back to an arbitrary-value class when no named class matches.
 *
 * DOM-dependent (document.styleSheets). The classValueMap can be injected for
 * unit tests.
 */

/** CSS property → Tailwind utility prefix for arbitrary-value fallback. */
const TW_PREFIX: Partial<Record<string, string>> = {
  'border-radius':            'rounded',
  'border-top-left-radius':   'rounded-tl',
  'border-top-right-radius':  'rounded-tr',
  'border-bottom-right-radius': 'rounded-br',
  'border-bottom-left-radius':  'rounded-bl',
  'padding':       'p',
  'padding-top':   'pt',
  'padding-right':  'pr',
  'padding-bottom': 'pb',
  'padding-left':   'pl',
  'margin':        'm',
  'margin-top':    'mt',
  'margin-right':  'mr',
  'margin-bottom': 'mb',
  'margin-left':   'ml',
  'gap':           'gap',
  'column-gap':    'gap-x',
  'row-gap':       'gap-y',
  'width':         'w',
  'height':        'h',
  'min-width':     'min-w',
  'max-width':     'max-w',
  'min-height':    'min-h',
  'max-height':    'max-h',
  'opacity':       'opacity',
  'border-width':       'border',
  'border-top-width':    'border-t',
  'border-right-width':  'border-r',
  'border-bottom-width': 'border-b',
  'border-left-width':   'border-l',
  'font-size':       'text',
  'font-weight':     'font',
  'line-height':     'leading',
  'letter-spacing':  'tracking',
};

/** Normalize a CSS value for comparison (treat all zero-values as equivalent). */
function norm(v: string): string {
  const t = v.trim().toLowerCase();
  if (/^0+[a-z%]*$/.test(t)) return '0';
  return t;
}

/**
 * Build a map of className → cssValue for the given property by scanning all
 * readable stylesheets on the page. Matches simple class selectors only.
 */
export function buildClassValueMap(property: string): Map<string, string> {
  const map = new Map<string, string>();
  if (typeof document === 'undefined') return map;
  try {
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList;
      try { rules = sheet.cssRules; } catch { continue; } // cross-origin
      for (const rule of Array.from(rules)) {
        if (!(rule instanceof CSSStyleRule)) continue;
        const sel = rule.selectorText;
        // Simple .className only — no pseudo, no combinators
        const m = sel?.match(/^\.(-?[_a-zA-Z][^\s:,>+~[{]*)$/);
        if (!m) continue;
        // Unescape backslashes (Tailwind uses \[ for arbitrary values)
        const cls = m[1].replace(/\\/g, '');
        const val = rule.style.getPropertyValue(property).trim();
        if (val && !map.has(cls)) map.set(cls, val);
      }
    }
  } catch { /* ignore */ }
  return map;
}

/** Build an arbitrary-value Tailwind class for property + value. */
function arbitraryClass(property: string, value: string): string | null {
  const prefix = TW_PREFIX[property];
  if (!prefix) return null;
  // Replace spaces with underscores for Tailwind arbitrary value syntax
  const v = value.trim().replace(/\s+/g, '_');
  return `${prefix}-[${v}]`;
}

export interface TailwindSuggestion {
  fromClass: string;
  toClass:   string;
}

/**
 * Suggest a Tailwind class change for a CSS property change.
 *
 * @param property       CSS property being changed
 * @param targetValue    new CSS value
 * @param elementClasses class list from the element
 * @param mapOverride    inject a pre-built map (for tests)
 */
export function suggestTailwindClass(
  property:       string,
  targetValue:    string,
  elementClasses: string[],
  mapOverride?:   Map<string, string>,
): TailwindSuggestion | null {
  if (!TW_PREFIX[property]) return null;

  const classValueMap = mapOverride ?? buildClassValueMap(property);
  if (classValueMap.size === 0) return null;

  // Find which of the element's current classes sets this property
  const fromClass = elementClasses.find(cls => classValueMap.has(cls)) ?? null;
  if (!fromClass) return null;

  const normalTarget = norm(targetValue);

  // Find a class in the stylesheet that produces the target value
  let toClass: string | null = null;
  for (const [cls, val] of classValueMap) {
    if (norm(val) === normalTarget) {
      toClass = cls;
      break;
    }
  }

  // Fall back to arbitrary value
  if (!toClass) toClass = arbitraryClass(property, targetValue);
  if (!toClass) return null;

  return { fromClass, toClass };
}
