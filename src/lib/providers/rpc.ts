import {
  createPublicClient,
  http,
  type Address,
  type Chain,
} from "viem";
import {
  mainnet,
  base,
  arbitrum,
  bsc,
  polygon,
  optimism,
  avalanche,
} from "viem/chains";
import type { RpcTokenData } from "@/lib/types/scan";
import type { ChainConfig } from "@/lib/chains";
import { MSG } from "@/lib/fields";
import type { ProviderResult } from "@/lib/providers/types";

const ERC20_ABI = [
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
] as const;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const IMPLEMENTATION_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

const EIP1167_PREFIX = "363d3d373d3d3d363d73";

function buildRobinhoodChain(config: ChainConfig): Chain {
  return {
    id: config.evmChainId,
    name: config.name,
    nativeCurrency: { name: "Ether", symbol: config.nativeCurrency, decimals: 18 },
    rpcUrls: { default: { http: [config.rpcUrl] } },
    blockExplorers: {
      default: { name: "Blockscout", url: config.explorerUrl },
    },
  };
}

const VIEM_CHAINS: Partial<Record<ChainConfig["id"], Chain>> = {
  ethereum: mainnet,
  base,
  arbitrum,
  bsc,
  polygon,
  optimism,
  avalanche,
};

function getViemChain(config: ChainConfig): Chain {
  if (config.id === "robinhood") return buildRobinhoodChain(config);
  const base = VIEM_CHAINS[config.id];
  if (!base) return buildRobinhoodChain(config);
  if (base.id === config.evmChainId) return base;
  return { ...base, id: config.evmChainId };
}

function createClient(config: ChainConfig) {
  return createPublicClient({
    chain: getViemChain(config),
    transport: http(config.rpcUrl, { timeout: 12_000 }),
  });
}

function detectProxyFromBytecode(bytecode: string | null): boolean {
  if (!bytecode || bytecode === "0x") return false;
  const hex = bytecode.toLowerCase().replace(/^0x/, "");
  return hex.startsWith(EIP1167_PREFIX);
}

function detectProxyFromSlot(slotValue: string | null): boolean {
  if (!slotValue || slotValue === "0x") return false;
  const stripped = slotValue.replace(/^0x/, "");
  return stripped !== "0".repeat(64);
}

async function fetchOwnerBytecode(
  config: ChainConfig,
  ownerAddress: string
): Promise<string | null> {
  try {
    const client = createClient(config);
    const code = await client.getBytecode({ address: ownerAddress as Address });
    return code ?? null;
  } catch {
    return null;
  }
}

export async function fetchRpcProvider(
  config: ChainConfig,
  address: string
): Promise<ProviderResult<RpcTokenData>> {
  try {
    const client = createClient(config);
    const addr = address as Address;

    const [bytecode, implementationSlot, name, symbol, decimals, totalSupply, owner] =
      await Promise.allSettled([
        client.getBytecode({ address: addr }),
        client.getStorageAt({ address: addr, slot: IMPLEMENTATION_SLOT }),
        client.readContract({ address: addr, abi: ERC20_ABI, functionName: "name" }),
        client.readContract({ address: addr, abi: ERC20_ABI, functionName: "symbol" }),
        client.readContract({ address: addr, abi: ERC20_ABI, functionName: "decimals" }),
        client.readContract({ address: addr, abi: ERC20_ABI, functionName: "totalSupply" }),
        client.readContract({ address: addr, abi: ERC20_ABI, functionName: "owner" }),
      ]);

    const bytecodeVal =
      bytecode.status === "fulfilled" ? bytecode.value : null;
    const isContract = Boolean(bytecodeVal && bytecodeVal !== "0x");

    if (!isContract) {
      return {
        data: {
          name: null,
          symbol: null,
          decimals: null,
          totalSupply: null,
          owner: null,
          bytecode: bytecodeVal ?? null,
          isContract: false,
          isProxy: false,
          ownerBytecode: null,
          ownerCallable: false,
        },
        state: "ok",
      };
    }

    const slotVal =
      implementationSlot.status === "fulfilled"
        ? implementationSlot.value
        : null;

    const isProxy =
      detectProxyFromBytecode(bytecodeVal ?? null) ||
      detectProxyFromSlot(slotVal ?? null);

    const ownerCallable = owner.status === "fulfilled";
    const ownerAddr = ownerCallable ? (owner.value as string) : null;

    let ownerBytecode: string | null = null;
    if (ownerAddr && ownerAddr.toLowerCase() !== ZERO_ADDRESS) {
      ownerBytecode = await fetchOwnerBytecode(config, ownerAddr);
    }

    return {
      data: {
        name: name.status === "fulfilled" ? (name.value as string) : null,
        symbol: symbol.status === "fulfilled" ? (symbol.value as string) : null,
        decimals: decimals.status === "fulfilled" ? Number(decimals.value) : null,
        totalSupply:
          totalSupply.status === "fulfilled"
            ? (totalSupply.value as bigint).toString()
            : null,
        owner: ownerAddr,
        bytecode: bytecodeVal ?? null,
        isContract,
        isProxy,
        ownerBytecode,
        ownerCallable,
      },
      state: "ok",
    };
  } catch {
    return { data: null, state: "failed", message: MSG.RPC_FAILED };
  }
}

export function isOwnershipRenounced(owner: string | null): boolean | null {
  if (!owner) return null;
  return owner.toLowerCase() === ZERO_ADDRESS;
}

export function isEoaOwner(
  owner: string | null,
  ownerBytecode: string | null | undefined
): boolean | null {
  if (!owner || owner.toLowerCase() === ZERO_ADDRESS) return null;
  if (ownerBytecode === null || ownerBytecode === undefined) return null;
  return ownerBytecode === "0x" || ownerBytecode === "";
}
