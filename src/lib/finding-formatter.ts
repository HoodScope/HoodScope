import type { ScanReport, SecurityField } from "@/lib/types/scan";
import { CHAINS } from "@/lib/chains";
import { CHECK_CATALOG, GOP_CHECK_IDS } from "@/lib/check-catalog";
import {
  getDexMarketSignals,
  hasDexFallbackForCheck,
  isGoplusCheckResolved,
} from "@/lib/dex-fallback";
import { MSG } from "@/lib/fields";

export type FindingSeverity = "OK" | "INFO" | "WARN" | "DANGER";
export type FindingSource = "RPC" | "GoPlus" | "DexScreener" | "Explorer" | "Calculated";

export interface FormattedFinding {
  id: string;
  severity: FindingSeverity;
  title: string;
  description: string;
  source: FindingSource;
  recommendation?: string;
}

/** @deprecated use FindingSeverity — lowercase for terminal color maps */
export type TerminalSeverity = "ok" | "warn" | "danger" | "info";

export interface TerminalFinding {
  check: string;
  severity: FindingSeverity;
  sev: TerminalSeverity;
  title: string;
  description: string;
  finding: string;
  source: FindingSource;
  recommendation?: string;
}

const SEVERITY_TO_TERMINAL: Record<FindingSeverity, TerminalSeverity> = {
  OK: "ok",
  INFO: "info",
  WARN: "warn",
  DANGER: "danger",
};

export const SECURITY_COPY = {
  securityDataUnavailable: {
    title: "Security Data Unavailable",
    description: "No public security data for this metric.",
  },
  verificationPending: {
    title: "Verification Pending",
    description: "Could not verify from available blockchain data.",
  },
  unableToConfirm: {
    title: "Unable to Confirm",
    description: "Public data is insufficient for a firm conclusion.",
  },
  transferSimulationInconclusive: {
    title: "Transfer Simulation Inconclusive",
    description: "Simulation did not return a definitive result.",
  },
  ownershipStateUnconfirmed: {
    title: "Ownership State Unconfirmed",
    description: "Owner model not readable from contract interfaces.",
  },
} as const;

/** Per-check copy when GoPlus has no coverage on the selected chain */
const GOPLUS_PENDING_BY_CHECK: Record<string, { title: string; description: string }> = {
  "CONTRACT-HONEYPOT": {
    title: "Honeypot scan pending",
    description: "Sell-trap detection requires GoPlus on this network.",
  },
  "GOP-TAX-BUY": {
    title: "Buy tax scan pending",
    description: "Swap-in tax rate requires GoPlus on this network.",
  },
  "GOP-TAX-SELL": {
    title: "Sell tax scan pending",
    description: "Swap-out tax rate requires GoPlus on this network.",
  },
  "GOP-MINT": {
    title: "Mint scan pending",
    description: "Supply mint checks require GoPlus on this network.",
  },
  "GOP-PROXY": {
    title: "Proxy scan pending",
    description: "Upgradeable proxy checks require GoPlus on this network.",
  },
  "GOP-BLACKLIST": {
    title: "Blacklist scan pending",
    description: "Wallet blocklist screening requires GoPlus on this network.",
  },
  "GOP-TRANSFER-PAUSE": {
    title: "Transfer pause scan pending",
    description: "Pausable transfer checks require GoPlus on this network.",
  },
  "GOP-BUY-LOCK": {
    title: "Buy restriction scan pending",
    description: "Buy-side lock checks require GoPlus on this network.",
  },
  "GOP-SELL-LOCK": {
    title: "Sell restriction scan pending",
    description: "Sell-side lock checks require GoPlus on this network.",
  },
  "GOP-SELF-DESTRUCT": {
    title: "Self-destruct scan pending",
    description: "Destruct capability checks require GoPlus on this network.",
  },
  "GOP-HIDDEN-OWNER": {
    title: "Hidden owner scan pending",
    description: "Obfuscated owner checks require GoPlus on this network.",
  },
  "GOP-OWNER-PRIV": {
    title: "Owner privilege scan pending",
    description: "Admin privilege checks require GoPlus on this network.",
  },
  "HOLD-WHALES": {
    title: "Holder scan pending",
    description: "Whale concentration data requires GoPlus on this network.",
  },
};

