# Redline

Figma-style live editor for the browser. Select any element, edit its CSS properties, and click **Copy changes** to paste a precise description into Claude Code.

## M0 — MVP

**What works in M0:**
- Hover and click element selection with a blue Figma-style outline
- Property panel: Auto Layout, Size, Spacing (margin), Fill, Typography, Corner radius, Stroke
- Live CSS preview via a constructable stylesheet (never touches app code)
- Changes tab with per-change and per-element revert
- **Copy changes** — one click copies the exact Markdown Claude Code needs
- **Clear previews** — removes all previews and clears the change list
- Fixture: `fixtures/react-vite-tailwind` (React 19, Vite, Tailwind CSS)

---

## Setup

```bash
cd redline
pnpm install
pnpm build
```

## Load in Chrome

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `.output/chrome-mv3` folder

## Run the fixture

```bash
cd fixtures/react-vite-tailwind
pnpm install
pnpm dev
```

The fixture runs at `http://localhost:5173`.

## Dev mode (live reload)

```bash
pnpm dev
```

WXT opens a separate test browser with Redline auto-loaded.

## Run tests

```bash
pnpm test
```

---

## M0 exit check

1. Load the fixture: `cd fixtures/react-vite-tailwind && pnpm dev`
2. Open `http://localhost:5173` in Chrome (with Redline loaded)
3. Click the **⊕** button in the Redline panel (or press `Alt+Shift+D` to open the panel first if it's closed, then click ⊕)
4. Click the **Pro** pricing card
5. In the panel, change **Padding T** from its current value to something smaller (e.g. `16`)
6. Change **Gap** to `8`
7. Click **Copy changes**
8. Paste the result into Claude Code (in the fixture project)

**Expected:** Claude Code identifies `src/components/PricingCard.tsx`, updates the `gap-4` and `p-6` Tailwind classes (or the equivalent CSS), and the fixture hot-reloads to match the preview.

---

## Shortcut

| Action | Key |
|---|---|
| Toggle panel | Toolbar icon or `Alt+Shift+D` |
| Enter select mode | Click ⊕ in header |
| Cancel select | Esc |
| Deselect element | Esc or ✕ in header |
