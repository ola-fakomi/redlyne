# Chrome Web Store Listing — Redlyne

## Category
Developer Tools

## Language
English (United States)

---

## Short description (132 chars max — currently 118)

Edit any live web page with Figma-style controls, then paste every change into Claude Code as one precise prompt.

---

## Full description

Redlyne is a design inspection and editing tool for developers who build UI with AI coding assistants.

**The problem it solves**

When you iterate on UI with Claude Code or Codex, small visual fixes take the most back-and-forth. One change is easy to describe. Ten changes mean screenshots, voice notes, or painstakingly typing values. Redlyne eliminates that friction.

**How it works**

1. **Select** — click the + button (or press V), then click any element on your live page. A Figma-style selection overlay appears.
2. **Edit** — the properties panel opens. Adjust layout, spacing, fill, typography, corner radius, stroke, effects, and more. Changes apply live to the page.
3. **Copy changes** — one click generates a structured Markdown prompt listing every element you touched, with exact before and after values. Paste it into Claude Code.

**What you get in the panel**

- **Position** — CSS position type (static/relative/absolute/fixed/sticky), T/R/B/L offsets, z-index, alignment. Absolute and fixed elements show a coloured badge so you never accidentally break a positioned layout.
- **Layout / Auto layout** — toggle between block and flex, set direction, alignment grid, gap, padding, margin, and clip content.
- **Appearance** — opacity, corner radius (uniform or per corner), blend mode.
- **Fill** — solid color with HSB picker, gradient, background image. For `<img>` elements, replace the source from your computer or by URL. Pseudo-element scrims (::before / ::after) are detected and editable.
- **Typography** — font family, size, weight, line height, letter spacing, alignment, decoration, transform.
- **Stroke** — color, width per side (All / Top / Right / Bottom / Left / Custom), style.
- **Effects** — box shadow, backdrop blur.
- **Code tab** — shows computed CSS properties not covered by the visual UI (transitions, grid layout, clip-path, cursor, etc.). Editable inline.

**Prompt optimisation**

- **Compact format** (default): one line per change, grouped by source file. ~6–7× shorter than a full table.
- **Detailed format**: full Markdown table with before/after values and source locations.
- **Rules modes**: embed the full ruleset in every paste, a short summary, or just one line once you've installed the rules permanently in your project.
- **Tailwind hints**: when Tailwind is detected, the prompt suggests the exact class change alongside the CSS value.
- **Token estimate**: shown next to Copy changes so you know the cost before pasting.

**Privacy**

Redlyne makes zero network calls. All processing happens in your browser. Nothing is ever sent to any server. The extension has no analytics, no telemetry, and no accounts. Source code is on GitHub (AGPL-3.0).

**Keyboard shortcuts**

- Toggle panel: `Alt+Shift+D` or toolbar icon
- Enter select mode: `V`
- Cancel / deselect: `Esc`
- Undo last change: `Cmd/Ctrl+Z`

---

## Store URL slug (suggested)
`redlyne`

## Homepage URL
https://github.com/ola-fakomi/redlyne

## Support URL
https://github.com/ola-fakomi/redlyne/issues

## Privacy policy URL
https://ola-fakomi.github.io/redlyne/privacy  ← (see privacy-policy.html — host this)
