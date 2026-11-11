# Changelog

All notable changes to Redlyne are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Redlyne uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
