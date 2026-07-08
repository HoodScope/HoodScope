export type ChainId =
  | "robinhood"
  | "ethereum"
  | "base"
  | "arbitrum"
  | "bsc"
  | "polygon"
  | "optimism"
  | "avalanche";

export type DataSource = "rpc" | "goplus" | "dexscreener";

export type ConfidenceLevel = "high" | "medium" | "low";

/** Lower score = safer. SAFE < 25, WARN 25–59, SCOPED ≥ 60 or any danger */
export type RiskTier = "safe" | "warn" | "scoped";

/** CLEAR · REVIEW · FLAGGED */
export type Verdict = "go" | "caution" | "no-go";

export interface DangerFinding {
  id: string;
  label: string;
  reason: string;
}

export interface Finding {
  id: string;
  category: string;
  label: string;
  value: string;
  status: "pass" | "warn" | "fail" | "unknown";
  confidence: ConfidenceLevel;
  sources: DataSource[];
  points?: number;
}

export interface ScanReport {
  address: string;
  chain: ChainId;
  tokenName: string | null;
  tokenSymbol: string | null;
  scannedAt: string;
  /** Security score 0–100 — higher is safer */
  riskScore: number;
  riskTier: RiskTier;
  riskLabel: string;
  verdict: Verdict;
  verdictLabel: string;
  exitCode: number;
  dangerFindings: DangerFinding[];
  findings: Finding[];
  honeypot: SecurityField;
  taxes: {
    buyTax: SecurityField;
    sellTax: SecurityField;
    dynamicTax: SecurityField;
    feeModifiers: SecurityField;
    extremeFee: SecurityField;
    personalSlippage: SecurityField;
  };
  liquidity: {
    liquidity: SecurityField;
    lockedPercent: SecurityField;
    withdrawable: SecurityField;
    priceImpact: SecurityField;
    lpHolders: SecurityField;
    pairAge: SecurityField;
    depth: SecurityField;
  };
  contract: {
    verified: SecurityField;
    proxy: SecurityField;
    upgradeable: SecurityField;
    mintFunction: SecurityField;
    burnFunction: SecurityField;
    blacklist: SecurityField;
    whitelist: SecurityField;
    transferPause: SecurityField;
    tradingPause: SecurityField;
    buyRestriction: SecurityField;
    tradingCooldown: SecurityField;
    selfDestruct: SecurityField;
    externalCall: SecurityField;
    antiWhaleModifiable: SecurityField;
    ownerBalanceChange: SecurityField;
    sameCreatorHoneypot: SecurityField;
    ownerPrivileges: SecurityField;
    hiddenFunctions: SecurityField;
  };
  ownership: {
    owner: SecurityField;
    eoaOwner: SecurityField;
    multisig: SecurityField;
    renounced: SecurityField;
    history: SecurityField;
    timelock: SecurityField;
    adminPrivileges: SecurityField;
  };
  holders: {
    topHolders: SecurityField;
    whales: SecurityField;
    developerWallet: SecurityField;
    burnWallet: SecurityField;
    exchangeWallets: SecurityField;
    distribution: SecurityField;
    concentrationScore: SecurityField;
  };
  market: {
    price: SecurityField;
    fdv: SecurityField;
    liquidity: SecurityField;
    marketCap: SecurityField;
    volume: SecurityField;
    buys: SecurityField;
    sells: SecurityField;
    transactions: SecurityField;
    age: SecurityField;
    dex: SecurityField;
    pairAddress: SecurityField;
    trendingScore: SecurityField;
    momentum: SecurityField;
  };
  aiSummary: string;
  aiSummarySource: "github-models" | "deterministic";
  partialFailures: string[];
  providerStatus: ProviderStatus;
  scanDurationMs?: number;
}

export interface SecurityField {
  label: string;
  value: string;
  status: "pass" | "warn" | "fail" | "unknown";
  confidence: ConfidenceLevel;
  sources: DataSource[];
}

export interface GoPlusTokenData {
  is_honeypot?: string;
  buy_tax?: string;
  sell_tax?: string;
  is_blacklisted?: string;
  is_whitelisted?: string;
  is_mintable?: string;
  is_proxy?: string;
  can_take_back_ownership?: string;
  owner_change_balance?: string;
  hidden_owner?: string;
  selfdestruct?: string;
  external_call?: string;
  cannot_buy?: string;
  cannot_sell_all?: string;
  slippage_modifiable?: string;
  transfer_pausable?: string;
  trading_cooldown?: string;
  is_open_source?: string;
  owner_address?: string;
  owner_percent?: string;
  holder_count?: string;
  lp_holder_count?: string;
  lp_total_supply?: string;
  is_in_dex?: string;
  dex?: Array<{ liquidity?: string; name?: string }>;
  holders?: Array<{ address?: string; percent?: string; is_contract?: number }>;
  honeypot_with_same_creator?: string;
  anti_whale_modifiable?: string;
  personal_slippage_modifiable?: string;
}

export interface DexPair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceUsd?: string;
  liquidity?: { usd?: number };
  fdv?: number;
  marketCap?: number;
  volume?: { h24?: number };
  txns?: { h24?: { buys?: number; sells?: number } };
  priceChange?: { h24?: number };
  pairCreatedAt?: number;
}

export interface RpcTokenData {
  name: string | null;
  symbol: string | null;
  decimals: number | null;
  totalSupply: string | null;
  owner: string | null;
  bytecode: string | null;
  isContract: boolean;
  isProxy: boolean;
  ownerBytecode: string | null;
  ownerCallable: boolean;
}

export type ProviderState = "ok" | "unsupported" | "empty" | "failed" | "skipped";

export interface ProviderStatus {
  rpc: ProviderState;
  goplus: ProviderState;
  dexscreener: ProviderState;
  explorer: ProviderState;
}

/** @deprecated use RiskTier */
export type RiskLevel = RiskTier;

export function getVerdictExitCode(verdict: Verdict): number {
  switch (verdict) {
    case "go":
      return 0;
    case "caution":
      return 1;
    case "no-go":
      return 2;
  }
}

export function getTierColor(tier: RiskTier): string {
  switch (tier) {
    case "safe":
      return "#CCFF00";
    case "warn":
      return "#F5A623";
    case "scoped":
      return "#FF3B30";
  }
}

export function getVerdictColor(verdict: Verdict): string {
  switch (verdict) {
    case "go":
      return "#CCFF00";
    case "caution":
      return "#F5A623";
    case "no-go":
      return "#FF3B30";
  }
}
