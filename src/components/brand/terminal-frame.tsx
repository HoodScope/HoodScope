"use client";

import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";

interface TerminalFrameProps {
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function TerminalTitleBar() {
  return (
    <div
      className="flex shrink-0 items-center gap-2 px-4 py-2.5"
      style={{
        backgroundColor: brand.terminal.bar,
        borderBottom: `1px solid ${brand.terminal.border}`,
      }}
    >
      <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
      <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
      <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      <span className="ml-1 font-mono text-[11px]" style={{ color: brand.terminal.dim }}>
        hoodscope — scan
      </span>
    </div>
  );
}

/** Fixed terminal viewport — scroll inside, scrollbar hidden */
export function TerminalFrame({ children, className, bodyClassName }: TerminalFrameProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl text-left shadow-[0_20px_60px_rgba(0,0,0,0.2)]",
        className
      )}
      style={{ backgroundColor: brand.terminal.bg }}
    >
      <TerminalTitleBar />
      <div
        className={cn(
          "terminal-scroll h-[400px] overflow-y-auto overflow-x-hidden p-5 font-mono text-[12px] leading-relaxed sm:p-6 sm:text-[13px]",
          bodyClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface TerminalCommandLineProps {
  address: string;
  chain: string;
}

export function TerminalCommandLine({ address, chain }: TerminalCommandLineProps) {
  return (
    <div className="break-all">
      <span style={{ color: brand.terminal.prompt }}>$</span>{" "}
      <span style={{ color: "#e8e8e8" }}>
        hoodscope scan {address} --chain {chain}
      </span>
    </div>
  );
}

interface TerminalScanStatusProps {
  address: string;
  chain: string;
}

export function TerminalScanStatus({ address, chain }: TerminalScanStatusProps) {
  return (
    <p className="break-all" style={{ color: brand.terminal.dim }}>
      Scanning {address} on {chain} (on-chain + GoPlus + DexScreener)...
    </p>
  );
}
