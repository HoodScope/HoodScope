import type { DexPair } from "@/lib/types/scan";
import type { ChainConfig } from "@/lib/chains";
import { MSG } from "@/lib/fields";
import type { ProviderResult } from "@/lib/providers/types";

interface DexScreenerResponse {
  pairs: DexPair[] | null;
}

const FETCH_HEADERS = {
  Accept: "application/json",
  "User-Agent": "HoodScope/1.0 (+https://hoodscope.app)",
};

export async function fetchDexScreenerPairs(address: string): Promise<DexPair[]> {
  try {
    const url = `https://api.dexscreener.com/latest/dex/tokens/${address.toLowerCase()}`;
    const res = await fetch(url, {
      next: { revalidate: 30 },
      headers: FETCH_HEADERS,
    });

    if (!res.ok) return [];

    const data: DexScreenerResponse = await res.json();
    return data.pairs ?? [];
  } catch {
    return [];
  }
}

/** Select best pair on the requested chain only — never fall back to another chain */
export function getBestPair(pairs: DexPair[], dexChainId: string): DexPair | null {
  const filtered = pairs.filter(
    (p) => p.chainId.toLowerCase() === dexChainId.toLowerCase()
  );
  if (!filtered.length) return null;

  return filtered.reduce<DexPair | null>((best, current) => {
    const currentLiq = current.liquidity?.usd ?? 0;
    const bestLiq = best?.liquidity?.usd ?? 0;
    return currentLiq > bestLiq ? current : best;
  }, null);
}

export async function fetchDexScreenerProvider(
  config: ChainConfig,
  address: string
): Promise<ProviderResult<DexPair[]>> {
  try {
    const allPairs = await fetchDexScreenerPairs(address);
    const chainPairs = allPairs.filter(
      (p) => p.chainId.toLowerCase() === config.dexScreenerChainId.toLowerCase()
    );

    if (!chainPairs.length) {
      return { data: [], state: "empty", message: MSG.NO_LIQUIDITY };
    }

    return { data: chainPairs, state: "ok" };
  } catch {
    return { data: null, state: "failed", message: MSG.DEX_FAILED };
  }
}
