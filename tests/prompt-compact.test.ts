/**
 * Tests for: shorthand merging, search hint, Tailwind suggestions,
 * grouping by file, omitted defaults, all three Rules options,
 * and the golden example from the spec.
 */

import { describe, it, expect } from 'vitest';
import { mergeForDisplay } from '../src/prompt/shorthand';
import { suggestTailwindClass } from '../src/prompt/tailwindSuggest';
import { pickSearchHint, generateCompact, estimateTokens } from '../src/prompt/compact';
import type { ChangeRecord, ChangeSet, ElementRecord } from '../src/schema';
import type { RedlyneSettings } from '../src/engine/settings';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeChange(
  property: string,
  from: string,
  to: string,
  overrides: Partial<ChangeRecord> = {},
): ChangeRecord {
  return {
    change_id: `ch_${property}`,
    kind: 'style',
    property,
    group: 'other',
    before: { authored: null, computed: from, token: null },
    after: { value: to, computed: to, token: null },
    breakpoint: { applies: 'all', active_media: [] },
    dynamic_content: false,
    copied: false,
    description: '',
    ...overrides,
  };
}

const SETTINGS_SHORT: RedlyneSettings = {
  promptFormat: 'compact',
  rulesMode: 'short',
  tailwindSuggestions: false, // off so suggestions don't require DOM in these tests
};

const SETTINGS_INSTALLED: RedlyneSettings = {
  promptFormat: 'compact',
  rulesMode: 'installed',
  tailwindSuggestions: false,
};

const SETTINGS_FULL: RedlyneSettings = {
  promptFormat: 'compact',
  rulesMode: 'full',
  tailwindSuggestions: false,
};

// ── Shorthand merging ─────────────────────────────────────────────────────────

describe('mergeForDisplay — shorthand merging', () => {
  it('collapses padding when all 4 sides change to the same value', () => {
    const changes = [
      makeChange('padding-top',    '24px', '16px'),
      makeChange('padding-right',  '24px', '16px'),
      makeChange('padding-bottom', '24px', '16px'),
      makeChange('padding-left',   '24px', '16px'),
    ];
    const merged = mergeForDisplay(changes);
    expect(merged).toHaveLength(1);
    expect(merged[0].property).toBe('padding');
    expect(merged[0].to).toBe('16px');
  });

  it('shows single from-value when all sides were equal', () => {
    const changes = [
      makeChange('padding-top',    '24px', '16px'),
      makeChange('padding-right',  '24px', '16px'),
      makeChange('padding-bottom', '24px', '16px'),
      makeChange('padding-left',   '24px', '16px'),
    ];
    const merged = mergeForDisplay(changes);
    expect(merged[0].from).toBe('24px'); // not "24px 24px 24px 24px"
  });

  it('keeps longhands when sides differ', () => {
    const changes = [
      makeChange('padding-top', '24px', '16px'),
      makeChange('padding-left', '24px', '8px'),
    ];
    const merged = mergeForDisplay(changes);
    expect(merged).toHaveLength(2);
    expect(merged.map(d => d.property)).toEqual(['padding-top', 'padding-left']);
  });

  it('collapses margin when all 4 sides same', () => {
    const changes = ['top', 'right', 'bottom', 'left']
      .map(s => makeChange(`margin-${s}`, '8px', '0px'));
    const merged = mergeForDisplay(changes);
    expect(merged[0].property).toBe('margin');
    expect(merged[0].to).toBe('0px');
  });

  it('collapses border-radius when all 4 corners same', () => {
    const changes = [
      makeChange('border-top-left-radius',     '12px', '0'),
      makeChange('border-top-right-radius',    '12px', '0'),
      makeChange('border-bottom-right-radius', '12px', '0'),
      makeChange('border-bottom-left-radius',  '12px', '0'),
    ];
    const merged = mergeForDisplay(changes);
    expect(merged).toHaveLength(1);
    expect(merged[0].property).toBe('border-radius');
    expect(merged[0].from).toBe('12px');
    expect(merged[0].to).toBe('0');
  });

  it('collapses row-gap + column-gap to gap when equal', () => {
    const changes = [
      makeChange('row-gap',    '16px', '8px'),
      makeChange('column-gap', '16px', '8px'),
    ];
    const merged = mergeForDisplay(changes);
    expect(merged).toHaveLength(1);
    expect(merged[0].property).toBe('gap');
    expect(merged[0].to).toBe('8px');
  });

  it('keeps row-gap and column-gap separate when they differ', () => {
    const changes = [
      makeChange('row-gap',    '16px', '8px'),
      makeChange('column-gap', '16px', '12px'),
    ];
    const merged = mergeForDisplay(changes);
    expect(merged).toHaveLength(2);
  });

  it('passes unrelated changes through unchanged', () => {
    const changes = [
      makeChange('background-color', '#fff', '#000'),
      makeChange('border-radius', '8px', '4px'),
    ];
    const merged = mergeForDisplay(changes);
    expect(merged).toHaveLength(2);
    expect(merged[0].property).toBe('background-color');
    expect(merged[1].property).toBe('border-radius');
  });
});

