# HoodScope — Sample CLI Output

## CLEAR — USDC on Ethereum

```
hoodscope scan 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 on Ethereum (RPC + GoPlus + DexScreener)...


 HoodScope — USD Coin (USDC)  CLEAR  Score 75/100
 $1.000700  |  $73.05B mcap  |  $884.30K liq  |  $61.00M 24h vol

Low observed security risk based on available data.

Key risks
  • Proxy Contract: Yes

Verify yourself
  • Confirm token contract address against official sources.
  • Check real pool depth on a DEX UI before trading.
  • Set tight slippage limits or use an aggregator.

Findings
check                 sev     finding
EXEC-CHAINID          ok      Chain verified (ethereum)
CONTRACT-EXISTS       ok      Contract code present
CONTRACT-OWNER        warn    Active ownership detected
CONTRACT-VERIFIED     ok      Source code verified
CONTRACT-HONEYPOT     ok      No honeypot detected
GOP-TAX-BUY           ok      Buy tax: 0.0%
GOP-TAX-SELL          ok      Sell tax: 0.0%
GOP-MINT              ok      Mint Function: No
GOP-PROXY             warn    Proxy Contract: Yes
GOP-BLACKLIST         ok      Blacklist: No
GOP-TRANSFER-PAUSE    ok      Transfer Pause: No
GOP-BUY-LOCK          ok      Buy Restriction: No
GOP-SELL-LOCK         ok      Trading Pause: No
MKT-PRICE             ok      Price: $1.000700
MKT-LIQUIDITY         ok      Liquidity: $884.30K
MKT-MCAP              ok      Market cap: $73.05B
MKT-VOLUME            ok      24h volume: $61.00M
MKT-ACTIVITY          ok      Market active (15234 txns / 24h)
MKT-DEX               ok      DEX: uniswap
MKT-PAIR-AGE          ok      Pair age: 4 years

Address: 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 on Ethereum (ethereum)
Sources: Robinhood Chain RPC · GoPlus Security · DexScreener
AI summary (deterministic) · 8.2s
  Status: CLEAR — security score 75/100.
  Liquidity is healthy at $884.30K.
  Source code is verified.
  No honeypot behavior detected.
  Taxes: buy 0.0%, sell 0.0%.
```

Exit code: `0`

---

## FLAGGED — Honeypot Token

```
 HoodScope — Scam Token (SCAM)  FLAGGED  Score 0/100
 $0.00000303  |  $3,030 mcap  |  $295.59 liq  |  $9,763 24h vol

High-risk token — the scanner flagged blocking issues.

Key risks
  • Honeypot detected
  • Very thin liquidity ($296)
  • Buy restriction detected

Verify yourself
  • Confirm token contract address against official sources.
  • Check real pool depth on a DEX UI before trading.
  • Set tight slippage limits or use an aggregator.

Findings
check                 sev     finding
EXEC-CHAINID          ok      Chain verified (robinhood)
CONTRACT-HONEYPOT     danger  Honeypot behavior detected
GOP-TAX-BUY           ok      Buy tax: 0.0%
GOP-TAX-SELL          danger  Sell tax: 99.0%
GOP-BUY-LOCK          danger  Buy Restriction: Yes
GOP-SELL-LOCK         danger  Trading Pause: Yes
MKT-LIQUIDITY         danger  Very thin liquidity ($295.59)
MKT-ACTIVITY          ok      Market active (847 txns / 24h)
GOP-SOURCE            info    GoPlus does not support Robinhood Chain
```

Exit code: `2`

---

## REVIEW — New Token with Warnings

```
 HoodScope — NewToken (NEW)  REVIEW  Score 55/100
 $0.001240  |  $1.24M mcap  |  $45.20K liq  |  $128.50K 24h vol

Moderate risk — some findings deserve additional attention.

Key risks
  • Active ownership detected
  • Mint Function: Yes
  • Moderate holder concentration: 18.5%

Findings
check                 sev     finding
CONTRACT-OWNER        warn    Active ownership detected
CONTRACT-VERIFIED     warn    Contract source not verified
GOP-MINT              warn    Mint Function: Yes
GOP-PROXY             warn    Proxy Contract: Yes
HOLD-WHALES           warn    Whales: 18.5%
MKT-LIQUIDITY         warn    Liquidity: $45.20K
```

Exit code: `1`