/** Checks that require GoPlus — hidden from UI when that provider has no data */
const GOPLUS_DEPENDENT_CHECKS = new Set([...GOP_CHECK_IDS, "HOLD-WHALES"]);

function checkFieldValue(report: ScanReport, checkId: string): string | undefined {
  switch (checkId) {
    case "CONTRACT-HONEYPOT":
      return report.honeypot.value;
    case "GOP-TAX-BUY":
      return report.taxes.buyTax.value;
    case "GOP-TAX-SELL":
      return report.taxes.sellTax.value;
    case "GOP-MINT":
      return report.contract.mintFunction.value;
    case "GOP-PROXY":
      return report.contract.proxy.value;
    case "GOP-BLACKLIST":
      return report.contract.blacklist.value;
    case "GOP-TRANSFER-PAUSE":
      return report.contract.transferPause.value;
    case "GOP-BUY-LOCK":
      return report.contract.buyRestriction.value;
    case "GOP-SELL-LOCK":
      return report.contract.tradingPause.value;
    case "GOP-SELF-DESTRUCT":
      return report.contract.selfDestruct.value;
    case "GOP-HIDDEN-OWNER":
      return report.contract.hiddenFunctions.value;
    case "GOP-OWNER-PRIV":
      return report.contract.ownerPrivileges.value;
    case "HOLD-WHALES":
      return report.holders.whales.value;
    default:
      return undefined;
  }
}

/** Only show checks backed by real provider data for the scanned network */
export function isCheckDisplayable(report: ScanReport, checkId: string): boolean {
  if (!GOPLUS_DEPENDENT_CHECKS.has(checkId)) {
    return true;
  }

  if (hasDexFallbackForCheck(report, checkId)) {
    return true;
  }

  if (checkId === "GOP-PROXY" && report.contract.proxy.sources.includes("rpc")) {
    const value = report.contract.proxy.value;
    return value !== MSG.GOPLUS_UNSUPPORTED && !isInternalValue(value);
  }

  if (report.providerStatus?.goplus !== "ok") {
    return false;
  }

  const value = checkFieldValue(report, checkId);
  if (!value) return false;
  if (value === MSG.GOPLUS_UNSUPPORTED || value === MSG.GOPLUS_INCONCLUSIVE) {
    return false;
  }
  if (value === MSG.TAX_UNKNOWN || value === MSG.HOLDER_UNKNOWN) {
    return false;
  }

  return true;
}

function chainName(report: ScanReport): string {
  return CHAINS[report.chain]?.name ?? report.chain;
}

function isGoplusUnsupported(report: ScanReport): boolean {
  return report.providerStatus?.goplus === "unsupported";
}

function isGoplusFailed(report: ScanReport): boolean {
  return (
    report.providerStatus?.goplus === "failed" ||
    report.partialFailures.includes("GoPlus Security")
  );
}

function isRpcFailed(report: ScanReport): boolean {
  return (
    report.providerStatus?.rpc === "failed" ||
    report.partialFailures.includes("Chain RPC")
  );
}

function isDexEmpty(report: ScanReport): boolean {
  return report.providerStatus?.dexscreener === "empty";
}

function isDexFailed(report: ScanReport): boolean {
  return (
    report.providerStatus?.dexscreener === "failed" ||
    report.partialFailures.includes("DexScreener")
  );
}

function make(
  id: string,
  severity: FindingSeverity,
  title: string,
  description: string,
  source: FindingSource,
  recommendation?: string
): FormattedFinding {
  return { id, severity, title, description, source, recommendation };
}