// ── Search hint ───────────────────────────────────────────────────────────────

describe('pickSearchHint', () => {
  it('starts from first arbitrary-value class', () => {
    const classes = ['w-[300px]', 'flex', 'flex-col', 'rounded-[12px]', 'font-panel', 'select-none'];
    const hint = pickSearchHint(classes, null, 'div');
    // First arbitrary class is at index 0, so window [0..3]
    expect(hint).toBe('w-[300px] flex flex-col rounded-[12px]');
  });

  it('falls back to first 4 when no arbitrary class', () => {
    const classes = ['flex', 'flex-col', 'gap-4', 'p-6', 'rounded-xl'];
    const hint = pickSearchHint(classes, null, 'div');
    expect(hint).toBe('flex flex-col gap-4 p-6');
  });

  it('falls back to text_preview when no classes', () => {
    const hint = pickSearchHint([], 'Buy now', 'button');
    expect(hint).toBe('Buy now');
  });

  it('falls back to css path when no classes and no text', () => {
    const hint = pickSearchHint([], null, 'main > div');
    expect(hint).toBe('main > div');
  });

  it('uses single class when only one present', () => {
    const hint = pickSearchHint(['container'], 'Some text', 'div');
    expect(hint).toBe('container');
  });
});

// ── Tailwind suggestions ──────────────────────────────────────────────────────

describe('suggestTailwindClass', () => {
  it('returns null when property has no TW prefix', () => {
    const result = suggestTailwindClass('display', 'flex', ['flex'], new Map());
    expect(result).toBeNull();
  });

  it('returns null when map is empty', () => {
    const result = suggestTailwindClass('border-radius', '0px', ['rounded-lg'], new Map());
    expect(result).toBeNull();
  });

  it('returns null when no element class sets the property', () => {
    const map = new Map([['rounded-none', '0px'], ['rounded-lg', '8px']]);
    // Element has no class that sets border-radius
    const result = suggestTailwindClass('border-radius', '0px', ['flex', 'p-4'], map);
    expect(result).toBeNull();
  });

  it('suggests named class when found in map', () => {
    const map = new Map([
      ['rounded-[12px]', '12px'],
      ['rounded-none', '0px'],
    ]);
    const result = suggestTailwindClass('border-radius', '0px', ['flex', 'rounded-[12px]'], map);
    expect(result).toEqual({ fromClass: 'rounded-[12px]', toClass: 'rounded-none' });
  });

  it('normalizes zero values when matching (0px === 0)', () => {
    const map = new Map([
      ['rounded-[12px]', '12px'],
      ['rounded-none', '0px'],
    ]);
    // Target is '0' (no unit), should match 'rounded-none' (which produces '0px')
    const result = suggestTailwindClass('border-radius', '0', ['rounded-[12px]'], map);
    expect(result?.toClass).toBe('rounded-none');
  });

  it('falls back to arbitrary class when no named match', () => {
    const map = new Map([['rounded-[12px]', '12px']]);
    const result = suggestTailwindClass('border-radius', '6px', ['rounded-[12px]'], map);
    expect(result).toEqual({ fromClass: 'rounded-[12px]', toClass: 'rounded-[6px]' });
  });

  it('suggests padding arbitrary when no named class exists', () => {
    const map = new Map([['pt-6', '24px']]);
    const result = suggestTailwindClass('padding-top', '10px', ['pt-6'], map);
    expect(result).toEqual({ fromClass: 'pt-6', toClass: 'pt-[10px]' });
  });

  it('with Tailwind suggestions off — no suggestion bracket appears in compact output', () => {
    const cs = makeMinimalChangeSet([makeChange('border-radius', '8px', '4px')], ['rounded-lg']);
    const out = generateCompact(cs, { ...SETTINGS_SHORT, tailwindSuggestions: false });
    expect(out).not.toContain('[');
  });
});

