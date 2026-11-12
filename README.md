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

## Prompt optimisation (v0.0.2)

The ⚙ settings panel (gear icon, top-left of the panel) gives you three controls for shorter, cheaper prompts.

### Prompt format

| Format | What it does |
|---|---|
| **Compact** (default) | One line per change, grouped by source file. ~6–7× shorter than Detailed. |
| **Detailed** | Full Markdown with a table, all locator fields, and all 11 rules. Use this if the agent struggles to find elements. |

### Rules

Each paste can include the rules the agent should follow. Three options:

| Mode | What is included in the paste |
|---|---|
| **Short** (default) | A one-paragraph rules block in every paste. |
| **Full** | The original 11-rule block in every paste. |
| **Installed** | A single line: `Follow the Redlyne rules. Reply with one line per file.` Use this after you have installed the rules once (see below). |

### Install rules once — the biggest token saving

Instead of repeating the rules in every paste:

1. Open ⚙ Settings → expand **Prompt optimization**.
2. Click **Claude Code** or **Codex** to copy the setup prompt.
3. Paste it into your AI assistant. It will create:
   - **Claude Code**: `.claude/skills/redlyne/SKILL.md`
   - **Codex**: a `## Redlyne rules` section in `AGENTS.md`
4. Click **Yes — switch to Installed** to confirm. From now on every paste starts with one line instead of a full rules block.

### Tailwind hints

When Tailwind is detected, Redlyne suggests the exact class change alongside the CSS value:

```
border-radius: 12px → 0  [rounded-[12px] → rounded-none]
```

Toggle off in Settings → Prompt optimization if you do not use Tailwind.

### Token count

The estimated token count (`~130 tokens`) is shown next to Copy changes so you know the cost before pasting.

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
