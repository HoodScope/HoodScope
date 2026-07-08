import type { ChainId } from "@/lib/types/scan";

export interface ChainConfig {
  id: ChainId;
  name: string;
  evmChainId: number;
  /** GoPlus API chain ID — null when chain is not supported by GoPlus */
  goplusChainId: number | null;
  goplusSupported: boolean;
  dexScreenerChainId: string;
  rpcUrl: string;
  explorerUrl: string;
  blockscoutApiUrl: string | null;
  nativeCurrency: string;
  supported: boolean;
}

export const CHAINS: Record<ChainId, ChainConfig> = {
  robinhood: {
    id: "robinhood",
    name: "Robinhood Chain",
    evmChainId: 4663,
    goplusChainId: null,
    goplusSupported: false, // GoPlus API returns 2022 for chain 4663
    dexScreenerChainId: "robinhood",
    rpcUrl: "https://rpc.mainnet.chain.robinhood.com",
    explorerUrl: "https://robinhoodchain.blockscout.com",
    blockscoutApiUrl: "https://robinhoodchain.blockscout.com/api",
    nativeCurrency: "ETH",
    supported: true,
  },
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    evmChainId: 1,
    goplusChainId: 1,
    goplusSupported: true,
    dexScreenerChainId: "ethereum",
    rpcUrl: "https://ethereum.publicnode.com",
    explorerUrl: "https://etherscan.io",
    blockscoutApiUrl: null,
    nativeCurrency: "ETH",
    supported: true,
  },
  base: {
    id: "base",
    name: "Base",
    evmChainId: 8453,
    goplusChainId: 8453,
    goplusSupported: true,
    dexScreenerChainId: "base",
    rpcUrl: "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
    blockscoutApiUrl: null,
    nativeCurrency: "ETH",
    supported: true,
  },
  arbitrum: {
    id: "arbitrum",
    name: "Arbitrum",
    evmChainId: 42161,
    goplusChainId: 42161,
    goplusSupported: true,
    dexScreenerChainId: "arbitrum",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorerUrl: "https://arbiscan.io",
    blockscoutApiUrl: null,
    nativeCurrency: "ETH",
    supported: true,
  },
  bsc: {
    id: "bsc",
    name: "BSC",
    evmChainId: 56,
    goplusChainId: 56,
    goplusSupported: true,
    dexScreenerChainId: "bsc",
    rpcUrl: "https://bsc-dataseed.binance.org",
    explorerUrl: "https://bscscan.com",
    blockscoutApiUrl: null,
    nativeCurrency: "BNB",
    supported: true,
  },
  polygon: {
    id: "polygon",
    name: "Polygon",
    evmChainId: 137,
    goplusChainId: 137,
    goplusSupported: true,
    dexScreenerChainId: "polygon",
    rpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
    blockscoutApiUrl: null,
    nativeCurrency: "MATIC",
    supported: true,
  },
  optimism: {
    id: "optimism",
    name: "Optimism",
    evmChainId: 10,
    goplusChainId: 10,
    goplusSupported: true,
    dexScreenerChainId: "optimism",
    rpcUrl: "https://mainnet.optimism.io",
    explorerUrl: "https://optimistic.etherscan.io",
    blockscoutApiUrl: null,
    nativeCurrency: "ETH",
    supported: true,
  },
  avalanche: {
    id: "avalanche",
    name: "Avalanche",
    evmChainId: 43114,
    goplusChainId: 43114,
    goplusSupported: true,
    dexScreenerChainId: "avalanche",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    explorerUrl: "https://snowtrace.io",
    blockscoutApiUrl: null,
    nativeCurrency: "AVAX",
    supported: true,
  },
};

export const DEFAULT_CHAIN_ID: ChainId = "robinhood";

export const SUPPORTED_CHAINS = Object.values(CHAINS)
  .filter((c) => c.supported)
  .sort((a, b) => {
    if (a.id === DEFAULT_CHAIN_ID) return -1;
    if (b.id === DEFAULT_CHAIN_ID) return 1;
    return a.name.localeCompare(b.name);
  });

export const SUPPORTED_CHAIN_NAMES = SUPPORTED_CHAINS.map((c) => c.name).join(", ");

export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function getChain(chainId: string): ChainConfig | null {
  return CHAINS[chainId as ChainId] ?? null;
}
