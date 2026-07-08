# HoodScope Architecture

## Overview

HoodScope is a read-only token security platform. It fetches data from three public sources in parallel, merges results into a structured report, computes a deterministic security score, and optionally generates an AI summary.

```
User Request
     │
     ▼
┌─────────────┐     ┌──────────────────────────────────────────┐
│  Web / CLI  │────▶│           runTokenScan()               │
│  /api/scan  │     │                                          │
└─────────────┘     │  Promise.all([                           │
                    │    fetchRpcTokenData(),                  │
                    │    fetchGoPlusTokenSecurity(),           │
                    │    fetchDexScreenerPairs(),              │
                    │    fetchContractVerification(),          │
                    │  ])                                      │
                    │         │                                │
                    │         ▼                                │
                    │    buildReport()                         │
                    │         │                                │
                    │         ▼                                │
                    │    computeRiskScore()                    │
                    │         │                                │
                    │         ▼                                │
                    │    generateAiSummary()                   │
                    │  ])                                      │
                    └──────────────────────────────────────────┘
                              │
                              ▼
                        ScanReport JSON
```

## Data Sources

### Robinhood Chain RPC

- **URL**: `https://rpc.mainnet.chain.robinhood.com`
- **Chain ID**: 4663
- **Reads**: bytecode, name, symbol, decimals, totalSupply, owner
- **Detection**: EIP-1967 proxy slot, EIP-1167 minimal proxy bytecode
- **Never writes** to the blockchain

### GoPlus Security API

- **URL**: `https://api.gopluslabs.io/api/v1/token_security/{chainId}`
- **No API key** required for public tier
- **Provides**: honeypot, buy/sell tax, mint, proxy, blacklist, pause, hidden owner, holder data
- **Not available** on Robinhood Chain (API returns code 2022)

### DexScreener API

- **URL**: `https://api.dexscreener.com/latest/dex/tokens/{address}`
- **Provides**: price, market cap, FDV, liquidity, 24h volume, buys/sells, pair age, DEX name

### Blockscout (Robinhood Chain only)

- **URL**: `https://robinhoodchain.blockscout.com/api`
- **Provides**: contract source code verification status

## Risk Engine

Security score: **0–100** (higher = safer).

```
riskPoints = sum of weighted findings
securityScore = max(0, 100 - riskPoints)
```

| Finding | Points | Severity |
|:--------|:-------|:---------|
| Honeypot detected | 100 | danger |
| Cannot sell all | 100 | danger |
| Buy restriction | 60 | danger |
| Self-destruct | 45 | danger |
| Transfer pause | 35 | danger |
| Hidden owner | 30 | danger |
| Owner can change balances | 30 | danger |
| Low liquidity (< $10k) | 30 | warn |
| High tax (> 10%) | 25 | warn |
| ... | ... | ... |

### Status Decision

| Condition | Status |
|:----------|:-------|
| Any danger finding | **FLAGGED** |
| Score < 40 | **FLAGGED** |
| Score 40–74 | **REVIEW** |
| Score ≥ 75 | **CLEAR** |

The AI summary layer **never overrides** this decision.

## Report Structure

`ScanReport` contains:

- `riskScore`, `verdictLabel` (CLEAR/REVIEW/FLAGGED)
- `honeypot`, `taxes`, `liquidity`, `contract`, `ownership`, `holders`, `market` — each with `SecurityField` objects
- `dangerFindings` — critical issues
- `partialFailures` — data sources that returned incomplete results
- `aiSummary` — explanation text
- `findings[]` — flat list for CLI table

## CLI Formatting

The CLI (`cli/src/format/`) maps `ScanReport` to a HoodTrade-style terminal output:

1. Colored header with status + score
2. Market data row
3. Key risks bullets
4. Verify yourself recommendations
5. Findings table (`check | sev | finding`)

## Caching

| Source | Cache TTL |
|:-------|:----------|
| GoPlus | 60s (Next.js `revalidate`) |
| DexScreener | 30s |
| Blockscout | 300s |
| GoPlus supported chains | 3600s |

## Deployment

- **Web**: Vercel (Next.js serverless)
- **API**: `/api/scan?chain=&address=` — server-side scan execution
- **CLI**: Standalone Node.js bundle via `tsup`
