/**
 * Preview overlay — writes CSS previews to a constructable stylesheet so we
 * never touch the app's own stylesheets or class lists.
 *
 * Each edited element gets a temporary `data-redlyne-id` attribute.
 * Rules are keyed by that id and written with `!important` so they always win.
 */

let sheet: CSSStyleSheet | null = null;
let idCounter = 0;

function getSheet(): CSSStyleSheet {
  if (!sheet) {
    sheet = new CSSStyleSheet();
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  }
  return sheet;
}

/** Assign a stable preview id to an element if it doesn't have one yet. */
export function ensureId(el: Element): string {
  let id = el.getAttribute('data-redlyne-id');
  if (!id) {
    id = `rl-${++idCounter}`;
    el.setAttribute('data-redlyne-id', id);
  }
  return id;
}

/** Apply a single CSS property preview to an element. */
export function applyPreview(el: Element, property: string, value: string): void {
  const id = ensureId(el);
  const s = getSheet();
  const selector = `[data-redlyne-id="${id}"]`;

  // Find and replace existing rule for this selector+property, or insert new.
  const rules = Array.from(s.cssRules);
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i] as CSSStyleRule;
    if (rule.selectorText === selector) {
      rule.style.setProperty(property, value, 'important');
      return;
    }
  }
  s.insertRule(`${selector} { ${property}: ${value} !important; }`, s.cssRules.length);
}

/** Remove the preview for one property on one element. */
export function removePreview(el: Element, property: string): void {
  const id = el.getAttribute('data-redlyne-id');
  if (!id) return;
  const s = getSheet();
  const selector = `[data-redlyne-id="${id}"]`;
  const rules = Array.from(s.cssRules);
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i] as CSSStyleRule;
    if (rule.selectorText === selector) {
      rule.style.removeProperty(property);
      if (rule.style.length === 0) {
        s.deleteRule(i);
      }
      return;
    }
  }
}

/** Remove all preview rules and data-redlyne-id attributes from the page. */
export function clearAllPreviews(): void {
  if (sheet) {
    while (sheet.cssRules.length > 0) {
      sheet.deleteRule(0);
    }
  }
  document.querySelectorAll('[data-redlyne-id]').forEach(el => {
    el.removeAttribute('data-redlyne-id');
  });
}

/** Remove the constructable sheet from adoptedStyleSheets entirely. */
export function destroySheet(): void {
  if (sheet) {
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter(s => s !== sheet);
    sheet = null;
  }
}
