import { NextRequest, NextResponse } from "next/server";
import { getChain, isValidEvmAddress } from "@/lib/chains";
import { scanToken } from "@/lib/token-scan";
import type { ChainId } from "@/lib/types/scan";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const chain = searchParams.get("chain") as ChainId | null;

  if (!address || !chain) {
    return NextResponse.json(
      { error: "Missing address or chain parameter" },
      { status: 400 }
    );
  }

  const chainConfig = getChain(chain);
  if (!chainConfig || !chainConfig.supported) {
    return NextResponse.json({ error: "This blockchain is not in HoodScope's supported network list." }, { status: 400 });
  }

  if (!isValidEvmAddress(address)) {
    return NextResponse.json({ error: "Invalid contract address" }, { status: 400 });
  }

  try {
    const report = await scanToken(address, chain);
    return NextResponse.json(report);
  } catch {
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