function goplusInconclusive(id: string): FormattedFinding {
  const label = GOPLUS_PENDING_BY_CHECK[id]?.title.replace(/ scan pending$/i, "") ?? "this check";
  return make(
    id,
    "INFO",
    SECURITY_COPY.securityDataUnavailable.title,
    `GoPlus returned no result for ${label.toLowerCase()}.`,
    "GoPlus"
  );
}

function isInternalValue(value: string): boolean {
  return value.startsWith("__") && value.endsWith("__");
}

function goplusPendingFinding(id: string): FormattedFinding {
  const copy = GOPLUS_PENDING_BY_CHECK[id] ?? {
    title: "Security scan pending",
    description: "This check requires GoPlus on this network.",
  };
  return make(id, "INFO", copy.title, copy.description, "GoPlus");
}

/** Exported for hero preview rows */
export function buildGoplusPendingFinding(checkId: string): FormattedFinding {
  return goplusPendingFinding(checkId);
}

type SecurityPhrase = { title: string; description: string };

function rpcInconclusive(id: string, phrase: SecurityPhrase = SECURITY_COPY.unableToConfirm): FormattedFinding {
  return make(id, "INFO", phrase.title, phrase.description, "RPC");
}

function verificationPending(
  id: string,
  description?: string,
  source: FindingSource = "Explorer"
): FormattedFinding {
  return make(
    id,
    "INFO",
    SECURITY_COPY.verificationPending.title,
    description ?? SECURITY_COPY.verificationPending.description,
    source
  );
}

function dexNoPool(id: string): FormattedFinding {
  return make(
    id,
    "WARN",
    "No liquidity pool found",
    "No active liquidity pool was detected for this token.",
    "DexScreener",
    "Verify the token address and chain before trading."
  );
}

function dexInconclusive(id: string): FormattedFinding {
  return verificationPending(
    id,
    "Market feed data could not be verified for this token.",
    "DexScreener"
  );
}

function buildDexHoneypotFinding(checkId: string, report: ScanReport): FormattedFinding | null {
  const signals = getDexMarketSignals(report);
  if (!signals) return null;

  if (signals.sellSideRestricted) {
    return make(
      checkId,
      "WARN",
      "No sell activity on DEX",
      "DexScreener shows buys but zero sells in 24h.",
      "DexScreener"
    );
  }
  if (signals.hasSellActivity) {
    return make(
      checkId,
      "OK",
      "No honeypot signal from market",
      "DexScreener shows active buy and sell flow in 24h.",
      "DexScreener"
    );
  }
  return null;
}

function buildDexSellLockFinding(checkId: string, report: ScanReport): FormattedFinding | null {
  const signals = getDexMarketSignals(report);
  if (!signals) return null;

  if (signals.sellSideRestricted) {
    return make(
      checkId,
      "DANGER",
      "Sell restriction detected",
      "No sell transactions on DexScreener despite active buys.",
      "DexScreener"
    );
  }
  if (signals.hasSellActivity) {
    return make(
      checkId,
      "OK",
      "No sell restriction detected",
      "Sell transactions observed on DexScreener in 24h.",
      "DexScreener"
    );
  }
  return null;
}

function buildDexBuyLockFinding(checkId: string, report: ScanReport): FormattedFinding | null {
  const signals = getDexMarketSignals(report);
  if (!signals) return null;

  if (signals.buySideRestricted) {
    return make(
      checkId,
      "DANGER",
      "Buy restriction detected",
      "No buy transactions on DexScreener despite active sells.",
      "DexScreener"
    );
  }
  if (signals.hasBuyActivity) {
    return make(
      checkId,
      "OK",
      "No buy restriction detected",
      "Buy transactions observed on DexScreener in 24h.",
      "DexScreener"
    );
  }
  return null;
}

