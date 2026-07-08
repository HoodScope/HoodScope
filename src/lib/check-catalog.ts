/** Security check catalog — keep in sync with README.md Check Reference */
export interface CheckDefinition {
  id: string;
  area: string;
  description: string;
}

export const CHECK_CATALOG: CheckDefinition[] = [
  { id: "EXEC-CHAINID", area: "Execution", description: "Chain ID verified via RPC" },
  { id: "CONTRACT-EXISTS", area: "Contract", description: "Token address has deployed bytecode" },
  { id: "CONTRACT-OWNER", area: "Contract", description: "Ownership renounced or active" },
  { id: "CONTRACT-VERIFIED", area: "Contract", description: "Source code verified (GoPlus / Blockscout)" },
  { id: "CONTRACT-HONEYPOT", area: "Honeypot", description: "GoPlus honeypot detection" },
  { id: "GOP-TAX-BUY", area: "Tax", description: "Buy tax percentage" },
  { id: "GOP-TAX-SELL", area: "Tax", description: "Sell tax percentage" },
  { id: "GOP-MINT", area: "Permissions", description: "Mint function present" },
  { id: "GOP-PROXY", area: "Permissions", description: "Proxy / upgradeable contract" },
  { id: "GOP-BLACKLIST", area: "Permissions", description: "Blacklist capability" },
  { id: "GOP-TRANSFER-PAUSE", area: "Permissions", description: "Transfer pause enabled" },
  { id: "GOP-BUY-LOCK", area: "Permissions", description: "Buy restriction (cannot_buy)" },
  { id: "GOP-SELL-LOCK", area: "Permissions", description: "Sell restriction (cannot_sell_all)" },
  { id: "GOP-SELF-DESTRUCT", area: "Permissions", description: "Self-destruct enabled" },
  { id: "GOP-HIDDEN-OWNER", area: "Permissions", description: "Hidden owner detected" },
  { id: "GOP-OWNER-PRIV", area: "Permissions", description: "Elevated owner privileges" },
  { id: "MKT-PRICE", area: "Market", description: "Live token price (DexScreener)" },
  { id: "MKT-LIQUIDITY", area: "Market", description: "Pool liquidity depth" },
  { id: "MKT-MCAP", area: "Market", description: "Market capitalization" },
  { id: "MKT-VOLUME", area: "Market", description: "24h trading volume" },
  { id: "MKT-ACTIVITY", area: "Market", description: "Buy/sell transaction count" },
  { id: "HOLD-WHALES", area: "Holders", description: "Top holder concentration" },
];

export const GOP_CHECK_IDS = new Set([
  "CONTRACT-HONEYPOT",
  "GOP-TAX-BUY",
  "GOP-TAX-SELL",
  "GOP-MINT",
  "GOP-PROXY",
  "GOP-BLACKLIST",
  "GOP-TRANSFER-PAUSE",
  "GOP-BUY-LOCK",
  "GOP-SELL-LOCK",
  "GOP-SELF-DESTRUCT",
  "GOP-HIDDEN-OWNER",
  "GOP-OWNER-PRIV",
]);

export const MKT_CHECK_IDS = new Set([
  "MKT-PRICE",
  "MKT-LIQUIDITY",
  "MKT-MCAP",
  "MKT-VOLUME",
  "MKT-ACTIVITY",
]);
