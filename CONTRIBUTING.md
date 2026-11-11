# Contributing to Redlyne

Thank you for your interest in contributing to Redlyne by Ola Fakomi.

## Before you start

- Open an issue to discuss any significant change before writing code.
- For small fixes (typos, one-line bugs), a pull request on its own is fine.

## Setup

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/redlyne.git
cd redlyne
pnpm install

# 2. Build the extension
pnpm build

# 3. Load in Chrome
# Open chrome://extensions, enable Developer mode, click Load unpacked,
# select the .output/chrome-mv3 folder.

# 4. Run the fixture app (a React + Vite + Tailwind demo page)
cd fixtures/react-vite-tailwind
pnpm install
pnpm dev
# Open http://localhost:5173 with Redlyne loaded.

# 5. Watch mode (auto-rebuilds on save)
cd ../..
pnpm dev
```

## Run tests

```bash
pnpm test
```

Tests live in `tests/`. Add a test for any new prompt-generation logic.

## Code style

- TypeScript strict mode is on.
- React components live in `src/panel/`.
- Engine logic (CSS preview, change tracking) lives in `src/engine/`.
- The prompt generator lives in `src/prompt/generator.ts` — this is the most important file to keep correct.
- No network calls, ever. Everything stays in the browser.

## Submitting a pull request

1. Fork the repo and create a branch from `main`.
2. Make your changes and add or update tests if relevant.
3. Run `pnpm test` and confirm it passes.
4. Open a pull request with a clear description of what changed and why.
5. Keep pull requests focused — one concern per PR.

## Commit messages

Use short, plain-English imperative sentences: `Fix padding section crash`, `Add opacity control`.

## License

By contributing, you agree that your contributions will be licensed under the AGPL-3.0-or-later license.
