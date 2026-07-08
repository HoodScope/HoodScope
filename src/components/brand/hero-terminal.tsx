"use client";

import { motion } from "framer-motion";
import type { FormattedFinding } from "@/lib/finding-formatter";
import { toTerminalFinding } from "@/lib/finding-formatter";
import {
  TerminalFindingsList,
  TerminalMarketRow,
  TerminalVerdictPill,
} from "@/components/brand/terminal-parts";
import {
  TerminalCommandLine,
  TerminalFrame,
  TerminalScanStatus,
} from "@/components/brand/terminal-frame";

const DEMO_ADDRESS = "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168";
const DEMO_CHAIN = "robinhood";

/** Robinhood preview — only checks with real RPC / Explorer / DexScreener data (no GoPlus rows) */
const DEMO_ROWS: FormattedFinding[] = [
  {
    id: "EXEC-CHAINID",
    severity: "OK",
    title: "Chain ID verified",
    description: "Confirmed on Robinhood Chain via public RPC.",
    source: "RPC",
  },
  {
    id: "CONTRACT-EXISTS",
    severity: "OK",
    title: "Contract code detected",
    description: "Deployed bytecode is present at this address.",
    source: "RPC",
  },
  {
    id: "CONTRACT-OWNER",
    severity: "OK",
    title: "Ownership renounced",
    description: "No active administrator address was detected.",
    source: "RPC",
  },
  {
    id: "CONTRACT-VERIFIED",
    severity: "OK",
    title: "Source code verified",
    description: "Verified source on the blockchain explorer.",
    source: "Explorer",
  },
  {
    id: "CONTRACT-HONEYPOT",
    severity: "OK",
    title: "No honeypot signal from market",
    description: "DexScreener shows active buy and sell flow in 24h.",
    source: "DexScreener",
  },
  {
    id: "GOP-SELL-LOCK",
    severity: "OK",
    title: "No sell restriction detected",
    description: "Sell transactions observed on DexScreener in 24h.",
    source: "DexScreener",
  },
  {
    id: "GOP-BUY-LOCK",
    severity: "OK",
    title: "No buy restriction detected",
    description: "Buy transactions observed on DexScreener in 24h.",
    source: "DexScreener",
  },
  {
    id: "GOP-PROXY",
    severity: "OK",
    title: "No proxy contract detected",
    description: "RPC bytecode shows no proxy pattern.",
    source: "RPC",
  },
  {
    id: "MKT-PRICE",
    severity: "OK",
    title: "Price: $0.0058",
    description: "Latest price from DexScreener pools.",
    source: "DexScreener",
  },
  {
    id: "MKT-LIQUIDITY",
    severity: "OK",
    title: "Liquidity depth healthy",
    description: "Pool depth is $127,584 across tracked pools.",
    source: "DexScreener",
  },
  {
    id: "MKT-MCAP",
    severity: "OK",
    title: "Market cap: $5.8M",
    description: "Estimated from DexScreener market data.",
    source: "DexScreener",
  },
  {
    id: "MKT-VOLUME",
    severity: "OK",
    title: "24h volume: $4.8M",
    description: "Rolling 24-hour volume on DexScreener.",
    source: "DexScreener",
  },
  {
    id: "MKT-ACTIVITY",
    severity: "OK",
    title: "Market activity detected",
    description: "1,842 transactions in the last 24 hours.",
    source: "DexScreener",
  },
];

const DEMO_FINDINGS = DEMO_ROWS.map(toTerminalFinding);

export function HeroTerminal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.2 }}
      className="w-full"
    >
      <TerminalFrame>
        <div className="space-y-4">
          <TerminalCommandLine address={DEMO_ADDRESS} chain={DEMO_CHAIN} />
          <TerminalScanStatus address={DEMO_ADDRESS} chain={DEMO_CHAIN} />
          <TerminalVerdictPill verdict="CLEAR" score={88} />
          <TerminalMarketRow
            price="$0.0058"
            mcap="$5.8M"
            liquidity="$127,584"
            volume="$4.8M"
          />
          <TerminalFindingsList findings={DEMO_FINDINGS} className="space-y-0 pt-1" />
        </div>
      </TerminalFrame>
    </motion.div>
  );
}
