---
name: hoodscope-cli
description: >-
  Run HoodScope token security scans from the terminal. Use when the user wants
  to analyze a token, check honeypot/tax/permissions, run hoodscope scan CLI,
  install HoodScope from GitHub, or list HoodScope security capabilities locally.
---

# HoodScope CLI Skill

HoodScope is an AI-powered token security scanner. This skill runs the local CLI against live RPC, GoPlus, and DexScreener data — same engine as the web terminal.

## When to use

- User asks to scan/analyze a token address
- User wants CLI output matching the HoodScope web terminal
- User wants to install HoodScope from GitHub
- User asks what HoodScope can check (`hoodscope skills`)

## Install

From a cloned HoodScope repo (recommended):

```bash
git clone https://github.com/HoodScope/HoodScope.git
cd HoodScope
npm run install:agent -- --skill
```

Or use the CLI installer directly:

```bash
hoodscope install --skill
```

Windows (PowerShell):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-cli.ps1
hoodscope install --skill
```

Without global install:

```bash
npm run cli -- scan <0x...>
```

## Commands

```bash
hoodscope install [--skill]       # Build, link CLI, optional Cursor skill
hoodscope scan <0x...> [--chain robinhood]
hoodscope scan <0x...> --quiet     # CLEAR | REVIEW | FLAGGED
hoodscope scan <0x...> --json      # full JSON report
hoodscope chains
hoodscope skills
hoodscope --help
```

## Capabilities (`hoodscope skills`)

| Skill | Source |
|-------|--------|
| Honeypot detection | GoPlus |
| Buy/sell tax | GoPlus |
| Contract permissions (mint, proxy, blacklist, self-destruct) | GoPlus |
| Ownership & admin privileges | GoPlus + RPC |
| Liquidity & pair age | DexScreener |
| Price, market cap, volume | DexScreener |
| Security score 0–100 | HoodScope risk engine |
| Status: CLEAR / REVIEW / FLAGGED | HoodScope risk engine |

## Robinhood Chain note

GoPlus does **not** cover Robinhood Chain (chain ID 4663) yet. On robinhood, GoPlus checks are omitted from the findings table — only RPC, Blockscout, and DexScreener rows are shown. The risk score still uses all available on-chain data.

## Exit codes

- `0` = CLEAR
- `1` = REVIEW
- `2` = FLAGGED

## Optional env

- `GITHUB_TOKEN` — enables GitHub Models AI summary (models:read scope)

## Agent workflow

1. Run `hoodscope scan <address>` (add `--chain` if user specifies)
2. Read terminal output: verdict pill, market row, all 22 findings rows
3. Summarize for user — do not invent findings not in the report
4. If partial failures listed, mention which data sources failed
