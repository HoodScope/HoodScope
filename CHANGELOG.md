# Changelog

All notable changes to HoodScope are documented here.

## [0.1.0] — 2026-07-06

### Added

- HoodScope web app (Next.js 15, TypeScript, Tailwind)
- Token security scanner with live data from RPC, GoPlus, DexScreener
- Security score (0–100) with CLEAR / REVIEW / FLAGGED status
- Dashboard with security, liquidity, contract, ownership, holders, market panels
- CLI package (`hoodscope-cli`) with terminal report output
- Cursor agent skill for local token analysis
- 8 supported chains — Robinhood Chain as default
- GoPlus permission checks: honeypot, tax, mint, proxy, blacklist, self-destruct, buy/sell locks
- Blockscout contract verification for Robinhood Chain
- AI summary via GitHub Models (optional) or deterministic fallback

### Notes

- GoPlus does not support Robinhood Chain (chain ID 4663) as of this release
- Deployed at [hoodscope.pro](https://hoodscope.pro)

[0.1.0]: https://github.com/HoodScope/HoodScope/releases/tag/v0.1.0