function tryDexFallback(checkId: string, report: ScanReport): FormattedFinding | null {
  switch (checkId) {
    case "CONTRACT-HONEYPOT":
      return buildDexHoneypotFinding(checkId, report);
    case "GOP-SELL-LOCK":
      return buildDexSellLockFinding(checkId, report);
    case "GOP-BUY-LOCK":
      return buildDexBuyLockFinding(checkId, report);
    default:
      return null;
  }
}

function fieldSeverity(field: SecurityField): FindingSeverity {
  switch (field.status) {
    case "pass":
      return "OK";
    case "warn":
      return "WARN";
    case "fail":
      return "DANGER";
    default:
      return "INFO";
  }
}

function buildCheckFinding(report: ScanReport, checkId: string): FormattedFinding {
  const network = chainName(report);

  switch (checkId) {
    case "EXEC-CHAINID":
      if (isRpcFailed(report)) {
        return make(
          checkId,
          "DANGER",
          "Chain Verification Pending",
          "The public RPC did not confirm the active chain ID.",
          "RPC"
        );
      }
      return make(
        checkId,
        "OK",
        "Chain ID verified",
        `The contract was verified on ${network} via public RPC.`,
        "RPC"
      );

    case "CONTRACT-EXISTS":
      if (isRpcFailed(report)) {
        return verificationPending(
          checkId,
          "Bytecode could not be verified on the public RPC.",
          "RPC"
        );
      }
      if (report.contract.verified.value === MSG.NO_CONTRACT) {
        return make(
          checkId,
          "DANGER",
          "No contract code detected",
          "No deployed bytecode was found at this address on the selected network.",
          "RPC"
        );
      }
      return make(
        checkId,
        "OK",
        "Contract code detected",
        "Deployed bytecode is present at this address.",
        "RPC"
      );

    case "CONTRACT-OWNER": {
      const renounced = report.ownership.renounced;
      if (renounced.value === "Yes") {
        return make(
          checkId,
          "OK",
          "Ownership renounced",
          "The contract owner has been renounced. No active administrator address was detected.",
          "RPC"
        );
      }
      if (renounced.value === "No") {
        return make(
          checkId,
          "WARN",
          "Active owner detected",
          "An active owner address retains administrative control over the contract.",
          "RPC",
          "Review owner permissions before interacting with this token."
        );
      }
      if (renounced.value === MSG.NO_OWNER) {
        return make(
          checkId,
          "INFO",
          SECURITY_COPY.ownershipStateUnconfirmed.title,
          SECURITY_COPY.ownershipStateUnconfirmed.description,
          "RPC"
        );
      }
      if (isInternalValue(renounced.value)) {
        return rpcInconclusive(checkId, SECURITY_COPY.ownershipStateUnconfirmed);
      }
      return make(
        checkId,
        fieldSeverity(renounced),
        renounced.value === "Yes" ? "Ownership renounced" : "Active owner detected",
        renounced.value === "Yes"
          ? "The contract owner has been renounced. No active administrator address was detected."
          : "An active owner address retains administrative control over the contract.",
        "RPC"
      );
    }

    case "CONTRACT-VERIFIED": {
      const verified = report.contract.verified;
      if (verified.value === "Yes") {
        return make(
          checkId,
          "OK",
          "Source code verified",
          "Verified source code was found on the blockchain explorer.",
          "Explorer"
        );
      }
      if (verified.value === MSG.NOT_VERIFIED || verified.value === "No") {
        return make(
          checkId,
          "WARN",
          "Source code not verified",
          "Verified source code was not found on the blockchain explorer.",
          "Explorer",
          "Unverified contracts are harder to audit independently."
        );
      }
      return verificationPending(
        checkId,
        "Source code verification could not be confirmed on the explorer.",
        "Explorer"
      );
    }

    case "CONTRACT-HONEYPOT": {
      if (isGoplusCheckResolved(report, checkId)) {
        const hp = report.honeypot;
        if (hp.value === "Yes") {
          return make(
            checkId,
            "DANGER",
            "Honeypot behavior detected",
            "GoPlus flagged patterns consistent with a honeypot or sell restriction.",
            "GoPlus",
            "Selling may be blocked or heavily taxed."
          );
        }
        return make(
          checkId,
          "OK",
          "No honeypot detected",
          "GoPlus did not detect honeypot behavior for this token.",
          "GoPlus"
        );
      }
      const dexFinding = tryDexFallback(checkId, report);
      if (dexFinding) return dexFinding;
      if (isGoplusFailed(report)) return goplusInconclusive(checkId);
      return goplusInconclusive(checkId);
    }

    case "GOP-TAX-BUY":
      if (isGoplusUnsupported(report)) return goplusPendingFinding(checkId);
      if (isGoplusFailed(report)) return goplusInconclusive(checkId);
      if (report.taxes.buyTax.value === MSG.TAX_UNKNOWN) {
        return make(
          checkId,
          "INFO",
          SECURITY_COPY.transferSimulationInconclusive.title,
          "Simulation did not return a definitive buy tax figure.",
          "GoPlus"
        );
      }
      return make(
        checkId,
        fieldSeverity(report.taxes.buyTax),
        `Buy tax: ${report.taxes.buyTax.value}`,
        "Buy tax reported by GoPlus Security for swaps into this token.",
        "GoPlus"
      );

    case "GOP-TAX-SELL":
      if (isGoplusUnsupported(report)) return goplusPendingFinding(checkId);
      if (isGoplusFailed(report)) return goplusInconclusive(checkId);
      if (report.taxes.sellTax.value === MSG.TAX_UNKNOWN) {
        return make(
          checkId,
          "INFO",
          SECURITY_COPY.transferSimulationInconclusive.title,
          "Simulation did not return a definitive sell tax figure.",
          "GoPlus"
        );
      }
      return make(
        checkId,
        fieldSeverity(report.taxes.sellTax),
        `Sell tax: ${report.taxes.sellTax.value}`,
        "Sell tax reported by GoPlus Security for swaps out of this token.",
        "GoPlus"
      );

    case "GOP-MINT":
      if (isGoplusUnsupported(report)) return goplusPendingFinding(checkId);
      if (isGoplusFailed(report)) return goplusInconclusive(checkId);
      return report.contract.mintFunction.value === "Yes"
        ? make(
            checkId,
            "WARN",
            "Mint function present",
            "The contract exposes minting capability that can increase supply.",
            "GoPlus"
          )
        : make(
            checkId,
            "OK",
            "No mint function detected",
            "GoPlus did not detect an active mint function on this contract.",
            "GoPlus"
          );

    case "GOP-PROXY": {
      if (isGoplusUnsupported(report) && report.contract.proxy.sources.includes("rpc")) {
        const isProxy = report.contract.proxy.value === "Yes";
        return make(
          checkId,
          isProxy ? "WARN" : "OK",
          isProxy ? "Proxy contract detected" : "No proxy contract detected",
          isProxy
            ? "RPC bytecode analysis indicates this contract uses a proxy pattern."
            : "RPC bytecode analysis did not indicate a proxy pattern.",
          "RPC"
        );
      }
      if (isGoplusUnsupported(report)) return goplusPendingFinding(checkId);
      if (isGoplusFailed(report)) return goplusInconclusive(checkId);
      return report.contract.proxy.value === "Yes"
        ? make(
            checkId,
            "WARN",
            "Proxy contract detected",
            "The contract can delegate logic to an implementation that may be upgraded.",
            "GoPlus"
          )
        : make(
            checkId,
            "OK",
            "No proxy contract detected",
            "GoPlus did not classify this contract as a proxy.",
            "GoPlus"
          );
    }

    case "GOP-BLACKLIST":
      if (isGoplusUnsupported(report)) return goplusPendingFinding(checkId);
      if (isGoplusFailed(report)) return goplusInconclusive(checkId);
      return report.contract.blacklist.value === "Yes"
        ? make(
            checkId,
            "WARN",
            "Blacklist capability detected",
            "The owner may be able to block specific wallets from transacting.",
            "GoPlus"
          )
        : make(
            checkId,
            "OK",
            "No blacklist capability detected",
            "GoPlus did not detect blacklist functionality on this contract.",
            "GoPlus"
          );

    case "GOP-TRANSFER-PAUSE":
      if (isGoplusUnsupported(report)) return goplusPendingFinding(checkId);
      if (isGoplusFailed(report)) return goplusInconclusive(checkId);
      return report.contract.transferPause.value === "Yes"
        ? make(
            checkId,
            "DANGER",
            "Trading pause enabled",
            "Transfers can be paused by the contract administrator.",
            "GoPlus"
          )
        : make(
            checkId,
            "OK",
            "Trading pause disabled",
            "GoPlus did not detect an active transfer pause mechanism.",
            "GoPlus"
          );

    case "GOP-BUY-LOCK": {
      if (isGoplusCheckResolved(report, checkId)) {
        return report.contract.buyRestriction.value === "Yes"
          ? make(
              checkId,
              "DANGER",
              "Buy restriction detected",
              "Buys may be blocked or restricted for this token.",
              "GoPlus"
            )
          : make(
              checkId,
              "OK",
              "No buy restriction detected",
              "GoPlus did not detect buy-side trading restrictions.",
              "GoPlus"
            );
      }
      const dexFinding = tryDexFallback(checkId, report);
      if (dexFinding) return dexFinding;
      if (isGoplusUnsupported(report)) return goplusPendingFinding(checkId);
      if (isGoplusFailed(report)) return goplusInconclusive(checkId);
      return goplusInconclusive(checkId);
    }

    case "GOP-SELL-LOCK": {
      if (isGoplusCheckResolved(report, checkId)) {
        return report.contract.tradingPause.value === "Yes"
          ? make(
              checkId,
              "DANGER",
              "Sell restriction detected",
              "Sells may be blocked or restricted for this token.",
              "GoPlus"
            )
          : make(
              checkId,
              "OK",
              "No sell restriction detected",
              "GoPlus did not detect sell-side trading restrictions.",
              "GoPlus"
            );
      }
      const dexFinding = tryDexFallback(checkId, report);
      if (dexFinding) return dexFinding;
      if (isGoplusUnsupported(report)) return goplusPendingFinding(checkId);
      if (isGoplusFailed(report)) return goplusInconclusive(checkId);
      return goplusInconclusive(checkId);
    }

    case "GOP-SELF-DESTRUCT":
      if (isGoplusUnsupported(report)) return goplusPendingFinding(checkId);
      if (isGoplusFailed(report)) return goplusInconclusive(checkId);
      return report.contract.selfDestruct.value === "Yes"
        ? make(
            checkId,
            "DANGER",
            "Self-destruct enabled",
            "The contract may be destroyable, which can remove liquidity and trap holders.",
            "GoPlus"
          )
        : make(
            checkId,
            "OK",
            "No self-destruct detected",
            "GoPlus did not detect self-destruct capability on this contract.",
            "GoPlus"
          );

    case "GOP-HIDDEN-OWNER":
      if (isGoplusUnsupported(report)) return goplusPendingFinding(checkId);
      if (isGoplusFailed(report)) return goplusInconclusive(checkId);
      return report.contract.hiddenFunctions.value.includes("Detected")
        ? make(
            checkId,
            "DANGER",
            "Hidden owner detected",
            "GoPlus detected ownership structures that may obscure real control.",
            "GoPlus"
          )
        : make(
            checkId,
            "OK",
            "No hidden owner detected",
            "GoPlus did not detect hidden owner patterns on this contract.",
            "GoPlus"
          );

    case "GOP-OWNER-PRIV":
      if (isGoplusUnsupported(report)) return goplusPendingFinding(checkId);
      if (isGoplusFailed(report)) return goplusInconclusive(checkId);
      return report.contract.ownerPrivileges.value === "Elevated"
        ? make(
            checkId,
            "DANGER",
            "Elevated owner privileges",
            "The owner retains permissions that can materially affect holders.",
            "GoPlus"
          )
        : make(
            checkId,
            "OK",
            "Limited owner privileges",
            "GoPlus did not flag elevated owner privileges on this contract.",
            "GoPlus"
          );

    case "MKT-PRICE":
      if (isDexEmpty(report)) return dexNoPool(checkId);
      if (isDexFailed(report)) return dexInconclusive(checkId);
      return make(
        checkId,
        "OK",
        `Price: ${report.market.price.value}`,
        "Latest traded price from DexScreener liquidity pools.",
        "DexScreener"
      );

    case "MKT-LIQUIDITY": {
      if (isDexEmpty(report)) return dexNoPool(checkId);
      if (isDexFailed(report)) return dexInconclusive(checkId);
      const liq = report.liquidity.liquidity;
      const val = liq.value;
      if (liq.status === "fail") {
        return make(
          checkId,
          "DANGER",
          "Liquidity critically low",
          `Reported pool depth is ${val}, which increases slippage and exit risk.`,
          "DexScreener",
          "Thin liquidity can make exits difficult during volatility."
        );
      }
      if (liq.status === "warn") {
        return make(
          checkId,
          "WARN",
          "Liquidity depth limited",
          `Reported pool depth is ${val}, which may increase price impact on larger trades.`,
          "DexScreener"
        );
      }
      return make(
        checkId,
        "OK",
        "Liquidity depth healthy",
        `Reported pool depth is ${val} across tracked liquidity pools.`,
        "DexScreener"
      );
    }

    case "MKT-MCAP":
      if (isDexEmpty(report)) return dexNoPool(checkId);
      if (isDexFailed(report)) return dexInconclusive(checkId);
      return make(
        checkId,
        "OK",
        `Market cap: ${report.market.marketCap.value}`,
        "Estimated market capitalization from DexScreener market data.",
        "DexScreener"
      );

    case "MKT-VOLUME":
      if (isDexEmpty(report)) return dexNoPool(checkId);
      if (isDexFailed(report)) return dexInconclusive(checkId);
      return make(
        checkId,
        "OK",
        `24h volume: ${report.market.volume.value}`,
        "Rolling 24-hour trading volume from DexScreener.",
        "DexScreener"
      );

    case "MKT-ACTIVITY": {
      if (isDexEmpty(report)) return dexNoPool(checkId);
      if (isDexFailed(report)) return dexInconclusive(checkId);
      const tx = report.market.transactions.value;
      if (tx === MSG.NO_TRADING) {
        return make(
          checkId,
          "INFO",
          "Market appears inactive",
          "No meaningful buy or sell activity was detected in the last 24 hours.",
          "DexScreener"
        );
      }
      return make(
        checkId,
        "OK",
        "Market activity detected",
        `${tx} buy and sell transactions were observed in the last 24 hours.`,
        "DexScreener"
      );
    }

    case "HOLD-WHALES":
      if (isGoplusUnsupported(report)) return goplusPendingFinding(checkId);
      if (isGoplusFailed(report)) return goplusInconclusive(checkId);
      if (report.holders.whales.value === MSG.HOLDER_UNKNOWN) {
        return make(
          checkId,
          "INFO",
          SECURITY_COPY.unableToConfirm.title,
          "Holder data is insufficient to assess concentration risk.",
          "GoPlus"
        );
      }
      return make(
        checkId,
        fieldSeverity(report.holders.whales),
        `Top holder concentration: ${report.holders.whales.value}`,
        "Largest holder share reported by GoPlus holder analysis.",
        "GoPlus"
      );

    default:
      return make(checkId, "INFO", "Check completed", "This security check completed without additional detail.", "Calculated");
  }
}

