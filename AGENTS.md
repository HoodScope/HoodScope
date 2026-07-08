# AGENTS.md — HoodScope

Instructions for **Cursor**, **Claude**, and other AI agents in this repository.

## Scope

You are in **HoodScope only** — AI token security scanner (web + CLI).

**Do not** mix other local projects or push to wrong GitHub remotes.

| Key | Value |
|:----|:------|
| Domain | https://hoodscope.pro |
| GitHub repo | https://github.com/HoodScope/HoodScope |
| GitHub profile | https://github.com/HoodScope |
| X | https://x.com/gohoodscope |

Canonical config: `project.config.json`, `src/lib/project.ts`.

## UI rules

- **Hero terminal** → illustrative preview (sample report layout)
- **Analyze terminal** → live `/api/scan` only
- Verdicts: **CLEAR / REVIEW / FLAGGED**

## Before git push

```bash
npm run github:check
```

## Install agent

```bash
npm run install:agent -- --skill
hoodscope scan 0x... --chain robinhood
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [docs/GITHUB_SETUP.md](./docs/GITHUB_SETUP.md).
