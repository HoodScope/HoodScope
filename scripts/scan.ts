#!/usr/bin/env node
/**
 * HoodScope CLI shim — use `npm run cli` or install from cli/ package.
 */
import { scanCommand } from "../cli/src/commands/scan";
import { chainsCommand } from "../cli/src/commands/chains";
import { helpCommand, skillsCommand } from "../cli/src/commands/help";

async function main() {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case "scan":
      await scanCommand(args);
      break;
    case "chains":
      chainsCommand();
      break;
    case "skills":
      skillsCommand();
      break;
    case "--help":
    case "-h":
    case "help":
    case undefined:
      helpCommand();
      break;
    default:
      if (command?.startsWith("0x")) {
        await scanCommand([command, ...args]);
      } else {
        helpCommand();
        process.exit(command ? 2 : 0);
      }
  }
}

main().catch((err) => {
  console.error("Analysis failed:", err instanceof Error ? err.message : err);
  process.exit(2);
});
