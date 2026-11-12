/**
 * Compact prompt format — shorter output, less agent searching.
 * Groups elements by source file. One line per change.
 */

import { type ChangeSet, type ElementRecord } from '../schema';
import { type RedlyneSettings, SHORT_RULES, FULL_RULES } from '../engine/settings';
import { mergeForDisplay, type DisplayChange } from './shorthand';
import { suggestTailwindClass } from './tailwindSuggest';

// ── Sanitize ─────────────────────────────────────────────────────────────────

function sanitize(s: string, maxLen = 200): string {
  return s
    .replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '')
    .replace(/[\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, '')
    .slice(0, maxLen);
}

// ── Page helpers ──────────────────────────────────────────────────────────────

function hostPath(url: string): string {
  try {
    const u = new URL(url);
    return u.host + u.pathname;
  } catch {
    return url;
  }
}

function stackLabel(cs: ChangeSet): string {
  const env = cs.environment;
  return [env.framework, ...env.styling]
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(', ');
}

// ── Rules line ────────────────────────────────────────────────────────────────

function rulesLine(mode: RedlyneSettings['rulesMode']): string {
  if (mode === 'installed') {
    return 'Follow the Redlyne rules. Reply with one line per file.';
  }
  if (mode === 'full') {
    return FULL_RULES;
  }
  return SHORT_RULES;
}

// ── Search hint ───────────────────────────────────────────────────────────────

/**
 * Pick the most distinctive 2–4 class string from the element's class list.
 * Strategy: start from the first arbitrary-value class (contains '['), then
 * take up to 4 consecutive classes from that position. Fall back to text, then
 * CSS path.
 *
 * The DOM querySelectorAll uniqueness check is optional (skipped when document
 * is unavailable, e.g. in tests).
 */
export function pickSearchHint(
  classes:     string[],
  textPreview: string | null,
  cssPath:     string,
): string {
  if (classes.length >= 2) {
    const firstArb = classes.findIndex(c => c.includes('['));
    const start = firstArb >= 0 ? firstArb : 0;
    const window = classes.slice(start, start + 4);

    // DOM uniqueness check — skip if document unavailable
    if (typeof document !== 'undefined' && window.length >= 2) {
      for (let len = Math.min(4, window.length); len >= 2; len--) {
        const subset = window.slice(0, len);
        const sel = subset.map(c => {
          try { return `.${CSS.escape(c)}`; } catch { return `.${c.replace(/[[\]]/g, '\\$&')}`; }
        }).join('');
        try {
          if (document.querySelectorAll(sel).length <= 5) {
            return sanitize(subset.join(' '), 160);
          }
        } catch { /* selector may be invalid */ }
      }
    }

    // Return the window without DOM check
    return sanitize(window.join(' '), 160);
  }

  if (classes.length === 1) return sanitize(classes[0], 160);
  if (textPreview) return sanitize(textPreview, 40);
  return sanitize(cssPath, 160);
}

// ── Scope label ───────────────────────────────────────────────────────────────

function scopeLabel(elRec: ElementRecord): string {
  if (elRec.instance_count > 1) {
    return `shared, ${elRec.instance_count} instances`;
  }
  return 'this instance';
}

// ── Tailwind detection ────────────────────────────────────────────────────────

function isTailwind(cs: ChangeSet): boolean {
  return cs.environment.styling.some(s => s.toLowerCase() === 'tailwind');
}

// ── Change line ───────────────────────────────────────────────────────────────

function changeLine(
  d:             DisplayChange,
  elementClasses: string[],
  tw:            boolean,
  settings:      RedlyneSettings,
): string {
  const marker = d.dynamic ? ' (dynamic, ask before changing)' : '';
  const mediaTag = d.media ? ` @ ${d.media}` : '';

  let line = `   ${d.property}: ${sanitize(d.from, 80)} → ${sanitize(d.to, 80)}${marker}${mediaTag}`;

  // Tailwind suggestion
  if (tw && settings.tailwindSuggestions) {
    const sug = suggestTailwindClass(d.property, d.to, elementClasses);
    if (sug) {
      line += `  [${sug.fromClass} → ${sug.toClass}]`;
    }
  }

  return line;
}

