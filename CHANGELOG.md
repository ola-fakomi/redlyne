# Changelog

All notable changes to Redlyne are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Redlyne uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.0.2] — 2026-11-12

### Added

- **Compact prompt format** (new default) — groups elements by source file, one line per change, no table. ~6–7× shorter than the Detailed format, so the agent reads less and costs fewer tokens.
- **Prompt format setting** — switch between Compact (default) and Detailed in the ⚙ settings panel.
- **Rules setting** — three options:
  - *Short* (default): a one-paragraph rules block included in every paste.
  - *Installed*: a single line (`Follow the Redlyne rules. Reply with one line per file.`) once the rules are installed in the agent once.
  - *Full*: the original 11-rule block.
- **Copy setup prompt** — copies a one-time prompt to paste into Claude Code or Codex. Claude Code creates `.claude/skills/redlyne/SKILL.md`; Codex adds a section to `AGENTS.md`. After confirming it worked, click "Yes — switch to Installed" to stop embedding rules in every paste.
- **Tailwind class suggestions** — when Tailwind is detected and a class on the element sets the changed property, the compact output includes `[rounded-[12px] → rounded-none]` so the agent knows exactly which class to change. Toggle off in settings.
- **Shorthand merging** — when all four sides of padding, margin, border-radius, etc. change to the same value, the prompt collapses them to one line (`border-radius: 12px → 0`) instead of four.
- **Token count** — estimated token count (`~130 tokens`) shown next to Copy changes before the user pastes.
- **Token guidance hints** — tips for batching changes, warnings when elements have no source location, and a warning above ~4,000 tokens.
- **Search hint** — compact format picks the 2–4 most distinctive classes (preferring arbitrary-value classes like `w-[300px]`) as a `find:` hint so the agent can locate elements without a source file.
- **Direct text extraction** — `text:` field now uses the element's own direct text nodes only, not descendants.
- Settings (gear icon, header) — format, rules mode, and Tailwind hints all persist across sessions via `localStorage`.
- 63 unit tests covering shorthand merging, search hint selection, Tailwind suggestions, grouping by file, omitted defaults, all three Rules options, and a golden compact output test.

### Fixed

- `@import` rules stripped before injecting CSS into `adoptedStyleSheets` — eliminates the "import rules are not allowed here" extension error.
- Deselect button now uses a distinct icon (⊖) so it no longer clashes with the Close (×) button.
- Arrow key increment/decrement on all numeric input fields.
- Font weight dropdown height aligned to match other controls.
- Opacity display capped at 100% (regex fix for `rgb()` vs `rgba()`).
- Corner radius section now appears before Blend mode in the Design panel.
- Rotation button now rotates 90° clockwise on each click instead of resetting.

---

## [0.0.1] — 2026-11-11

Initial open-source release of **Redlyne by Ola Fakomi** under AGPL-3.0.

### Added

- Hover and click element selection with a Figma-style blue outline.
- Property panel: Auto Layout, Size, Spacing (margin), Fill, Typography, Corner radius, Stroke, Effects.
- Live CSS preview via a constructable stylesheet — never touches app code.
- Changes tab with per-change and per-element revert, plus Cmd/Ctrl+Z undo.
- **Copy changes** — one click copies a Markdown prompt with each element's location and exact before/after values.
- **Clear previews** — removes all previews and clears the change list.
- Prompt injection sanitization for all page-derived strings (SEC-1).
- Fixture app: `fixtures/react-vite-tailwind` (React 19, Vite, Tailwind CSS).
- Stable manifest key so the extension ID stays fixed across installs.
- Version number displayed in the panel footer.
- GitHub Action that builds and zips the extension on each `v*` tag.
- AGPL-3.0 license.
