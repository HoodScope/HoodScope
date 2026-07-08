import type { ScanReport } from "@/lib/types/scan";
import { CHAINS } from "@/lib/chains";
import {
  buildTerminalFindings,
  formatMarketStats,
  formatSources,
} from "@/lib/terminal-format";
import { c, padEnd, sevColor } from "./colors.js";

function verdictPillStyle(verdict: string): string {
  switch (verdict) {
    case "CLEAR":
      return "\x1b[48;2;204;255;0m\x1b[30m";
    case "REVIEW":
      return "\x1b[48;2;245;166;35m\x1b[30m";
    default:
      return "\x1b[48;2;255;59;48m\x1b[37m";
  }
}

function printFindingsRows(report: ScanReport) {
  const findings = buildTerminalFindings(report);
  const checkW = 22;
  const sevW = 6;

  for (const row of findings) {
    const sev = `${sevColor(row.sev)}${padEnd(row.severity, sevW)}${c.reset}`;
    console.log(`${c.dim}${padEnd(row.check, checkW)}${c.reset}${sev}${row.title}`);
    console.log(`${c.dim}  ${row.description}${c.reset}`);
  }
}

export function printScanReport(report: ScanReport, chain: string, address: string) {
  const chainName = CHAINS[report.chain]?.name ?? report.chain;
  const stats = formatMarketStats(report);
  const pill = verdictPillStyle(report.verdictLabel);

  console.log(`${c.dim}$${c.reset} hoodscope scan ${address} --chain ${chain}`);
  console.log(
    `${c.dim}Scanning ${address} on ${chain} (on-chain + GoPlus + DexScreener)...${c.reset}`
  );
  console.log("");
  console.log(`  ${pill}${c.bold} ${report.verdictLabel} · score ${report.riskScore}/100 ${c.reset}`);
  console.log("");
  console.log(
    `${c.teal}  price ${stats.price}   mcap ${stats.mcap}   liquidity ${stats.liquidity}   24h vol ${stats.volume}${c.reset}`
  );
  console.log("");
  printFindingsRows(report);
  console.log("");
  console.log(`${c.dim}Address: ${address} on ${chainName} (${chain})${c.reset}`);
  console.log(`${c.dim}Sources: ${formatSources(report)}${c.reset}`);

  if (report.partialFailures.length) {
    console.log(
      `${c.yellow}Note: Some data sources returned incomplete results. Findings reflect all checks that could be completed.${c.reset}`
    );
  }

  const duration = report.scanDurationMs
    ? ` · ${(report.scanDurationMs / 1000).toFixed(1)}s`
    : "";
  console.log(`${c.dim}AI (${report.aiSummarySource})${duration}${c.reset}`);
  for (const line of report.aiSummary.split("\n")) {
    console.log(`${c.dim}  ${line}${c.reset}`);
  }
  console.log("");
}

export function printScanProgress() {
  // Progress merged into printScanReport for hero-style output
}
