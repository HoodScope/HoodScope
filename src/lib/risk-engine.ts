import type { DangerFinding, RiskTier, Verdict } from "@/lib/types/scan";

export interface RiskInput {
  liquidityUsd: number | null;
  renounced: boolean | null;
  isOpenSource: boolean | null;
  buyTax: number | null;
  sellTax: number | null;
  isHoneypot: boolean | null;
  topHolderPercent: number | null;
  volume24h: number | null;
  buys24h: number | null;
  sells24h: number | null;
  isProxy: boolean | null;
  isMintable: boolean | null;
  transferPausable: boolean | null;
  slippageModifiable: boolean | null;
  personalSlippageModifiable: boolean | null;
  cannotSellAll: boolean | null;
  cannotBuy: boolean | null;
  canTakeBackOwnership: boolean | null;
  ownerChangeBalance: boolean | null;
  hiddenOwner: boolean | null;
  selfdestruct: boolean | null;
  externalCall: boolean | null;
  tradingCooldown: boolean | null;
  antiWhaleModifiable: boolean | null;
  honeypotSameCreator: boolean | null;
  isInDex: boolean | null;
}

export interface RiskPoint {
  label: string;
  points: number;
  severity: "info" | "warn" | "danger";
}

function pointsLiquidity(usd: number | null): RiskPoint[] {
  if (usd === null) return [];
  if (usd === 0) return [{ label: "Zero liquidity pool", points: 100, severity: "danger" }];
  if (usd < 1_000) return [{ label: "Critically low liquidity", points: 50, severity: "danger" }];
  if (usd < 10_000) return [{ label: "Low liquidity", points: 30, severity: "warn" }];
  if (usd < 50_000) return [{ label: "Moderate liquidity", points: 15, severity: "warn" }];
  if (usd < 100_000) return [{ label: "Adequate liquidity", points: 8, severity: "info" }];
  return [];
}

function pointsHoneypot(
  isHoneypot: boolean | null,
  honeypotSameCreator: boolean | null
): RiskPoint[] {
  const pts: RiskPoint[] = [];
  if (isHoneypot) pts.push({ label: "Honeypot detected", points: 100, severity: "danger" });
  if (honeypotSameCreator) {
    pts.push({ label: "Honeypot from same creator", points: 40, severity: "danger" });
  }
  return pts;
}

function pointsTaxes(
  buy: number | null,
  sell: number | null,
  personalSlippageModifiable: boolean | null
): RiskPoint[] {
  const pts: RiskPoint[] = [];
  const max = Math.max(buy ?? 0, sell ?? 0);
  if (buy !== null || sell !== null) {
    if (max > 20) pts.push({ label: "Extreme buy/sell tax", points: 40, severity: "danger" });
    else if (max > 10) pts.push({ label: "High buy/sell tax", points: 25, severity: "warn" });
    else if (max > 5) pts.push({ label: "Elevated buy/sell tax", points: 10, severity: "warn" });
  }
  if (personalSlippageModifiable) {
    pts.push({ label: "Personal slippage modifiable", points: 12, severity: "warn" });
  }
  return pts;
}

function pointsOwnership(renounced: boolean | null): RiskPoint[] {
  if (renounced === null) return [];
  if (!renounced) return [{ label: "Active ownership", points: 15, severity: "warn" }];
  return [];
}

function pointsContract(
  isOpenSource: boolean | null,
  isProxy: boolean | null,
  isMintable: boolean | null,
  transferPausable: boolean | null,
  hiddenOwner: boolean | null,
  canTakeBackOwnership: boolean | null,
  ownerChangeBalance: boolean | null,
  selfdestruct: boolean | null,
  externalCall: boolean | null,
  antiWhaleModifiable: boolean | null
): RiskPoint[] {
  const pts: RiskPoint[] = [];
  if (isOpenSource === false) pts.push({ label: "Unverified contract", points: 12, severity: "warn" });
  if (isProxy) pts.push({ label: "Proxy contract", points: 10, severity: "warn" });
  if (isMintable) pts.push({ label: "Mint function", points: 15, severity: "warn" });
  if (transferPausable) pts.push({ label: "Transfer pause enabled", points: 35, severity: "danger" });
  if (hiddenOwner) pts.push({ label: "Hidden owner", points: 30, severity: "danger" });
  if (canTakeBackOwnership) pts.push({ label: "Owner can reclaim control", points: 25, severity: "danger" });
  if (ownerChangeBalance) pts.push({ label: "Owner can change balances", points: 30, severity: "danger" });
  if (selfdestruct) pts.push({ label: "Self-destruct enabled", points: 45, severity: "danger" });
  if (externalCall) pts.push({ label: "Risky external calls", points: 15, severity: "warn" });
  if (antiWhaleModifiable) pts.push({ label: "Anti-whale rules modifiable", points: 10, severity: "warn" });
  return pts;
}

