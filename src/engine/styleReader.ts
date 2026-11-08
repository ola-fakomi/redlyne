/**
 * Reads both computed and authored CSS values for an element.
 * Falls back to computed values for cross-origin sheets.
 */

/** Read a computed style value. Always returns something. */
export function readComputed(el: Element, property: string): string {
  return getComputedStyle(el).getPropertyValue(property).trim();
}

/** Try to read the authored value from matched CSS rules. Returns null on failure. */
export function readAuthored(el: Element, property: string): string | null {
  try {
    const sheets = Array.from(document.styleSheets);
    for (const sheet of sheets) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue; // cross-origin
      }
      for (const rule of Array.from(rules)) {
        if (!(rule instanceof CSSStyleRule)) continue;
        try {
          if (!el.matches(rule.selectorText)) continue;
        } catch {
          continue;
        }
        const val = rule.style.getPropertyValue(property).trim();
        if (val) return val;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/** Detect which Tailwind classes are on an element (heuristic: class names
 *  that look like Tailwind utilities, e.g. p-6, rounded-xl, text-sm). */
export function readTailwindClasses(el: Element): string[] {
  const classList = Array.from(el.classList);
  // Simple heuristic: Tailwind classes are kebab-case tokens
  return classList.filter(c => /^[a-z][a-z0-9]*(-[a-z0-9/[\].]+)*$/.test(c));
}

/** Build a CSS selector path from the nearest stable ancestor. */
export function buildCssPath(el: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;
  let depth = 0;
  while (current && current !== document.documentElement && depth < 6) {
    const tag = current.tagName.toLowerCase();
    const id = current.id ? `#${current.id}` : '';
    const nthType = getNthOfType(current);
    parts.unshift(`${tag}${id}${nthType}`);
    if (id) break; // id is unique enough — stop here
    current = current.parentElement;
    depth++;
  }
  return parts.join(' > ');
}

function getNthOfType(el: Element): string {
  const siblings = el.parentElement
    ? Array.from(el.parentElement.children).filter(c => c.tagName === el.tagName)
    : [];
  if (siblings.length <= 1) return '';
  const idx = siblings.indexOf(el) + 1;
  return `:nth-of-type(${idx})`;
}

/** Guess the element label (component name or tag). */
export function readLabel(el: Element): string {
  // React fiber
  const fiber = (el as any)._reactFiber || (el as any).__reactFiber;
  if (fiber) {
    let f = fiber;
    while (f) {
      const type = f.type;
      if (typeof type === 'function' && type.displayName) return type.displayName;
      if (typeof type === 'function' && type.name && type.name !== 'div' && type.name.length > 1)
        return type.name;
      f = f.return;
    }
  }
  const dataComp = el.getAttribute('data-component') || el.getAttribute('data-testid');
  if (dataComp) return dataComp;
  return el.tagName.charAt(0) + el.tagName.slice(1).toLowerCase();
}

/** Read text preview (first 80 chars of text content). */
export function readTextPreview(el: Element): string | null {
  const text = el.textContent?.replace(/\s+/g, ' ').trim().slice(0, 80) ?? '';
  return text || null;
}

/** Detect framework heuristically. */
export function detectFramework(): { framework: string; styling: string[] } {
  const styling: string[] = [];

  // Tailwind: check for a stylesheet with @tailwind or many utility-looking rules
  const hasTailwind = document.documentElement.classList.length > 0 ||
    Array.from(document.styleSheets).some(s => {
      try {
        return Array.from(s.cssRules).some(r =>
          r instanceof CSSStyleRule && r.selectorText?.startsWith('.flex') ||
          r instanceof CSSStyleRule && r.selectorText?.startsWith('.p-')
        );
      } catch { return false; }
    });
  if (hasTailwind) styling.push('tailwind');

  // CSS Modules: class names with hashes like _className_abcd1_1
  const hasCSSModules = document.querySelectorAll('[class]').length > 0 &&
    Array.from(document.querySelectorAll('[class]')).some(el =>
      Array.from(el.classList).some(c => /_[a-z0-9]{5,}_\d+/.test(c))
    );
  if (hasCSSModules) styling.push('css-modules');

  if (styling.length === 0) styling.push('css');

  // Framework
  if ((window as any).__NEXT_DATA__) return { framework: 'next', styling };
  if ((window as any).__nuxt) return { framework: 'nuxt', styling };
  if (document.querySelector('[data-reactroot]') || (window as any).React) return { framework: 'react', styling };
  if ((window as any).Vue) return { framework: 'vue', styling };
  return { framework: 'unknown', styling };
}
