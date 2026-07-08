"use client";

import { brand } from "@/lib/brand";
import type { TerminalFinding } from "@/lib/finding-formatter";
import { SEV_COLORS } from "@/lib/finding-formatter";

interface TerminalFindingsListProps {
  findings: TerminalFinding[];
  className?: string;
}

export function TerminalFindingsList({ findings, className }: TerminalFindingsListProps) {
  return (
    <div className={className}>
      {findings.map((row) => (
        <div
          key={row.check}
          className="grid grid-cols-[minmax(0,1.15fr)_2.75rem_minmax(0,1fr)] items-start gap-x-2 gap-y-0.5 border-b border-white/[0.04] py-1.5 last:border-0 sm:grid-cols-[10rem_3rem_1fr]"
        >
          <span
            className="truncate pt-0.5 text-[10px] uppercase tracking-wide sm:text-[11px]"
            style={{ color: brand.terminal.dim }}
          >
            {row.check}
          </span>
          <span
            className="pt-0.5 text-[10px] font-bold uppercase sm:text-[11px]"
            style={{ color: SEV_COLORS[row.sev] }}
          >
            {row.severity}
          </span>
          <div className="min-w-0 space-y-0.5">
            <p
              className="text-[11px] font-medium leading-snug sm:text-[12px]"
              style={{ color: brand.terminal.text }}
            >
              {row.title}
            </p>
            <p
              className="text-[10px] leading-snug sm:text-[11px]"
              style={{ color: brand.terminal.dim }}
            >
              {row.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

interface TerminalMarketRowProps {
  price: string;
  mcap: string;
  liquidity: string;
  volume: string;
}

export function TerminalMarketRow({ price, mcap, liquidity, volume }: TerminalMarketRowProps) {
  return (
    <div
      className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-center sm:gap-x-8"
      style={{ color: "#5ec8d8" }}
    >
      <span>
        <span className="text-white/40">price </span>
        {price}
      </span>
      <span>
        <span className="text-white/40">mcap </span>
        {mcap}
      </span>
      <span>
        <span className="text-white/40">liquidity </span>
        {liquidity}
      </span>
      <span>
        <span className="text-white/40">24h vol </span>
        {volume}
      </span>
    </div>
  );
}

interface TerminalVerdictPillProps {
  verdict: string;
  score: number;
}

export function TerminalVerdictPill({ verdict, score }: TerminalVerdictPillProps) {
  const bg =
    verdict === "CLEAR" ? brand.green : verdict === "REVIEW" ? "#F5A623" : "#FF3B30";
  const color = verdict === "CLEAR" ? "#000000" : "#ffffff";

  return (
    <div className="flex justify-center py-1">
      <span
        className="inline-block rounded-xl px-5 py-2 text-sm font-bold tracking-tight"
        style={{ backgroundColor: bg, color }}
      >
        {verdict} · score {score}/100
      </span>
    </div>
  );
}
