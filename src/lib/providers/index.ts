import type { ChainConfig } from "@/lib/chains";
import { fetchRpcProvider } from "@/lib/providers/rpc";
import { fetchGoPlusProvider } from "@/lib/providers/goplus";
import { fetchDexScreenerProvider } from "@/lib/providers/dexscreener";
import { fetchExplorerProvider } from "@/lib/providers/blockscout";
import type { ScanSources } from "@/lib/providers/types";

export async function fetchAllProviders(
  config: ChainConfig,
  address: string
): Promise<ScanSources> {
  const normalized = address.toLowerCase();

  const [rpc, goplus, dexscreener, explorer] = await Promise.all([
    fetchRpcProvider(config, normalized),
    fetchGoPlusProvider(config, normalized),
    fetchDexScreenerProvider(config, normalized),
    fetchExplorerProvider(config, normalized),
  ]);

  return { rpc, goplus, dexscreener, explorer };
}

export { getBestPair } from "@/lib/providers/dexscreener";
export {
  fetchGoPlusTokenSecurity,
  isGoPlusChainSupported,
  parseGoPlusBool,
  parseGoPlusPercent,
} from "@/lib/providers/goplus";
export { fetchRpcProvider, isEoaOwner, isOwnershipRenounced } from "@/lib/providers/rpc";
