import type { ChainId, ScanReport } from "@/lib/types/scan";

export async function fetchScanReport(
  chain: ChainId,
  address: string
): Promise<ScanReport> {
  const res = await fetch(
    `/api/scan?chain=${encodeURIComponent(chain)}&address=${encodeURIComponent(address)}`
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      typeof body.error === "string" ? body.error : "Analysis failed"
    );
  }
  return res.json();
}
