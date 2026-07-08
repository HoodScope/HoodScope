# HoodScope CLI — Local Install Guide

Terminal token security scanner. Analyze any token with live data from RPC, GoPlus, and DexScreener.

## Requirements

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- Internet connection (fetches live blockchain data)

---

## Option 1 — One-click install (recommended)

### Windows (PowerShell)

```powershell
git clone https://github.com/HoodScope/HoodScope.git
cd HoodScope
powershell -ExecutionPolicy Bypass -File scripts/install-cli.ps1
```

### Mac / Linux

```bash
git clone https://github.com/HoodScope/HoodScope.git
cd HoodScope
chmod +x scripts/install-cli.sh
./scripts/install-cli.sh
```

Then run from anywhere:

```bash
hoodscope scan 0xYOUR_TOKEN_ADDRESS
hoodscope chains
hoodscope skills
```

---

## Option 2 — Manual install (global command)

```bash
git clone https://github.com/HoodScope/HoodScope.git
cd HoodScope

# Install web app dependencies (shared scan engine)
npm install

# Build + link CLI globally
cd cli
npm install
npm run build
npm link
```

Verify:

```bash
hoodscope --help
hoodscope scan 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 ethereum
```

---

## Option 3 — No global install (quick test)

From the repo root, no `npm link` needed:

```bash
git clone https://github.com/HoodScope/HoodScope.git
cd HoodScope
npm install

# Run via npm script
npm run cli -- scan 0xYOUR_ADDRESS
npm run cli -- scan 0xYOUR_ADDRESS ethereum
npm run cli -- chains
npm run cli -- skills
```

---

## Option 4 — From repo root shortcut

```bash
cd HoodScope
npm install
npm run cli:install    # build + npm link
hoodscope scan 0x...
```

---

## Usage

```bash
# Default chain: robinhood
hoodscope scan 0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168

# Other chains (positional or flag)
hoodscope scan 0x... ethereum
hoodscope scan 0x... --chain base

# Scripting
hoodscope scan 0x... --quiet     # prints: CLEAR | REVIEW | FLAGGED
hoodscope scan 0x... --json     # full JSON report
echo $?                          # exit code: 0/1/2
```

## Exit codes

| Code | Status |
|------|--------|
| `0` | CLEAR |
| `1` | REVIEW |
| `2` | FLAGGED |

## Troubleshooting

### `hoodscope: command not found`

Run `npm link` again from the `cli/` folder:

```bash
cd HoodScope/cli
npm run build
npm link
```

On Windows, restart your terminal after `npm link`.

### `SyntaxError: Invalid or unexpected token`

Rebuild the CLI:

```bash
cd HoodScope/cli
npm run build
```

### Scan is slow (30–60s)

Normal on first run — fetches from 3 live APIs in parallel. Robinhood Chain RPC can be slower than Ethereum.

### GoPlus checks on Robinhood Chain

GoPlus Security does not support Robinhood Chain yet. HoodScope returns **INFO** findings that explain the network limitation instead of empty or generic errors.

GoPlus does not support Robinhood Chain yet. RPC + Blockscout + DexScreener still work.

### Permission denied on Mac/Linux install script

```bash
chmod +x scripts/install-cli.sh
```

## Optional: AI summary

```bash
export GITHUB_TOKEN=ghp_...   # models:read scope
hoodscope scan 0x...
```

Without token, a deterministic summary is used.

## Cursor agent skill

```bash
cp -r .cursor/skills/hoodscope-cli ~/.cursor/skills/hoodscope-cli
```

## Uninstall

```bash
npm unlink -g hoodscope-cli
```

---

Full project docs: [../README.md](../README.md)
