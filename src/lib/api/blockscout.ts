export async function fetchContractVerification(
  apiBase: string,
  address: string
): Promise<boolean | null> {
  try {
    const url = `${apiBase}?module=contract&action=getsourcecode&address=${address.toLowerCase()}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== "1" || !data.result?.[0]) return null;

    const { SourceCode, ABI } = data.result[0];
    const hasSource = Boolean(SourceCode && SourceCode.length > 2);
    const hasAbi = Boolean(ABI && ABI !== "Contract source code not verified");
    return hasSource || hasAbi;
  } catch {
    return null;
  }
}
