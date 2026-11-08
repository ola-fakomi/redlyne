/**
 * In-memory change tracker (M0).
 * Keeps one ElementRecord per element. Merges repeated edits to the same
 * property, preserving the original `before` value (CH-3).
 */

import {
  type ChangeRecord,
  type ElementRecord,
  type ChangeSet,
  type Source,
  type Locator,
} from '../schema';
import {
  readComputed,
  readAuthored,
  readTailwindClasses,
  buildCssPath,
  readLabel,
  readTextPreview,
  detectFramework,
} from './styleReader';

let changeSet: ChangeSet = makeEmptyChangeSet();
let elementCounter = 0;
let changeCounter = 0;

function makeEmptyChangeSet(): ChangeSet {
  const env = detectFramework();
  return {
    schema_version: 1,
    id: `cs_${Date.now()}`,
    created_at: new Date().toISOString(),
    note: null,
    page: {
      url: location.href,
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      color_scheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    },
    environment: {
      framework: env.framework,
      styling: env.styling,
      source_plugin: false,
    },
    elements: [],
  };
}

function heuristicSource(el: Element): Source {
  return {
    confidence: 'low',
    method: 'heuristic',
    file: null,
    line: null,
    column: null,
    component_stack: [],
  };
}

function buildLocator(el: Element): Locator {
  return {
    css_path: buildCssPath(el),
    test_id: el.getAttribute('data-testid'),
    class_list: readTailwindClasses(el),
    text_preview: readTextPreview(el),
  };
}

/** Find or create an ElementRecord for this DOM element. */
function getOrCreateElement(el: Element): ElementRecord {
  // Use a temporary attribute to link the element to a record
  let elId = el.getAttribute('data-redline-track');
  if (elId) {
    const existing = changeSet.elements.find(e => e.element_id === elId);
    if (existing) return existing;
  }
  const id = `el_${++elementCounter}`;
  el.setAttribute('data-redline-track', id);
  const record: ElementRecord = {
    element_id: id,
    label: readLabel(el),
    tag: el.tagName.toLowerCase(),
    scope: 'auto',
    instance_count: 1,
    note: null,
    source: heuristicSource(el),
    locator: buildLocator(el),
    styling: {
      tailwind_classes: readTailwindClasses(el),
      matched_rules: [],
    },
    changes: [],
  };
  changeSet.elements.push(record);
  return record;
}

/** Record a style change. Merges with an existing change for the same property. */
export function recordChange(
  el: Element,
  property: string,
  newValue: string,
  description: string,
): void {
  const elRec = getOrCreateElement(el);
  const computed = readComputed(el, property);

  const existing = elRec.changes.find(c => c.property === property);
  if (existing) {
    // Update after value only; keep original before value (CH-3)
    existing.after = { value: newValue, computed: newValue, token: null };
    existing.description = description;
    existing.copied = false;
  } else {
    const authored = readAuthored(el, property);
    const id = `ch_${++changeCounter}`;
    const change: ChangeRecord = {
      change_id: id,
      kind: 'style',
      property,
      group: propertyGroup(property),
      before: { authored, computed, token: null },
      after: { value: newValue, computed: newValue, token: null },
      breakpoint: { applies: 'all', active_media: [] },
      dynamic_content: false,
      copied: false,
      description,
    };
    elRec.changes.push(change);
  }
}

/** Revert a single change (remove record and re-read the original value). */
export function revertChange(elementId: string, changeId: string): void {
  const elRec = changeSet.elements.find(e => e.element_id === elementId);
  if (!elRec) return;
  elRec.changes = elRec.changes.filter(c => c.change_id !== changeId);
  if (elRec.changes.length === 0) {
    changeSet.elements = changeSet.elements.filter(e => e.element_id !== elementId);
  }
}

/** Revert all changes for an element. */
export function revertElement(elementId: string): void {
  changeSet.elements = changeSet.elements.filter(e => e.element_id !== elementId);
}

/** Revert everything. */
export function revertAll(): void {
  changeSet = makeEmptyChangeSet();
  elementCounter = 0;
  changeCounter = 0;
}

/** Mark all changes as copied. */
export function markAllCopied(): void {
  changeSet.elements.forEach(el => {
    el.changes.forEach(c => { c.copied = true; });
  });
}

/** Set an overall note. */
export function setNote(note: string | null): void {
  changeSet.note = note;
}

/** Get current change set (read-only snapshot). */
export function getChangeSet(): ChangeSet {
  return changeSet;
}

/** Count of pending (not yet copied) changes. */
export function pendingCount(): number {
  return changeSet.elements.reduce(
    (sum, el) => sum + el.changes.filter(c => !c.copied).length,
    0,
  );
}

/** Total change count. */
export function totalCount(): number {
  return changeSet.elements.reduce((sum, el) => sum + el.changes.length, 0);
}

function propertyGroup(property: string): string {
  if (property.startsWith('padding')) return 'padding';
  if (property.startsWith('margin')) return 'margin';
  if (property.startsWith('border-radius') || property.startsWith('border-top-left') ||
      property.startsWith('border-top-right') || property.startsWith('border-bottom')) return 'radius';
  if (property.startsWith('border')) return 'border';
  if (property.startsWith('font')) return 'typography';
  if (['line-height', 'letter-spacing', 'text-align', 'text-decoration', 'text-transform'].includes(property)) return 'typography';
  if (['background-color', 'background'].includes(property)) return 'fill';
  if (property === 'color') return 'fill';
  if (['width', 'height', 'min-width', 'max-width', 'min-height', 'max-height'].includes(property)) return 'size';
  if (['display', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'gap'].includes(property)) return 'layout';
  if (['box-shadow'].includes(property)) return 'effects';
  return 'other';
}