// ── Element block ─────────────────────────────────────────────────────────────

function elementBlock(
  elRec:  ElementRecord,
  num:    number,
  tw:     boolean,
  settings: RedlyneSettings,
): string[] {
  const lines: string[] = [];
  const src = elRec.source;
  const hasSource = src.file && src.confidence !== 'low';

  // Label — omit component name when it only repeats the tag
  const tagName = elRec.tag.toLowerCase();
  const label = elRec.label.toLowerCase() === tagName ? tagName : `${sanitize(elRec.label)} (${tagName})`;
  const lineRef = hasSource && src.line ? `, L${src.line}` : '';

  lines.push(`${num}. ${label}, ${scopeLabel(elRec)}${lineRef}`);

  if (elRec.note) {
    lines.push(`   note: ${sanitize(elRec.note)}`);
  }

  // find: and text: only when source is unknown or low confidence
  const needsLocator = !hasSource;
  if (needsLocator) {
    const hint = pickSearchHint(
      elRec.locator.class_list,
      elRec.locator.text_preview,
      elRec.locator.css_path,
    );
    if (hint) lines.push(`   find: "${hint}"`);
    if (elRec.locator.text_preview) {
      const txt = elRec.locator.text_preview;
      const truncated = txt.length > 40 ? txt.slice(0, 40) + '…' : txt;
      lines.push(`   text: "${sanitize(truncated, 44)}"`);
    }
  }

  // Changes
  const display = mergeForDisplay(elRec.changes);
  for (const d of display) {
    lines.push(changeLine(d, elRec.locator.class_list, tw, settings));
  }

  return lines;
}

// ── Main export ───────────────────────────────────────────────────────────────

export function generateCompact(cs: ChangeSet, settings: RedlyneSettings): string {
  const totalChanges = cs.elements.reduce((s, e) => s + e.changes.length, 0);
  const elCount = cs.elements.length;
  const tw = isTailwind(cs);

  const lines: string[] = [];

  // Header
  lines.push(
    `Redlyne changes · ${elCount} element${elCount !== 1 ? 's' : ''}, ${totalChanges} change${totalChanges !== 1 ? 's' : ''}`,
  );
  lines.push(`Page: ${sanitize(hostPath(cs.page.url), 200)} · ${stackLabel(cs)}`);
  if (cs.note) lines.push(`Note: ${sanitize(cs.note)}`);
  lines.push(rulesLine(settings.rulesMode));
  lines.push('');

  // Group elements by source file
  const withSource  = cs.elements.filter(e => e.changes.length > 0 && e.source.file && e.source.confidence !== 'low');
  const withoutSource = cs.elements.filter(e => e.changes.length > 0 && !(e.source.file && e.source.confidence !== 'low'));

  // Collect unique source files in order
  const fileOrder: string[] = [];
  const fileMap = new Map<string, ElementRecord[]>();
  for (const el of withSource) {
    const f = el.source.file!;
    if (!fileMap.has(f)) { fileMap.set(f, []); fileOrder.push(f); }
    fileMap.get(f)!.push(el);
  }

  let counter = 1;

  for (const file of fileOrder) {
    lines.push(`## ${sanitize(file, 200)}`);
    for (const el of fileMap.get(file)!) {
      lines.push(...elementBlock(el, counter++, tw, settings));
      lines.push('');
    }
  }

  if (withoutSource.length > 0) {
    lines.push('## Source unknown');
    for (const el of withoutSource) {
      lines.push(...elementBlock(el, counter++, tw, settings));
      lines.push('');
    }
  }

  // Trim trailing blank lines
  while (lines[lines.length - 1] === '') lines.pop();

  return lines.join('\n');
}

/** Estimated token count (chars / 4, rounded to nearest 10). */
export function estimateTokens(text: string): number {
  return Math.round(text.length / 4 / 10) * 10;
}
