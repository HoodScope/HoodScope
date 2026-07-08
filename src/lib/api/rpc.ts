import type { ChainId } from "@/lib/types/scan";
import { CHAINS } from "@/lib/chains";
import {
  fetchRpcProvider,
  isEoaOwner,
  isOwnershipRenounced,
} from "@/lib/providers/rpc";

export async function fetchRpcTokenData(chainId: ChainId, address: string) {
  const config = CHAINS[chainId];
  const result = await fetchRpcProvider(config, address);
  return result.data;
}

export { isEoaOwner, isOwnershipRenounced };
