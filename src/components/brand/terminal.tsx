"use client";

import { cn } from "@/lib/utils";
import type { ScanReport } from "@/lib/types/scan";
import type { ChainId } from "@/lib/types/scan";
import { CHAINS, DEFAULT_CHAIN_ID } from "@/lib/chains";
import {
  buildTerminalFindings,
  formatMarketStats,
  formatSources,
} from "@/lib/terminal-format";
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

interface ScanTerminalProps {
  className?: string;
  report?: ScanReport | null;
  address?: string;
  chain?: ChainId;
  isLoading?: boolean;
  showFooter?: boolean;
  error?: string;
}

export function ScanTerminal({
  className,
  report,
  address,
  chain = DEFAULT_CHAIN_ID,
  isLoading = false,
  showFooter = true,
  error,
}: ScanTerminalProps) {
  const chainName = CHAINS[chain]?.name ?? chain;
  const displayAddress = address ?? "0x…";
  const findings = report ? buildTerminalFindings(report) : [];
  const durationSec = report?.scanDurationMs
    ? (report.scanDurationMs / 1000).toFixed(1)
    : null;

  return (
    <TerminalFrame className={cn("w-full", className)}>
      <div className="space-y-4">
        <TerminalCommandLine address={displayAddress} chain={chain} />

        {(isLoading || report) && (
          <TerminalScanStatus address={displayAddress} chain={chain} />
        )}

        {!isLoading && !report && !error && (
          <p style={{ color: "#888888" }}>
            Paste a contract address and run a scan.
          </p>
        )}

        {isLoading && !report && (
          <p style={{ color: "#888888" }}>Fetching live on-chain data…</p>
        )}

        {error && !report && (
          <p style={{ color: "#febc2e" }}>{error}</p>
        )}

        {report && (
          <>
            <TerminalVerdictPill verdict={report.verdictLabel} score={report.riskScore} />
            <TerminalMarketRow {...formatMarketStats(report)} />
            <TerminalFindingsList findings={findings} className="space-y-1 pt-1" />

            {showFooter && (
              <div
                className="space-y-1 border-t pt-4"
                style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
              >
                <p className="break-all" style={{ color: "#888888" }}>
                  Address: {report.address} on {chainName}
                </p>
                <p style={{ color: "#888888" }}>
                  Sources: {formatSources(report)}
                </p>
                {report.partialFailures.length > 0 && (
                  <p style={{ color: "#febc2e" }}>
                    Some data sources returned incomplete results. Findings reflect all
                    checks that could be completed.
                  </p>
                )}
                <p style={{ color: "#888888" }}>
                  AI ({report.aiSummarySource})
                  {durationSec ? ` · ${durationSec}s` : ""}
                </p>
                {report.aiSummary.split("\n").map((line, i) => (
                  <p key={i} style={{ color: "#888888" }}>
                    {line}
                  </p>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </TerminalFrame>
  );
}
