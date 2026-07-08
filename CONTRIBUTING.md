# Contributing to HoodScope

Thank you for your interest in contributing. HoodScope is an open-source token security scanner for Robinhood Chain and EVM networks.

**Repository:** [github.com/HoodScope/HoodScope](https://github.com/HoodScope/HoodScope)  
**Site:** [hoodscope.pro](https://hoodscope.pro)

## Who contributes

| Contributor | Guide |
|:------------|:------|
| **You (human)** | This file + [docs/GITHUB_SETUP.md](./docs/GITHUB_SETUP.md) |
| **Cursor / Claude agents** | [AGENTS.md](./AGENTS.md) |

## Getting Started

```bash
git clone https://github.com/HoodScope/HoodScope.git
cd HoodScope
npm install
cp .env.example .env.local
npm run dev
```

## Before pushing to GitHub

```bash
npm run github:check
```

This repo must **only** push to `HoodScope/HoodScope` — not other local projects.

Login: [github.com/login](https://github.com/login) · Profile: [github.com/HoodScope](https://github.com/HoodScope)

## Development Commands

| Command | Description |
|:--------|:------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run cli -- scan 0x...` | Run CLI from source |
| `npm run cli:build` | Build CLI package |
| `npm run install:agent -- --skill` | Install CLI + Cursor skill |

## Pull Request Guidelines

1. **One concern per PR** — keep changes focused
2. **No UI changes unless requested** — copy and logic changes should not alter layout
3. **Use HoodScope status labels** — CLEAR / REVIEW / FLAGGED (never GO / CAUTION / NO-GO)
4. **Public APIs only** — no scraping, no private endpoints
5. **Test your scan** — run `npm run cli -- scan 0x...` before submitting
6. **Hero terminal = illustrative preview**, **Analyze terminal = live** — do not swap

## Adding a New Security Check

1. Add the data field in `src/lib/token-scan.ts`
2. Wire it into `src/lib/risk-engine.ts` if it affects the score
3. Add row in `src/lib/check-catalog.ts` + `src/lib/terminal-format.ts`
4. Document the check ID in `README.md` check reference table

## Code Style

- TypeScript strict mode
- Match existing naming and file structure
- Canonical URLs in `project.config.json` / `src/lib/project.ts`

## Questions?

Open a [GitHub Issue](https://github.com/HoodScope/HoodScope/issues) for bugs or feature requests.
