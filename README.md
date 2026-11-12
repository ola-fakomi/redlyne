# Redlyne by Ola Fakomi

Edit any web page with Figma-style controls, then paste every change into Claude Code as one precise prompt.

<video src="design/redlyne-demo.mp4" autoplay loop muted playsinline></video>

---

## The problem

When you're building UI with Claude Code, small design fixes take the most back-and-forth. One change is easy to describe. Ten changes mean screenshots, voice notes, or redoing the screen in Figma so Claude can read it.

## How it works

1. **Select** — click any element on the live page with Redlyne's Figma-style picker.
2. **Edit** — adjust spacing, layout, color, typography, radius, stroke, and effects in the properties panel. Changes show live.
3. **Copy changes** — one click generates a Markdown prompt with each element's exact before and after values. Paste it into Claude Code.

Redlyne makes no network calls. Nothing leaves your browser except what you paste.

---

## Install (Developer mode)

1. Download **[redlyne-v0.0.1.zip](https://github.com/ola-fakomi/redlyne/releases/tag/v0.0.1)** and unzip it.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (toggle, top right).
4. Click **Load unpacked** and select the unzipped `redlyne-v0.0.1` folder.

The Redlyne icon appears in your toolbar. Click it (or press `Alt+Shift+D`) to toggle the panel on any page.

The extension ID is stable — it will not change when you update.

---

## Works with Claude Code and Codex

Redlyne is designed to work with any AI coding assistant that accepts text prompts.

- **Claude Code** — paste the copied prompt directly into the Claude Code terminal. Claude reads the before/after values and applies the changes to your source files.
- **OpenAI Codex** — the same prompt works in Codex. The structured Markdown format is readable by any model.

The **Copy changes** button generates a self-contained prompt — no screenshots, no vague descriptions. Just paste and go.

---

## Try it on the demo app

The repo includes a React + Vite + Tailwind fixture you can run locally:

```bash
cd fixtures/react-vite-tailwind
pnpm install
pnpm dev
```

Open `http://localhost:5173` in Chrome (with Redlyne loaded), then:

1. Click the **+** button in the Redlyne panel (or press `V`) to enter select mode.
2. Click the **Pro** pricing card.
3. Change **Padding T** and **Gap** in the panel — the page updates live.
4. Click **Copy changes** and paste the result into Claude Code.

---

## Build from source

```bash
pnpm install
pnpm build
# Load .output/chrome-mv3 as an unpacked extension (see Install above)
```

**Watch mode** (live-rebuilds on save):

```bash
pnpm dev
```

**Tests:**

```bash
pnpm test
```

---

## Keyboard shortcuts

| Action | Key |
|---|---|
| Toggle panel | Toolbar icon or `Alt+Shift+D` |
| Enter select mode | `V` or click `+` in header |
| Cancel select | `Esc` |
| Deselect element | `Esc` or `X` in header |
| Undo last change | `Cmd/Ctrl+Z` |

---

## What's supported

- Auto layout (direction, alignment, gap)
- Size (width, height, fill/hug)
- Spacing (margin, all four sides)
- Fill (solid color, gradient, image)
- Typography (family, size, weight, line height, letter spacing, alignment, decoration)
- Corner radius (all corners or per corner)
- Stroke (color, width, style, position)
- Effects (box shadow, blur)

## Current limitations

- Works on all URLs.
- CSS-in-JS frameworks may not reflect source file locations.
- Dynamic text nodes show as low-confidence in the copied prompt.

---

## Roadmap

- Chrome Web Store listing for one-click installs.
- Support for all URLs, not just localhost.
- Responsive editing (per-breakpoint changes).
- Variable and token picker.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Bug reports and feature requests go in [Issues](../../issues).

## License

AGPL-3.0-or-later. See [LICENSE](LICENSE).

Copyright (C) 2026 Ola Fakomi.
