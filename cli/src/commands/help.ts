import { c } from "../format/colors.js";

const HELP = `${c.hoodGreen}hoodscope${c.reset} — Know the Risk Before You Buy.

${c.bold}Usage${c.reset}
  hoodscope install [--skill]                 Install CLI (+ optional Cursor skill)
  hoodscope scan <0x...> [--chain <chain>]   Analyze a token (live data)
  hoodscope chains                           List supported chains
  hoodscope skills                           List HoodScope capabilities
  hoodscope --help                           Show this help

${c.bold}Examples${c.reset}
  hoodscope install --skill
  hoodscope scan 0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168 --chain robinhood
  hoodscope scan 0x... --chain robinhood
  hoodscope scan 0x... --json
  hoodscope scan 0x... --quiet

${c.bold}Chains${c.reset}
  robinhood (default), ethereum, base, arbitrum, bsc, polygon, optimism, avalanche

${c.bold}Exit codes${c.reset}
  0  CLEAR
  1  REVIEW
  2  FLAGGED

${c.bold}Data sources${c.reset}
  Robinhood Chain RPC · GoPlus Security API · DexScreener API

${c.bold}Optional${c.reset}
  GITHUB_TOKEN — enable AI summary via GitHub Models
`;

export function helpCommand() {
  console.log(HELP);
}

export function skillsCommand() {
  console.log(`${c.bold}HoodScope capabilities${c.reset}\n`);
  const skills = [
    ["scan", "Full token security analysis with terminal report"],
    ["chains", "List all supported blockchain networks"],
    ["honeypot", "Detect honeypot and sell restrictions (GoPlus)"],
    ["taxes", "Buy/sell tax and fee modifier detection"],
    ["contract", "Proxy, mint, blacklist, self-destruct, verification"],
    ["ownership", "Renounced status, admin privileges, hidden owner"],
    ["liquidity", "Pool depth, pair age, DEX listing (DexScreener)"],
    ["market", "Price, market cap, volume, buy/sell activity"],
    ["holders", "Whale concentration and distribution"],
    ["risk-score", "Security score 0–100 with CLEAR / REVIEW / FLAGGED"],
    ["ai-summary", "Deterministic or GitHub Models AI explanation"],
  ];

  for (const [name, desc] of skills) {
    console.log(`  ${c.hoodGreen}${name.padEnd(14)}${c.reset}${desc}`);
  }
  console.log("");
}
