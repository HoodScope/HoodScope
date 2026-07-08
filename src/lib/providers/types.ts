import type { DexPair, GoPlusTokenData, RpcTokenData } from "@/lib/types/scan";

export type ProviderState = "ok" | "unsupported" | "empty" | "failed" | "skipped";

export interface ProviderResult<T> {
  data: T | null;
  state: ProviderState;
  message?: string;
}

export interface ScanSources {
  rpc: ProviderResult<RpcTokenData>;
  goplus: ProviderResult<GoPlusTokenData>;
  dexscreener: ProviderResult<DexPair[]>;
  explorer: ProviderResult<boolean>;
}