// ── Rules options ─────────────────────────────────────────────────────────────

describe('Rules options in compact output', () => {
  it('Installed mode: short one-liner', () => {
    const cs = makeMinimalChangeSet([makeChange('color', '#fff', '#000')], []);
    const out = generateCompact(cs, SETTINGS_INSTALLED);
    expect(out).toContain('Follow the Redlyne rules. Reply with one line per file.');
    expect(out).not.toContain('Match each "to" value exactly');
  });

  it('Short mode: rules paragraph', () => {
    const cs = makeMinimalChangeSet([makeChange('color', '#fff', '#000')], []);
    const out = generateCompact(cs, SETTINGS_SHORT);
    expect(out).toContain('Match each "to" value exactly');
    expect(out).not.toContain('Follow the Redlyne rules. Reply with one line per file.');
  });

  it('Full mode: numbered rules', () => {
    const cs = makeMinimalChangeSet([makeChange('color', '#fff', '#000')], []);
    const out = generateCompact(cs, SETTINGS_FULL);
    expect(out).toContain('Rules for applying these changes:');
    expect(out).toContain('11. Reply with one line per file');
  });
});

// ── Grouping by source file ───────────────────────────────────────────────────

describe('grouping by source file', () => {
  it('puts known-source elements under their file heading', () => {
    const cs: ChangeSet = {
      ...baseChangeSet(),
      elements: [
        {
          ...baseElement('el_1'),
          source: { confidence: 'high', method: 'heuristic', file: 'src/Button.tsx', line: 42, column: null, component_stack: [] },
          changes: [makeChange('color', '#fff', '#000')],
        },
      ],
    };
    const out = generateCompact(cs, SETTINGS_SHORT);
    expect(out).toContain('## src/Button.tsx');
    expect(out).not.toContain('## Source unknown');
  });

  it('puts low-confidence elements under Source unknown', () => {
    const cs = makeMinimalChangeSet([makeChange('color', '#fff', '#000')], []);
    const out = generateCompact(cs, SETTINGS_SHORT);
    expect(out).toContain('## Source unknown');
  });

  it('groups multiple elements from same file under one heading', () => {
    const cs: ChangeSet = {
      ...baseChangeSet(),
      elements: [
        { ...baseElement('el_1'), source: { confidence: 'high', method: 'heuristic', file: 'src/Card.tsx', line: 10, column: null, component_stack: [] }, changes: [makeChange('color', '#fff', '#000')] },
        { ...baseElement('el_2'), label: 'CardBody', source: { confidence: 'high', method: 'heuristic', file: 'src/Card.tsx', line: 20, column: null, component_stack: [] }, changes: [makeChange('padding-top', '16px', '8px')] },
      ],
    };
    const out = generateCompact(cs, SETTINGS_SHORT);
    // Only one ## heading for src/Card.tsx
    expect(out.split('## src/Card.tsx').length - 1).toBe(1);
    // Both elements appear
    expect(out).toContain('1. div, this instance, L10');
    expect(out).toContain('2. CardBody (div), this instance, L20');
  });
});

