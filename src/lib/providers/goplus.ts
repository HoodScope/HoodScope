import type { GoPlusTokenData } from "@/lib/types/scan";
import type { ChainConfig } from "@/lib/chains";
import { MSG } from "@/lib/fields";
import type { ProviderResult } from "@/lib/providers/types";

const GOPLUS_BASE = "https://api.gopluslabs.io/api/v1";

interface GoPlusResponse {
  code: number;
  message: string;
  result?: Record<string, GoPlusTokenData>;
}

interface GoPlusSupportedChainsResponse {
  code: number;
  message: string;
  result?: Array<{ name: string; id: string }>;
}

let supportedChainIdsCache: Set<number> | null = null;
let supportedChainsCacheAt = 0;
const SUPPORTED_CACHE_TTL_MS = 60 * 60 * 1000;

export async function fetchGoPlusSupportedChainIds(): Promise<Set<number>> {
  const now = Date.now();
  if (supportedChainIdsCache && now - supportedChainsCacheAt < SUPPORTED_CACHE_TTL_MS) {
    return supportedChainIdsCache;
  }

  try {
    const res = await fetch(`${GOPLUS_BASE}/supported_chains`, {
      next: { revalidate: 3600 },
      headers: {
        Accept: "application/json",
        "User-Agent": "HoodScope/1.0 (+https://hoodscope.app)",
      },
    });

    if (!res.ok) return supportedChainIdsCache ?? new Set();

    const data: GoPlusSupportedChainsResponse = await res.json();
    if (data.code !== 1 || !data.result) return supportedChainIdsCache ?? new Set();

    const ids = new Set(
      data.result
        .map((chain) => parseInt(chain.id, 10))
        .filter((id) => !Number.isNaN(id))
    );

    supportedChainIdsCache = ids;
    supportedChainsCacheAt = now;
    return ids;
  } catch {
    return supportedChainIdsCache ?? new Set();
  }
}

export async function isGoPlusChainSupported(chainId: number): Promise<boolean> {
  const supported = await fetchGoPlusSupportedChainIds();
  return supported.has(chainId);
}

export async function fetchGoPlusTokenSecurity(
  chainId: number,
  address: string
): Promise<GoPlusTokenData | null> {
  try {
    const url = `${GOPLUS_BASE}/token_security/${chainId}?contract_addresses=${address.toLowerCase()}`;
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: {
        Accept: "application/json",
        "User-Agent": "HoodScope/1.0 (+https://hoodscope.app)",
      },
    });

    if (!res.ok) return null;

    const data: GoPlusResponse = await res.json();
    if (data.code !== 1 || !data.result) return null;

    const key = Object.keys(data.result).find(
      (k) => k.toLowerCase() === address.toLowerCase()
    );
    return key ? data.result[key] : null;
  } catch {
    return null;
  }
}

export async function fetchGoPlusProvider(
  config: ChainConfig,
  address: string
): Promise<ProviderResult<GoPlusTokenData>> {
  if (!config.goplusChainId) {
    return { data: null, state: "unsupported", message: MSG.GOPLUS_UNSUPPORTED };
  }

  const supported = await isGoPlusChainSupported(config.goplusChainId);
  if (!supported) {
    return { data: null, state: "unsupported", message: MSG.GOPLUS_UNSUPPORTED };
  }

  const data = await fetchGoPlusTokenSecurity(config.goplusChainId, address);
  if (!data) {
    return { data: null, state: "failed", message: MSG.GOPLUS_FAILED };
  }

  return { data, state: "ok" };
}

export function parseGoPlusBool(value?: string): boolean | null {
  if (value === undefined || value === null || value === "") return null;
  return value === "1" || value === "true";
}

export function parseGoPlusPercent(value?: string): number | null {
  if (!value) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}
