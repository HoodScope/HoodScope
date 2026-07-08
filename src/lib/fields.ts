import type { ConfidenceLevel, DataSource, SecurityField } from "@/lib/types/scan";

/** Internal sentinel values — never shown in UI; mapped by finding-formatter */
export const MSG = {
  GOPLUS_UNSUPPORTED: "__goplus_unsupported__",
  GOPLUS_INCONCLUSIVE: "__goplus_inconclusive__",
  NO_LIQUIDITY: "__no_liquidity__",
  NO_OWNER: "__no_owner__",
  NOT_VERIFIED: "__not_verified__",
  DATA_UNAVAILABLE: "__data_unavailable__",
  NO_TRADING: "__no_trading__",
  NO_CONTRACT: "__no_contract__",
  RPC_INCONCLUSIVE: "__rpc_inconclusive__",
  RPC_FAILED: "__rpc_failed__",
  GOPLUS_FAILED: "__goplus_failed__",
  DEX_FAILED: "__dex_failed__",
  DEX_INCONCLUSIVE: "__dex_inconclusive__",
  NOT_APPLICABLE: "__not_applicable__",
  TAX_UNKNOWN: "__tax_unknown__",
  HOLDER_UNKNOWN: "__holder_unknown__",
} as const;

export function securityField(
  label: string,
  value: string,
  status: SecurityField["status"],
  confidence: ConfidenceLevel,
  sources: DataSource[]
): SecurityField {
  return { label, value, status, confidence, sources };
}

export function unknownField(label: string, message: string = MSG.DATA_UNAVAILABLE): SecurityField {
  return securityField(label, message, "unknown", "low", []);
}

export function goplusUnsupportedField(label: string): SecurityField {
  return securityField(label, MSG.GOPLUS_UNSUPPORTED, "unknown", "low", []);
}

export function formatTax(value: number | null, goplusOk: boolean): string {
  if (!goplusOk) return MSG.GOPLUS_UNSUPPORTED;
  if (value === null) return MSG.TAX_UNKNOWN;
  return `${value.toFixed(1)}%`;
}

export function formatPercent(value: number | null, goplusOk: boolean): string {
  if (!goplusOk) return MSG.GOPLUS_UNSUPPORTED;
  if (value === null) return MSG.HOLDER_UNKNOWN;
  return `${(value * 100).toFixed(1)}%`;
}

export function formatUsd(
  value?: number | string | null,
  emptyMessage: string = MSG.DEX_INCONCLUSIVE
): string {
  if (value === undefined || value === null) return emptyMessage;
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return emptyMessage;
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

export function formatPairAge(timestamp?: number): string {
  if (!timestamp) return MSG.DEX_INCONCLUSIVE;
  const ageMs = Date.now() - timestamp;
  const days = Math.floor(ageMs / (1000 * 60 * 60 * 24));
  if (days < 1) return "< 1 day";
  if (days < 30) return `${days} days`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} months`;
  return `${Math.floor(months / 12)} years`;
}