export function buildFormattedFindings(report: ScanReport): FormattedFinding[] {
  return CHECK_CATALOG.filter((c) => isCheckDisplayable(report, c.id)).map((c) =>
    buildCheckFinding(report, c.id)
  );
}

export function toTerminalFinding(row: FormattedFinding): TerminalFinding {
  return {
    check: row.id,
    severity: row.severity,
    sev: SEVERITY_TO_TERMINAL[row.severity],
    title: row.title,
    description: row.description,
    finding: row.title,
    source: row.source,
    recommendation: row.recommendation,
  };
}

/** Returns displayable findings for web terminal and CLI */
export function buildTerminalFindings(report: ScanReport): TerminalFinding[] {
  return buildFormattedFindings(report).map(toTerminalFinding);
}

export function buildKeyRisks(report: ScanReport): string[] {
  const risks: string[] = [];
  for (const d of report.dangerFindings) risks.push(d.label);
  for (const row of buildFormattedFindings(report)) {
    if (row.severity === "WARN" || row.severity === "DANGER") {
      if (!risks.includes(row.title)) risks.push(row.title);
    }
  }
  if (report.verdictLabel === "CLEAR" && risks.length === 0) {
    risks.push("No critical security issues detected in available data.");
  }
  return risks.slice(0, 8);
}