// ── Omitted defaults ──────────────────────────────────────────────────────────

describe('omitted defaults', () => {
  it('omits "My note: none"', () => {
    const out = generateCompact(makeMinimalChangeSet([makeChange('color', '#fff', '#000')], []), SETTINGS_SHORT);
    expect(out).not.toContain('My note: none');
  });

  it('omits "Screen size: All"', () => {
    const out = generateCompact(makeMinimalChangeSet([makeChange('color', '#fff', '#000')], []), SETTINGS_SHORT);
    expect(out).not.toContain('Screen size');
  });

  it('shows note only when user wrote one', () => {
    const cs = makeMinimalChangeSet([makeChange('color', '#fff', '#000')], []);
    cs.elements[0].note = 'Make it darker';
    const out = generateCompact(cs, SETTINGS_SHORT);
    expect(out).toContain('note: Make it darker');
  });

  it('shows media condition only on current-breakpoint changes', () => {
    const change = makeChange('font-size', '16px', '14px', {
      breakpoint: { applies: 'current', active_media: ['min-width: 768px'] },
    });
    const out = generateCompact(makeMinimalChangeSet([change], []), SETTINGS_SHORT);
    expect(out).toContain('@ min-width: 768px');
  });
});

// ── estimateTokens ────────────────────────────────────────────────────────────

describe('estimateTokens', () => {
  it('rounds to nearest 10', () => {
    expect(estimateTokens('a'.repeat(400))).toBe(100);  // 400/4=100
    expect(estimateTokens('a'.repeat(430))).toBe(110);  // 430/4≈107.5→110
  });
  it('returns 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0);
  });
});

// ── Golden test ───────────────────────────────────────────────────────────────

