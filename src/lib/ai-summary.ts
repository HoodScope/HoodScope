import type { ScanReport } from "@/lib/types/scan";
import { buildFormattedFindings } from "@/lib/finding-formatter";

export function generateDeterministicSummary(report: ScanReport): string {
  const lines: string[] = [];

  lines.push(
    `Status: ${report.verdictLabel} — security score ${report.riskScore}/100.`
  );

  if (report.dangerFindings.length) {
    lines.push(
      `Blocking concerns: ${report.dangerFindings.map((d) => d.label).join(", ")}.`
    );
  }

  const highlights = buildFormattedFindings(report)
    .filter((f) => f.severity === "DANGER" || f.severity === "WARN")
    .slice(0, 4);

  for (const row of highlights) {
    lines.push(`${row.title}: ${row.description}`);
  }

  const ownership = buildFormattedFindings(report).find((f) => f.id === "CONTRACT-OWNER");
  if (ownership && !highlights.some((h) => h.id === "CONTRACT-OWNER")) {
    lines.push(`${ownership.title}. ${ownership.description}`);
  }

  const liquidity = buildFormattedFindings(report).find((f) => f.id === "MKT-LIQUIDITY");
  if (liquidity?.severity === "OK" && !highlights.some((h) => h.id === "MKT-LIQUIDITY")) {
    lines.push(`${liquidity.title}. ${liquidity.description}`);
  }

  if (report.verdictLabel === "CLEAR" && lines.length === 1) {
    lines.push("No critical security issues were detected in the available data.");
  }

  if (report.chain === "robinhood") {
    lines.push(
      "GoPlus coverage is pending on Robinhood Chain — score reflects RPC, explorer, and DexScreener signals only."
    );
  }

  if (report.partialFailures.length) {
    lines.push(
      "Some data sources returned incomplete results. The score reflects all checks that could be completed."
    );
  }

  return lines.join("\n");
}

/** @deprecated use generateDeterministicSummary */
export function generateAiSummary(report: ScanReport): string {
  return generateDeterministicSummary(report);
}