function pointsWhales(percent: number | null): RiskPoint[] {
  if (percent === null) return [];
  if (percent > 0.35) return [{ label: "Extreme holder concentration", points: 25, severity: "warn" }];
  if (percent > 0.2) return [{ label: "High holder concentration", points: 15, severity: "warn" }];
  if (percent > 0.1) return [{ label: "Moderate holder concentration", points: 8, severity: "info" }];
  return [];
}

function pointsTrading(
  cannotSellAll: boolean | null,
  cannotBuy: boolean | null,
  slippageModifiable: boolean | null,
  tradingCooldown: boolean | null,
  isInDex: boolean | null
): RiskPoint[] {
  const pts: RiskPoint[] = [];
  if (cannotSellAll) pts.push({ label: "Cannot sell all tokens", points: 100, severity: "danger" });
  if (cannotBuy) pts.push({ label: "Buy restriction detected", points: 60, severity: "danger" });
  if (slippageModifiable) pts.push({ label: "Modifiable slippage/fees", points: 12, severity: "warn" });
  if (tradingCooldown) pts.push({ label: "Trading cooldown enabled", points: 15, severity: "warn" });
  if (isInDex === false) pts.push({ label: "Not listed on DEX", points: 20, severity: "warn" });
  return pts;
}

export function collectRiskPoints(input: RiskInput): RiskPoint[] {
  return [
    ...pointsHoneypot(input.isHoneypot, input.honeypotSameCreator),
    ...pointsLiquidity(input.liquidityUsd),
    ...pointsTaxes(input.buyTax, input.sellTax, input.personalSlippageModifiable),
    ...pointsOwnership(input.renounced),
    ...pointsContract(
      input.isOpenSource,
      input.isProxy,
      input.isMintable,
      input.transferPausable,
      input.hiddenOwner,
      input.canTakeBackOwnership,
      input.ownerChangeBalance,
      input.selfdestruct,
      input.externalCall,
      input.antiWhaleModifiable
    ),
    ...pointsWhales(input.topHolderPercent),
    ...pointsTrading(
      input.cannotSellAll,
      input.cannotBuy,
      input.slippageModifiable,
      input.tradingCooldown,
      input.isInDex
    ),
  ];
}

function getRiskTier(safetyScore: number, hasDanger: boolean): RiskTier {
  if (hasDanger || safetyScore < 40) return "scoped";
  if (safetyScore < 75) return "warn";
  return "safe";
}

function getTierLabel(tier: RiskTier): string {
  switch (tier) {
    case "safe":
      return "CLEAR";
    case "warn":
      return "REVIEW";
    case "scoped":
      return "FLAGGED";
  }
}

function getVerdict(tier: RiskTier, hasDanger: boolean): Verdict {
  if (hasDanger || tier === "scoped") return "no-go";
  if (tier === "warn") return "caution";
  return "go";
}

function getVerdictLabel(verdict: Verdict): string {
  switch (verdict) {
    case "go":
      return "CLEAR";
    case "caution":
      return "REVIEW";
    case "no-go":
      return "FLAGGED";
  }
}

export function computeRiskScore(input: RiskInput): {
  score: number;
  tier: RiskTier;
  label: string;
  verdict: Verdict;
  verdictLabel: string;
  exitCode: number;
  dangerFindings: DangerFinding[];
  riskPoints: RiskPoint[];
} {
  const riskPoints = collectRiskPoints(input);
  const dangerFindings: DangerFinding[] = riskPoints
    .filter((p) => p.severity === "danger")
    .map((p, i) => ({
      id: `danger-${i}`,
      label: p.label,
      reason: `Critical finding: ${p.label}`,
    }));

  const hasDanger = dangerFindings.length > 0;
  const riskPointsTotal = Math.min(100, riskPoints.reduce((sum, p) => sum + p.points, 0));
  const score = Math.max(0, 100 - riskPointsTotal);
  const tier = getRiskTier(score, hasDanger);
  const verdict = getVerdict(tier, hasDanger);

  return {
    score,
    tier,
    label: getTierLabel(tier),
    verdict,
    verdictLabel: getVerdictLabel(verdict),
    exitCode: verdict === "go" ? 0 : verdict === "caution" ? 1 : 2,
    dangerFindings,
    riskPoints,
  };
}
