## What this changes

<!-- One paragraph describing the problem and your solution. -->

## How to test

1. Build: `pnpm build`
2. Load `.output/chrome-mv3` in Chrome.
3. Run the fixture: `cd fixtures/react-vite-tailwind && pnpm dev`
4. ...

## Checklist

- [ ] `pnpm test` passes
- [ ] No network calls added
- [ ] No page styles or class lists modified (only the constructable stylesheet)
- [ ] Prompt-injection sanitization applied to any new page-derived strings
