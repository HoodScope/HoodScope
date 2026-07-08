import type {
  GoPlusTokenData,
  RiskTier,
  RpcTokenData,
  ScanReport,
  SecurityField,
  Verdict,
  DexPair,
  ChainId,
  ProviderStatus,
} from "@/lib/types/scan";
import { getTierColor, getVerdictColor } from "@/lib/types/scan";
import { getChain } from "@/lib/chains";
import { fetchAllProviders, getBestPair } from "@/lib/providers";
import {
  parseGoPlusBool,
  parseGoPlusPercent,
} from "@/lib/providers/goplus";
import { isEoaOwner, isOwnershipRenounced } from "@/lib/providers/rpc";
import {
  MSG,
  formatPairAge,
  formatPercent,
  formatTax,
  formatUsd,
  goplusUnsupportedField,
  securityField,
  unknownField,
} from "@/lib/fields";
import type { ScanSources } from "@/lib/providers/types";
import { computeRiskScore } from "@/lib/risk-engine";
import { generateAiSummary } from "@/lib/ai/github-models";

const SKIP_FINDING_VALUES: Set<string> = new Set([
  MSG.GOPLUS_UNSUPPORTED,
  MSG.GOPLUS_INCONCLUSIVE,
  MSG.NO_LIQUIDITY,
  MSG.NO_OWNER,
  MSG.NOT_VERIFIED,
  MSG.DATA_UNAVAILABLE,
  MSG.DEX_FAILED,
  MSG.DEX_INCONCLUSIVE,
  MSG.GOPLUS_FAILED,
  MSG.RPC_FAILED,
  MSG.RPC_INCONCLUSIVE,
  MSG.NO_TRADING,
  MSG.NOT_APPLICABLE,
  MSG.TAX_UNKNOWN,
  MSG.HOLDER_UNKNOWN,
]);

export async function scanToken(
  address: string,
  chain: ChainId
): Promise<ScanReport> {
  const config = getChain(chain);
  if (!config) throw new Error(`Unsupported chain: ${chain}`);

  const startedAt = Date.now();
  const normalizedAddress = address.toLowerCase();
  const sources = await fetchAllProviders(config, normalizedAddress);

  const rpc = sources.rpc.data;
  const goplus = sources.goplus.data;
  const pair = getBestPair(sources.dexscreener.data ?? [], config.dexScreenerChainId);
  const explorerVerified = sources.explorer.data;

  const partialFailures: string[] = [];
  if (sources.rpc.state === "failed") partialFailures.push("Chain RPC");
  if (sources.goplus.state === "failed") partialFailures.push("GoPlus Security");
  if (sources.dexscreener.state === "failed") partialFailures.push("DexScreener");

  const providerStatus: ProviderStatus = {
    rpc: sources.rpc.state,
    goplus: sources.goplus.state,
    dexscreener: sources.dexscreener.state,
    explorer: sources.explorer.state,
  };

  const report = await buildReport(
    normalizedAddress,
    chain,
    sources,
    rpc,
    goplus,
    pair,
    explorerVerified,
    partialFailures,
    providerStatus,
    Date.now() - startedAt
  );

  return report;
}

/** @deprecated use scanToken(address, chain) */
export async function runTokenScan(
  chainId: ChainId,
  address: string
): Promise<ScanReport> {
  return scanToken(address, chainId);
}

