# HoodScope Roadmap

## Shipped

- [x] Web app — landing page + dashboard
- [x] Live scan API — RPC + GoPlus + DexScreener
- [x] Security score 0–100 with CLEAR / REVIEW / FLAGGED
- [x] 8 supported chains (Robinhood default)
- [x] CLI with terminal report (`hoodscope scan`)
- [x] Cursor agent skill
- [x] GoPlus permission checks (honeypot, tax, mint, proxy, self-destruct, etc.)
- [x] Blockscout verification for Robinhood Chain
- [x] Vercel deployment

## In Progress

- [ ] GitHub release + npm publish for `hoodscope-cli`
- [ ] GitHub Actions CI badge

## Planned

- [ ] GoPlus support for Robinhood Chain (when API adds chain 4663)
- [ ] Transaction history via Blockscout indexer
- [ ] Liquidity lock percentage detection
- [ ] Holder analysis via indexed RPC
- [ ] Watch mode — continuous token monitoring with alerts
- [ ] Telegram / Discord bot
- [ ] Browser extension for pre-trade checks
- [ ] Public API rate limiting and caching layer
- [ ] Multi-language support

## Ideas

- Custom RPC endpoint configuration per chain
- Webhook notifications for scan results
- Batch scan (multiple addresses)
- Export report as PDF
- Integration with wallet apps
