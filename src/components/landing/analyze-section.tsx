"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SUPPORTED_CHAINS, DEFAULT_CHAIN_ID } from "@/lib/chains";
import type { ChainId } from "@/lib/types/scan";
import { cn } from "@/lib/utils";
import { ScanTerminal } from "@/components/brand/terminal";
import { fetchScanReport } from "@/lib/fetch-scan";

export function AnalyzeSection() {
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState<ChainId>(DEFAULT_CHAIN_ID);
  const [scanTarget, setScanTarget] = useState<{
    chain: ChainId;
    address: string;
  } | null>(null);

  const { data: report, isLoading, isError, error } = useQuery({
    queryKey: ["landing-scan", scanTarget?.chain, scanTarget?.address],
    queryFn: () =>
      fetchScanReport(scanTarget!.chain, scanTarget!.address),
    enabled: Boolean(scanTarget),
    staleTime: 60_000,
  });

  const handleScan = () => {
    const trimmed = address.trim();
    if (!trimmed) return;
    setScanTarget({ chain, address: trimmed });
  };

  return (
    <section id="analyze" className="bg-white py-16 scroll-mt-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-black/40">
            Live terminal
          </p>
          <h2 className="mt-2 font-display font-bold text-3xl text-black sm:text-4xl">
            Scan Any Token
          </h2>
          <p className="mt-2 text-sm text-black/50 max-w-lg mx-auto">
            Same live engine as{" "}
            <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs">hoodscope scan</code>{" "}
            — real RPC, GoPlus, and DexScreener data.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-black/8 bg-cream p-6 sm:p-8"
        >
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />
              <Input
                placeholder="Paste Contract Address (0x...)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-12 rounded-full border-black/10 bg-white pl-11 font-mono text-sm text-black placeholder:text-black/30"
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-black/40">Chain:</span>
              {SUPPORTED_CHAINS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setChain(c.id)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                    chain === c.id
                      ? "bg-black text-white"
                      : "bg-white text-black/60 ring-1 ring-black/10 hover:text-black"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <button
              onClick={handleScan}
              disabled={!address.trim() || isLoading}
              className="btn-pill-primary w-full disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning…
                </>
              ) : (
                "Run Scan"
              )}
            </button>

            {isError && (
              <p className="text-center text-sm text-red-500">
                {error instanceof Error ? error.message : "Analysis failed"}
              </p>
            )}
          </div>
        </motion.div>

        {scanTarget && (isLoading || report) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-6"
          >
            <ScanTerminal
              report={report ?? null}
              address={scanTarget.address}
              chain={scanTarget.chain}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}
