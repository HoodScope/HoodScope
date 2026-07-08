import type { ScanReport } from "@/lib/types/scan";
import { MSG } from "@/lib/fields";

export interface DexMarketSignals {
  hasPool: boolean;
  buys24h: number;
  sells24h: number;
  hasBuyActivity: boolean;
  hasSellActivity: boolean;
  /** Active buys but zero sells in 24h */
  sellSideRestricted: boolean;
  /** Active sells but zero buys in 24h */
  buySideRestricted: boolean;
}

const DEX_FALLBACK_CHECK_IDS = new Set([
  "CONTRACT-HONEYPOT",
  "GOP-BUY-LOCK",
  "GOP-SELL-LOCK",
]);

function isInternalValue(value: string): boolean {
  return value.startsWith("__") && value.endsWith("__");
}

function parseTxnCount(value: string): number | null {
  if (isInternalValue(value) || value === MSG.NO_TRADING) return null;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}

function hasDexPool(report: ScanReport): boolean {
  if (report.providerStatus?.dexscreener !== "ok") return false;
  const liq = report.liquidity.liquidity.value;
  return liq !== MSG.NO_LIQUIDITY && !isInternalValue(liq);
}

/** Market-derived signals when GoPlus security data is missing */
export function getDexMarketSignals(report: ScanReport): DexMarketSignals | null {
  if (report.providerStatus?.dexscreener !== "ok") return null;

  const buys = parseTxnCount(report.market.buys.value);
  const sells = parseTxnCount(report.market.sells.value);
  const hasPool = hasDexPool(report);

  if (!hasPool && buys === null && sells === null) return null;

  const buys24h = buys ?? 0;
  const sells24h = sells ?? 0;

  return {
    hasPool,
    buys24h,
    sells24h,
    hasBuyActivity: buys24h > 0,
    hasSellActivity: sells24h > 0,
    sellSideRestricted: buys24h > 0 && sells24h === 0,
    buySideRestricted: sells24h > 0 && buys24h === 0,
  };
}

export function hasDexFallbackForCheck(report: ScanReport, checkId: string): boolean {
  if (!DEX_FALLBACK_CHECK_IDS.has(checkId)) return false;
  const signals = getDexMarketSignals(report);
  if (!signals) return false;

  switch (checkId) {
    case "CONTRACT-HONEYPOT":
      return signals.hasBuyActivity || signals.hasSellActivity || signals.sellSideRestricted;
    case "GOP-SELL-LOCK":
      return signals.hasBuyActivity || signals.hasSellActivity;
    case "GOP-BUY-LOCK":
      return signals.hasBuyActivity || signals.hasSellActivity;
    default:
      return false;
  }
}

export function isGoplusCheckResolved(report: ScanReport, checkId: string): boolean {
  if (report.providerStatus?.goplus !== "ok") return false;

  const value = (() => {
    switch (checkId) {
      case "CONTRACT-HONEYPOT":
        return report.honeypot.value;
      case "GOP-BUY-LOCK":
        return report.contract.buyRestriction.value;
      case "GOP-SELL-LOCK":
        return report.contract.tradingPause.value;
      default:
        return undefined;
    }
  })();

  if (!value) return false;
  if (
    value === MSG.GOPLUS_UNSUPPORTED ||
    value === MSG.GOPLUS_INCONCLUSIVE ||
    value === MSG.TAX_UNKNOWN ||
    value === MSG.HOLDER_UNKNOWN
  ) {
    return false;
  }
  return !isInternalValue(value);
}
