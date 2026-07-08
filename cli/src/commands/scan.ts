import { runTokenScan } from "@/lib/scan";
import { CHAINS, DEFAULT_CHAIN_ID, isValidEvmAddress } from "@/lib/chains";
import type { ChainId } from "@/lib/types/scan";
import { printScanReport } from "../format/terminal.js";

export async function scanCommand(args: string[]) {
  let chain: ChainId = DEFAULT_CHAIN_ID;
  let address = "";
  let json = false;
  let quiet = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--chain" && args[i + 1]) {
      chain = args[++i] as ChainId;
    } else if ((arg === "--address" || arg === "-a") && args[i + 1]) {
      address = args[++i];
    } else if (arg === "--json") {
      json = true;
    } else if (arg === "--quiet" || arg === "-q") {
      quiet = true;
    } else if (arg.startsWith("0x")) {
      address = arg;
    } else if (arg in CHAINS) {
      chain = arg as ChainId;
    }
  }

  if (!address) {
    console.error("Error: contract address required");
    console.error("Usage: hoodscope scan <0x...> [--chain robinhood]");
    process.exit(2);
  }

  if (!CHAINS[chain]) {
    console.error(`Error: unsupported chain "${chain}"`);
    process.exit(2);
  }

  if (!isValidEvmAddress(address)) {
    console.error("Error: invalid contract address");
    process.exit(2);
  }

  const report = await runTokenScan(chain, address);

  if (json) {
    console.log(JSON.stringify(report, null, 2));
  } else if (quiet) {
    console.log(report.verdictLabel);
  } else {
    printScanReport(report, chain, address);
  }

  process.exit(report.exitCode);
}
