import { scanCommand } from "./commands/scan.js";
import { chainsCommand } from "./commands/chains.js";
import { helpCommand, skillsCommand } from "./commands/help.js";
import { installCommand } from "./commands/install.js";

async function main() {
  const [, , command, ...args] = process.argv;

  try {
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
      case "install":
        await installCommand(args.slice(1));
        break;
      case "--help":
      case "-h":
      case "help":
      case undefined:
        helpCommand();
        break;
      default:
        if (command.startsWith("0x")) {
          await scanCommand([command, ...args]);
        } else {
          console.error(`Unknown command: ${command}`);
          helpCommand();
          process.exit(2);
        }
    }
  } catch (err) {
    console.error("Analysis failed:", err instanceof Error ? err.message : err);
    process.exit(2);
  }
}

main();