async function buildReport(
  address: string,
  chain: ChainId,
  sources: ScanSources,
  rpc: RpcTokenData | null,
  goplus: GoPlusTokenData | null,
  pair: DexPair | null,
  explorerVerified: boolean | null,
  partialFailures: string[],
  providerStatus: ProviderStatus,
  scanDurationMs: number
): Promise<ScanReport> {
  const goplusOk = sources.goplus.state === "ok" && goplus !== null;
  const goplusUnsupported = sources.goplus.state === "unsupported";
  const hasPair = sources.dexscreener.state === "ok" && pair !== null;
  const noLiquidity = sources.dexscreener.state === "empty";
  const dexFailed = sources.dexscreener.state === "failed";

  const gp = (label: string, builder: (g: GoPlusTokenData) => SecurityField): SecurityField => {
    if (goplusUnsupported) return goplusUnsupportedField(label);
    if (!goplusOk || !goplus) return unknownField(label, MSG.GOPLUS_INCONCLUSIVE);
    return builder(goplus);
  };

  const dex = (label: string, builder: (p: DexPair) => SecurityField): SecurityField => {
    if (noLiquidity) return securityField(label, MSG.NO_LIQUIDITY, "unknown", "low", []);
    if (dexFailed || !pair) return unknownField(label, MSG.DEX_INCONCLUSIVE);
    return builder(pair);
  };

  const isHoneypot = goplusOk ? parseGoPlusBool(goplus!.is_honeypot) : null;
  const buyTax = goplusOk ? parseGoPlusPercent(goplus!.buy_tax) : null;
  const sellTax = goplusOk ? parseGoPlusPercent(goplus!.sell_tax) : null;
  const isOpenSource = goplusOk
    ? parseGoPlusBool(goplus!.is_open_source)
    : explorerVerified;
  const isProxy = goplusOk
    ? parseGoPlusBool(goplus!.is_proxy)
    : rpc?.isProxy ?? null;
  const isMintable = goplusOk ? parseGoPlusBool(goplus!.is_mintable) : null;
  const transferPausable = goplusOk ? parseGoPlusBool(goplus!.transfer_pausable) : null;
  const slippageModifiable = goplusOk ? parseGoPlusBool(goplus!.slippage_modifiable) : null;
  const ownerAddress = goplus?.owner_address ?? rpc?.owner ?? null;
  const renounced = isOwnershipRenounced(ownerAddress);
  const topHolderPercent = goplus?.holders?.[0]
    ? parseGoPlusPercent(goplus.holders[0].percent)
    : goplus?.owner_percent
      ? parseGoPlusPercent(goplus.owner_percent)
      : null;

  const liquidityUsd = pair?.liquidity?.usd ?? null;
  const volume24h = pair?.volume?.h24 ?? null;
  const buys24h = pair?.txns?.h24?.buys ?? null;
  const sells24h = pair?.txns?.h24?.sells ?? null;
  const hasTrading = (buys24h ?? 0) + (sells24h ?? 0) > 0;
  const dexSellRestricted =
    hasPair && (buys24h ?? 0) > 0 && (sells24h ?? 0) === 0;
  const dexBuyRestricted =
    hasPair && (sells24h ?? 0) > 0 && (buys24h ?? 0) === 0;

  const cannotSellAll = goplusOk
    ? parseGoPlusBool(goplus!.cannot_sell_all)
    : dexSellRestricted
      ? true
      : null;
  const cannotBuy = goplusOk
    ? parseGoPlusBool(goplus!.cannot_buy)
    : dexBuyRestricted
      ? true
      : null;
  const canTakeBackOwnership = goplusOk ? parseGoPlusBool(goplus!.can_take_back_ownership) : null;
  const ownerChangeBalance = goplusOk ? parseGoPlusBool(goplus!.owner_change_balance) : null;
  const hiddenOwner = goplusOk ? parseGoPlusBool(goplus!.hidden_owner) : null;
  const selfdestruct = goplusOk ? parseGoPlusBool(goplus!.selfdestruct) : null;
  const externalCall = goplusOk ? parseGoPlusBool(goplus!.external_call) : null;
  const tradingCooldown = goplusOk ? parseGoPlusBool(goplus!.trading_cooldown) : null;
  const antiWhaleModifiable = goplusOk ? parseGoPlusBool(goplus!.anti_whale_modifiable) : null;
  const personalSlippageModifiable = goplusOk
    ? parseGoPlusBool(goplus!.personal_slippage_modifiable)
    : null;
  const honeypotSameCreator = goplusOk
    ? parseGoPlusBool(goplus!.honeypot_with_same_creator)
    : null;
  const isInDex = goplusOk ? goplus!.is_in_dex === "1" : hasPair ? true : null;
  const isBlacklisted = goplusOk ? parseGoPlusBool(goplus!.is_blacklisted) : null;
  const isWhitelisted = goplusOk ? parseGoPlusBool(goplus!.is_whitelisted) : null;

  const honeypotField = goplusUnsupported
    ? goplusUnsupportedField("Honeypot")
    : goplusOk
      ? securityField(
          "Honeypot",
          isHoneypot ? "Yes" : "No",
          isHoneypot ? "fail" : "pass",
          "high",
          ["goplus"]
        )
      : unknownField("Honeypot", MSG.GOPLUS_INCONCLUSIVE);

  const verifiedField = (): SecurityField => {
    if (goplusOk) {
      return securityField(
        "Verified Contract",
        isOpenSource ? "Yes" : "No",
        isOpenSource ? "pass" : "warn",
        "high",
        ["goplus"]
      );
    }
    if (explorerVerified === true) {
      return securityField("Verified Contract", "Yes", "pass", "high", ["rpc"]);
    }
    if (explorerVerified === false) {
      return securityField("Verified Contract", MSG.NOT_VERIFIED, "warn", "high", ["rpc"]);
    }
    if (rpc && !rpc.isContract) {
      return securityField("Verified Contract", MSG.NO_CONTRACT, "unknown", "low", ["rpc"]);
    }
    return unknownField("Verified Contract", MSG.NOT_VERIFIED);
  };

  const ownershipField = (): SecurityField => {
    if (ownerAddress) {
      return securityField(
        "Ownership",
        renounced ? "Renounced" : `${ownerAddress.slice(0, 10)}…`,
        renounced ? "pass" : "warn",
        renounced ? "high" : "medium",
        rpc ? ["rpc", ...(goplusOk ? (["goplus"] as const) : [])] : ["goplus"]
      );
    }
    if (rpc && rpc.ownerCallable === false) {
      return securityField("Ownership", MSG.NO_OWNER, "unknown", "medium", ["rpc"]);
    }
    if (goplusUnsupported) return goplusUnsupportedField("Ownership");
    return unknownField("Ownership", MSG.DATA_UNAVAILABLE);
  };

  const riskInputs = {
    liquidityUsd,
    renounced,
    isOpenSource,
    buyTax,
    sellTax,
    isHoneypot,
    topHolderPercent,
    volume24h,
    buys24h,
    sells24h,
    isProxy,
    isMintable,
    transferPausable,
    slippageModifiable,
    personalSlippageModifiable,
    cannotSellAll,
    cannotBuy,
    canTakeBackOwnership,
    ownerChangeBalance,
    hiddenOwner,
    selfdestruct,
    externalCall,
    tradingCooldown,
    antiWhaleModifiable,
    honeypotSameCreator,
    isInDex,
  };

  const {
    score,
    tier,
    label,
    verdict,
    verdictLabel,
    exitCode,
    dangerFindings,
  } = computeRiskScore(riskInputs);

  const report: ScanReport = {
    address,
    chain,
    tokenName: rpc?.name ?? pair?.baseToken?.name ?? null,
    tokenSymbol: rpc?.symbol ?? pair?.baseToken?.symbol ?? null,
    scannedAt: new Date().toISOString(),
    riskScore: score,
    riskTier: tier,
    riskLabel: label,
    verdict,
    verdictLabel,
    exitCode,
    dangerFindings,
    findings: [],
    partialFailures,
    providerStatus,
    honeypot: honeypotField,
    taxes: {
      buyTax: gp("Buy Tax", () =>
        securityField(
          "Buy Tax",
          formatTax(buyTax, true),
          buyTax !== null && buyTax > 10 ? "fail" : buyTax !== null && buyTax > 5 ? "warn" : "pass",
          "high",
          ["goplus"]
        )
      ),
      sellTax: gp("Sell Tax", () =>
        securityField(
          "Sell Tax",
          formatTax(sellTax, true),
          sellTax !== null && sellTax > 10 ? "fail" : sellTax !== null && sellTax > 5 ? "warn" : "pass",
          "high",
          ["goplus"]
        )
      ),
      dynamicTax: gp("Dynamic Tax", () =>
        securityField(
          "Dynamic Tax",
          slippageModifiable ? "Yes" : "No",
          slippageModifiable ? "warn" : "pass",
          "medium",
          ["goplus"]
        )
      ),
      feeModifiers: gp("Fee Modifiers", () =>
        securityField(
          "Fee Modifiers",
          slippageModifiable ? "Detected" : "None",
          slippageModifiable ? "warn" : "pass",
          "medium",
          ["goplus"]
        )
      ),
      extremeFee: gp("Extreme Fee Detection", () =>
        securityField(
          "Extreme Fee Detection",
          (buyTax ?? 0) > 20 || (sellTax ?? 0) > 20 ? "Detected" : "None",
          (buyTax ?? 0) > 20 || (sellTax ?? 0) > 20 ? "fail" : "pass",
          "high",
          ["goplus"]
        )
      ),
      personalSlippage: gp("Personal Slippage", () =>
        securityField(
          "Personal Slippage",
          personalSlippageModifiable ? "Modifiable" : "Fixed",
          personalSlippageModifiable ? "warn" : "pass",
          "medium",
          ["goplus"]
        )
      ),
    },
    liquidity: {
      liquidity: hasPair
        ? securityField(
            "Liquidity",
            formatUsd(liquidityUsd),
            (liquidityUsd ?? 0) < 10000 ? "fail" : (liquidityUsd ?? 0) < 100000 ? "warn" : "pass",
            "high",
            ["dexscreener"]
          )
        : noLiquidity
          ? securityField("Liquidity", MSG.NO_LIQUIDITY, "unknown", "low", [])
          : unknownField("Liquidity", MSG.DEX_INCONCLUSIVE),
      lockedPercent: gp("Locked %", () =>
        securityField("Locked %", MSG.NOT_APPLICABLE, "unknown", "low", ["goplus"])
      ),
      withdrawable: gp("Withdrawable Liquidity", (g) =>
        securityField(
          "Withdrawable Liquidity",
          g.is_in_dex === "1" ? "In DEX" : "Not in DEX",
          g.is_in_dex === "1" ? "pass" : "warn",
          "medium",
          ["goplus"]
        )
      ),
      priceImpact: securityField("Price Impact", MSG.NOT_APPLICABLE, "unknown", "low", []),
      lpHolders: gp("LP Holders", (g) =>
        g.lp_holder_count
          ? securityField("LP Holders", g.lp_holder_count, "pass", "medium", ["goplus"])
          : unknownField("LP Holders", MSG.DATA_UNAVAILABLE)
      ),
      pairAge: dex("Pair Age", (p) =>
        securityField("Pair Age", formatPairAge(p.pairCreatedAt), "pass", "high", ["dexscreener"])
      ),
      depth: dex("Depth", (p) =>
        securityField(
          "Depth",
          formatUsd(p.liquidity?.usd),
          (p.liquidity?.usd ?? 0) < 50000 ? "warn" : "pass",
          "medium",
          ["dexscreener"]
        )
      ),
    },
    contract: {
      verified: verifiedField(),
      proxy:
        isProxy !== null
          ? securityField(
              "Proxy Contract",
              isProxy ? "Yes" : "No",
              isProxy ? "warn" : "pass",
              "high",
              goplusOk ? ["goplus"] : ["rpc"]
            )
          : rpc
            ? securityField("Proxy Contract", "No", "pass", "high", ["rpc"])
            : unknownField("Proxy Contract", MSG.RPC_INCONCLUSIVE),
      upgradeable: gp("Upgradeable", () =>
        securityField(
          "Upgradeable",
          isProxy ? "Possible" : "No",
          isProxy ? "warn" : "pass",
          "medium",
          ["goplus"]
        )
      ),
      mintFunction: gp("Mint Function", () =>
        securityField(
          "Mint Function",
          isMintable ? "Yes" : "No",
          isMintable ? "warn" : "pass",
          "high",
          ["goplus"]
        )
      ),
      burnFunction: securityField("Burn Function", MSG.NOT_APPLICABLE, "unknown", "low", []),
      blacklist: gp("Blacklist", () =>
        securityField(
          "Blacklist",
          isBlacklisted ? "Yes" : "No",
          isBlacklisted ? "warn" : "pass",
          "high",
          ["goplus"]
        )
      ),
      whitelist: gp("Whitelist", () =>
        securityField(
          "Whitelist",
          isWhitelisted ? "Yes" : "No",
          isWhitelisted ? "warn" : "pass",
          "medium",
          ["goplus"]
        )
      ),
      transferPause: gp("Transfer Pause", () =>
        securityField(
          "Transfer Pause",
          transferPausable ? "Yes" : "No",
          transferPausable ? "fail" : "pass",
          "high",
          ["goplus"]
        )
      ),
      tradingPause: gp("Trading Pause", () =>
        securityField(
          "Trading Pause",
          cannotSellAll ? "Yes" : "No",
          cannotSellAll ? "fail" : "pass",
          "high",
          ["goplus"]
        )
      ),
      buyRestriction: gp("Buy Restriction", () =>
        securityField(
          "Buy Restriction",
          cannotBuy ? "Yes" : "No",
          cannotBuy ? "fail" : "pass",
          "high",
          ["goplus"]
        )
      ),
      tradingCooldown: gp("Trading Cooldown", () =>
        securityField(
          "Trading Cooldown",
          tradingCooldown ? "Yes" : "No",
          tradingCooldown ? "warn" : "pass",
          "medium",
          ["goplus"]
        )
      ),
      selfDestruct: gp("Self-Destruct", () =>
        securityField(
          "Self-Destruct",
          selfdestruct ? "Yes" : "No",
          selfdestruct ? "fail" : "pass",
          "high",
          ["goplus"]
        )
      ),
      externalCall: gp("External Call Risk", () =>
        securityField(
          "External Call Risk",
          externalCall ? "Detected" : "None",
          externalCall ? "warn" : "pass",
          "medium",
          ["goplus"]
        )
      ),
      antiWhaleModifiable: gp("Anti-Whale Modifiable", () =>
        securityField(
          "Anti-Whale Modifiable",
          antiWhaleModifiable ? "Yes" : "No",
          antiWhaleModifiable ? "warn" : "pass",
          "medium",
          ["goplus"]
        )
      ),
      ownerBalanceChange: gp("Owner Balance Change", () =>
        securityField(
          "Owner Balance Change",
          ownerChangeBalance ? "Allowed" : "Not Allowed",
          ownerChangeBalance ? "fail" : "pass",
          "high",
          ["goplus"]
        )
      ),
      sameCreatorHoneypot: gp("Same Creator Honeypot", () =>
        securityField(
          "Same Creator Honeypot",
          honeypotSameCreator ? "Detected" : "None",
          honeypotSameCreator ? "fail" : "pass",
          "high",
          ["goplus"]
        )
      ),
      ownerPrivileges: gp("Owner Privileges", () =>
        securityField(
          "Owner Privileges",
          canTakeBackOwnership || ownerChangeBalance ? "Elevated" : "Limited",
          canTakeBackOwnership || ownerChangeBalance ? "fail" : "pass",
          "high",
          ["goplus"]
        )
      ),
      hiddenFunctions: gp("Hidden Functions", (g) =>
        securityField(
          "Hidden Functions",
          parseGoPlusBool(g.hidden_owner) ? "Detected" : "None",
          parseGoPlusBool(g.hidden_owner) ? "fail" : "pass",
          "medium",
          ["goplus"]
        )
      ),
    },
    ownership: {
      owner: ownershipField(),
      eoaOwner: ownerAddress
        ? securityField(
            "EOA Owner",
            isEoaOwner(ownerAddress, rpc?.ownerBytecode) === true
              ? "Yes"
              : isEoaOwner(ownerAddress, rpc?.ownerBytecode) === false
                ? "Contract"
                : MSG.DATA_UNAVAILABLE,
            isEoaOwner(ownerAddress, rpc?.ownerBytecode) === true ? "warn" : "pass",
            "medium",
            ["rpc"]
          )
        : rpc && rpc.ownerCallable === false
          ? securityField("EOA Owner", MSG.NO_OWNER, "unknown", "low", ["rpc"])
          : goplusUnsupported
            ? goplusUnsupportedField("EOA Owner")
            : unknownField("EOA Owner"),
      multisig: securityField("Multisig", MSG.NOT_APPLICABLE, "unknown", "low", []),
      renounced: ownerAddress
        ? securityField(
            "Renounced",
            renounced ? "Yes" : "No",
            renounced ? "pass" : "warn",
            "high",
            rpc ? ["rpc", ...(goplusOk ? (["goplus"] as const) : [])] : ["goplus"]
          )
        : rpc && rpc.ownerCallable === false
          ? securityField("Renounced", MSG.NO_OWNER, "unknown", "medium", ["rpc"])
          : goplusUnsupported
            ? goplusUnsupportedField("Renounced")
            : unknownField("Renounced"),
      history: securityField("Ownership History", MSG.NOT_APPLICABLE, "unknown", "low", []),
      timelock: securityField("Timelock", MSG.NOT_APPLICABLE, "unknown", "low", []),
      adminPrivileges: gp("Admin Privileges", () =>
        securityField(
          "Admin Privileges",
          canTakeBackOwnership
            ? "Can reclaim ownership"
            : ownerChangeBalance
              ? "Can change balances"
              : "Standard",
          canTakeBackOwnership || ownerChangeBalance ? "fail" : "pass",
          "high",
          ["goplus"]
        )
      ),
    },
    holders: {
      topHolders: gp("Top Holders", (g) =>
        g.holders?.length
          ? securityField("Top Holders", `${g.holders.length} tracked`, "pass", "medium", ["goplus"])
          : unknownField("Top Holders", MSG.DATA_UNAVAILABLE)
      ),
      whales:
        topHolderPercent !== null && goplusOk
          ? securityField(
              "Whales",
              formatPercent(topHolderPercent, true),
              topHolderPercent > 0.2 ? "fail" : topHolderPercent > 0.1 ? "warn" : "pass",
              "medium",
              ["goplus"]
            )
          : goplusUnsupported
            ? goplusUnsupportedField("Whales")
            : unknownField("Whales"),
      developerWallet: securityField("Developer Wallet", MSG.NOT_APPLICABLE, "unknown", "low", []),
      burnWallet: securityField("Burn Wallet", MSG.NOT_APPLICABLE, "unknown", "low", []),
      exchangeWallets: securityField("Exchange Wallets", MSG.NOT_APPLICABLE, "unknown", "low", []),
      distribution: gp("Distribution", (g) =>
        g.holder_count
          ? securityField("Distribution", `${g.holder_count} holders`, "pass", "medium", ["goplus"])
          : unknownField("Distribution", MSG.DATA_UNAVAILABLE)
      ),
      concentrationScore:
        topHolderPercent !== null && goplusOk
          ? securityField(
              "Concentration Score",
              formatPercent(topHolderPercent, true),
              topHolderPercent > 0.15 ? "warn" : "pass",
              "medium",
              ["goplus"]
            )
          : goplusUnsupported
            ? goplusUnsupportedField("Concentration Score")
            : unknownField("Concentration Score"),
    },
    market: {
      price: dex("Price", (p) =>
        securityField(
          "Price",
          `$${parseFloat(p.priceUsd ?? "0").toFixed(6)}`,
          "pass",
          "high",
          ["dexscreener"]
        )
      ),
      fdv: dex("FDV", (p) =>
        securityField("FDV", formatUsd(p.fdv), "pass", "high", ["dexscreener"])
      ),
      liquidity: dex("Liquidity", (p) =>
        securityField("Liquidity", formatUsd(p.liquidity?.usd), "pass", "high", ["dexscreener"])
      ),
      marketCap: dex("Market Cap", (p) =>
        securityField(
          "Market Cap",
          formatUsd(p.marketCap, MSG.NO_LIQUIDITY),
          "pass",
          "high",
          ["dexscreener"]
        )
      ),
      volume: dex("Volume", (p) =>
        securityField("Volume", formatUsd(p.volume?.h24), "pass", "high", ["dexscreener"])
      ),
      buys: dex("Buys", (p) =>
        securityField(
          "Buys",
          p.txns?.h24?.buys !== undefined ? String(p.txns.h24.buys) : MSG.NO_TRADING,
          "pass",
          "high",
          ["dexscreener"]
        )
      ),
      sells: dex("Sells", (p) =>
        securityField(
          "Sells",
          p.txns?.h24?.sells !== undefined ? String(p.txns.h24.sells) : MSG.NO_TRADING,
          "pass",
          "high",
          ["dexscreener"]
        )
      ),
      transactions: dex("Transactions", (p) => {
        const total = (p.txns?.h24?.buys ?? 0) + (p.txns?.h24?.sells ?? 0);
        return securityField(
          "Transactions",
          total > 0 ? String(total) : MSG.NO_TRADING,
          "pass",
          "high",
          ["dexscreener"]
        );
      }),
      age: dex("Age", (p) =>
        securityField("Age", formatPairAge(p.pairCreatedAt), "pass", "high", ["dexscreener"])
      ),
      dex: dex("DEX", (p) =>
        securityField("DEX", p.dexId, "pass", "high", ["dexscreener"])
      ),
      pairAddress: dex("Pair Address", (p) =>
        securityField(
          "Pair Address",
          `${p.pairAddress.slice(0, 6)}…${p.pairAddress.slice(-4)}`,
          "pass",
          "high",
          ["dexscreener"]
        )
      ),
      trendingScore: dex("Trending Score", (p) => {
        const vol = p.volume?.h24 ?? 0;
        return securityField(
          "Trending Score",
          vol > 1_000_000 ? "High" : vol > 100_000 ? "Medium" : hasTrading ? "Low" : MSG.NO_TRADING,
          "pass",
          "medium",
          ["dexscreener"]
        );
      }),
      momentum: dex("Momentum", (p) =>
        p.priceChange?.h24 !== undefined
          ? securityField(
              "Momentum",
              `${p.priceChange.h24.toFixed(2)}%`,
              p.priceChange.h24 < -20 ? "warn" : "pass",
              "medium",
              ["dexscreener"]
            )
          : securityField("Momentum", MSG.NO_TRADING, "unknown", "low", ["dexscreener"])
      ),
    },
    aiSummary: "",
    aiSummarySource: "deterministic",
    scanDurationMs,
  };

  const { summary, source } = await generateAiSummary(report);
  report.aiSummary = summary;
  report.aiSummarySource = source;
  report.findings = collectFindings(report);

  return report;
}

function collectFindings(report: ScanReport) {
  const sections = [
    report.honeypot,
    ...Object.values(report.taxes),
    ...Object.values(report.liquidity),
    ...Object.values(report.contract),
    ...Object.values(report.ownership),
    ...Object.values(report.holders),
    ...Object.values(report.market),
  ];

  return sections
    .filter((s) => !SKIP_FINDING_VALUES.has(s.value))
    .map((s, i) => ({
      id: `finding-${i}`,
      category: s.label,
      label: s.label,
      value: s.value,
      status: s.status,
      confidence: s.confidence,
      sources: s.sources,
    }));
}

export function getRiskLevelColor(tier: RiskTier): string {
  return getTierColor(tier);
}

export function getVerdictDisplayColor(verdict: Verdict): string {
  return getVerdictColor(verdict);
}
