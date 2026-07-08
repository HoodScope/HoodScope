import { SUPPORTED_CHAINS } from "@/lib/chains";
import { c } from "../format/colors.js";

export function chainsCommand() {
  console.log(`${c.bold}Supported chains${c.reset}\n`);
  for (const chain of SUPPORTED_CHAINS) {
    const goplus = chain.goplusSupported ? "GoPlus ✓" : "GoPlus ✗";
    console.log(
      `  ${c.hoodGreen}${chain.id.padEnd(12)}${c.reset}${chain.name.padEnd(18)} ${c.dim}${goplus}${c.reset}`
    );
  }
  console.log("");
  console.log(`${c.dim}Default: robinhood${c.reset}`);
}