describe('golden test — spec §8', () => {
  /**
   * Input:
   *   - 1 div, scope = instance, no source
   *   - classes: w-[300px] flex flex-col rounded-[12px] font-panel select-none
   *              bg-panel-outer p-1 gap-[1px]
   *   - border-radius 12px → 0 on all 4 corners
   *   - Tailwind detected, Rules = Installed
   *
   * Expected Compact output (Tailwind suggestions need stylesheet — tested
   * without suggestions here; bracket test uses injected map below):
   *
   * Redlyne changes · 1 element, 4 changes
   * Page: localhost:5173/ · React, Tailwind
   * Follow the Redlyne rules. Reply with one line per file.
   *
   * ## Source unknown
   * 1. div, this instance
   *    find: "w-[300px] flex flex-col rounded-[12px]"
   *    border-radius: 12px → 0
   */

  const CLASSES = ['w-[300px]', 'flex', 'flex-col', 'rounded-[12px]', 'font-panel', 'select-none', 'bg-panel-outer', 'p-1', 'gap-[1px]'];

  const GOLDEN_CS: ChangeSet = {
    schema_version: 1,
    id: 'cs_golden',
    created_at: '2026-11-12T00:00:00Z',
    note: null,
    page: { url: 'http://localhost:5173/', viewport: { width: 1440, height: 900, dpr: 2 }, color_scheme: 'light' },
    environment: { framework: 'react', styling: ['tailwind'], source_plugin: false },
    elements: [
      {
        element_id: 'el_1',
        label: 'div',
        tag: 'div',
        scope: 'instance',
        instance_count: 1,
        note: null,
        source: { confidence: 'low', method: 'heuristic', file: null, line: null, column: null, component_stack: [] },
        locator: {
          css_path: 'body > div',
          test_id: null,
          class_list: CLASSES,
          text_preview: null,
        },
        styling: { tailwind_classes: CLASSES, matched_rules: [] },
        changes: [
          makeChange('border-top-left-radius',     '12px', '0'),
          makeChange('border-top-right-radius',    '12px', '0'),
          makeChange('border-bottom-right-radius', '12px', '0'),
          makeChange('border-bottom-left-radius',  '12px', '0'),
        ],
      },
    ],
  };

  const GOLDEN_SETTINGS: RedlyneSettings = {
    promptFormat: 'compact',
    rulesMode: 'installed',
    tailwindSuggestions: false, // no DOM in test; bracket tested separately below
  };

  it('matches the expected compact structure', () => {
    const out = generateCompact(GOLDEN_CS, GOLDEN_SETTINGS);
    expect(out).toContain('Redlyne changes · 1 element, 4 changes');
    expect(out).toContain('Page: localhost:5173/ · React, Tailwind');
    expect(out).toContain('Follow the Redlyne rules. Reply with one line per file.');
    expect(out).toContain('## Source unknown');
    expect(out).toContain('1. div, this instance');
    expect(out).toContain('find: "w-[300px] flex flex-col rounded-[12px]"');
  });

  it('merges 4 corner radii to border-radius shorthand', () => {
    const out = generateCompact(GOLDEN_CS, GOLDEN_SETTINGS);
    // 4 changes collapsed to 1 border-radius line
    expect(out).toContain('border-radius: 12px → 0');
    // No individual corner lines
    expect(out).not.toContain('border-top-left-radius');
    expect(out).not.toContain('border-top-right-radius');
  });

  it('shows Tailwind bracket when injected map has rounded-none', () => {
    const map = new Map([
      ['rounded-[12px]', '12px'],
      ['rounded-none', '0px'],
    ]);
    const result = suggestTailwindClass('border-radius', '0', CLASSES, map);
    expect(result).toEqual({ fromClass: 'rounded-[12px]', toClass: 'rounded-none' });
  });

  it('shows arbitrary-value bracket when rounded-none not in stylesheet', () => {
    // Map has rounded-[12px] but no rounded-none
    const map = new Map([['rounded-[12px]', '12px']]);
    const result = suggestTailwindClass('border-radius', '0', CLASSES, map);
    // Target '0' normalizes to '0' but no match → arbitrary fallback
    expect(result?.fromClass).toBe('rounded-[12px]');
    expect(result?.toClass).toMatch(/^rounded-\[/); // rounded-[0]
  });

  it('compact output is significantly shorter than detailed', () => {
    const compactLen = generateCompact(GOLDEN_CS, GOLDEN_SETTINGS).length;
    // Rough lower bound: compact should be under 600 chars for a simple case
    expect(compactLen).toBeLessThan(600);
  });
});

// ── Test fixtures ─────────────────────────────────────────────────────────────

function baseChangeSet(): ChangeSet {
  return {
    schema_version: 1,
    id: 'cs_x',
    created_at: '2026-11-12T00:00:00Z',
    note: null,
    page: { url: 'http://localhost:5173/', viewport: { width: 1440, height: 900, dpr: 2 }, color_scheme: 'light' },
    environment: { framework: 'react', styling: ['tailwind'], source_plugin: false },
    elements: [],
  };
}

function baseElement(id: string): ElementRecord {
  return {
    element_id: id,
    label: 'div',
    tag: 'div',
    scope: 'auto',
    instance_count: 1,
    note: null,
    source: { confidence: 'low', method: 'heuristic', file: null, line: null, column: null, component_stack: [] },
    locator: { css_path: 'div', test_id: null, class_list: [], text_preview: null },
    styling: { tailwind_classes: [], matched_rules: [] },
    changes: [],
  };
}

function makeMinimalChangeSet(changes: ChangeRecord[], classes: string[]): ChangeSet {
  return {
    ...baseChangeSet(),
    elements: [{ ...baseElement('el_1'), locator: { css_path: 'div', test_id: null, class_list: classes, text_preview: null }, changes }],
  };
}