const EMPTY_MARKET: Set<string> = new Set([
  MSG.NO_LIQUIDITY,
  MSG.DEX_INCONCLUSIVE,
  MSG.GOPLUS_UNSUPPORTED,
  MSG.GOPLUS_INCONCLUSIVE,
  MSG.RPC_INCONCLUSIVE,
  MSG.DATA_UNAVAILABLE,
  MSG.NO_TRADING,
  MSG.TAX_UNKNOWN,
  MSG.HOLDER_UNKNOWN,
]);

function marketValue(value: string): string {
  if (EMPTY_MARKET.has(value)) return "Pending";
  if (value.startsWith("$")) return value;
  if (/^[\d.]+$/.test(value)) return `$${value}`;
  if (value.includes("day") || value.includes("month") || value.includes("year")) return value;
  return value.startsWith("__") ? "Pending" : value;
}

export function formatMarketStats(report: ScanReport) {
  return {
    price: marketValue(report.market.price.value),
    mcap: marketValue(report.market.marketCap.value),
    liquidity: marketValue(report.liquidity.liquidity.value),
    volume: marketValue(report.market.volume.value),
  };
}

export function formatSources(report: ScanReport): string {
  const parts: string[] = [`${chainName(report)} RPC`];
  if (report.providerStatus?.goplus === "ok") parts.push("GoPlus Security");
  else if (report.providerStatus?.goplus === "unsupported") {
    parts.push("GoPlus (coverage pending)");
  }
  if (report.providerStatus?.dexscreener === "ok") parts.push("DexScreener");
  if (report.providerStatus?.explorer === "ok") parts.push("Blockscout");
  return parts.join(" · ");
}

export function tokenTitle(report: ScanReport): string {
  const name = report.tokenName ?? "Unnamed token";
  const symbol = report.tokenSymbol ?? truncateAddress(report.address);
  return `${name} (${symbol})`;
}

export function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function riskHeadline(verdict: string): string {
  switch (verdict) {
    case "FLAGGED":
      return "High-risk token — the scanner flagged blocking issues.";
    case "REVIEW":
      return "Moderate risk — some findings deserve additional attention.";
    default:
      return "Low observed security risk based on available data.";
  }
}

export const SEV_COLORS: Record<TerminalSeverity, string> = {
  ok: "#28c840",
  warn: "#febc2e",
  danger: "#ff5f57",
  info: "#6b9bd1",
};

export const VERDICT_COLORS: Record<string, string> = {
  CLEAR: "#CCFF00",
  REVIEW: "#F5A623",
  FLAGGED: "#FF3B30",
};
