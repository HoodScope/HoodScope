import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { c } from "../format/colors.js";

function cliRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
}

function repoRoot(): string {
  const root = path.resolve(cliRoot(), "..");
  const pkgPath = path.join(root, "package.json");
  if (!existsSync(pkgPath)) return process.cwd();
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { name?: string };
    if (pkg.name === "hoodscope") return root;
  } catch {
    /* fall through */
  }
  return process.cwd();
}

function run(cmd: string, cwd: string) {
  execSync(cmd, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32" ? "powershell.exe" : "/bin/bash",
  });
}

function installCursorSkill(cliDir: string) {
  const skillSrc = path.join(cliDir, "skill", "SKILL.md");
  if (!existsSync(skillSrc)) {
    console.error(`${c.yellow}Skill file not found at ${skillSrc}${c.reset}`);
    return;
  }

  const skillDestDir = path.join(homedir(), ".cursor", "skills", "hoodscope-cli");
  const skillDest = path.join(skillDestDir, "SKILL.md");
  mkdirSync(skillDestDir, { recursive: true });
  cpSync(skillSrc, skillDest);
  console.log(`${c.hoodGreen}✓${c.reset} Cursor skill → ${skillDest}`);
}

export async function installCommand(args: string[]) {
  const withSkill = args.includes("--skill") || args.includes("-s");
  const skipLink = args.includes("--no-link");
  const cliDir = cliRoot();
  const root = repoRoot();

  console.log(`\n${c.bold}HoodScope agent installer${c.reset}\n`);

  if (existsSync(path.join(root, "package.json"))) {
    console.log(`${c.dim}[1/4] Root dependencies…${c.reset}`);
    run("npm install", root);
  } else {
    console.log(`${c.dim}[1/4] Skipping root install (not in HoodScope repo)${c.reset}`);
  }

  console.log(`\n${c.dim}[2/4] CLI dependencies…${c.reset}`);
  run("npm install", cliDir);

  console.log(`\n${c.dim}[3/4] Building CLI…${c.reset}`);
  run("npm run build", cliDir);

  if (!skipLink) {
    console.log(`\n${c.dim}[4/4] Linking global hoodscope command…${c.reset}`);
    run("npm link", cliDir);
  } else {
    console.log(`\n${c.dim}[4/4] Skipped global link (--no-link)${c.reset}`);
  }

  if (withSkill) {
    console.log(`\n${c.dim}Installing Cursor skill…${c.reset}`);
    installCursorSkill(cliDir);
  }

  console.log(`\n${c.hoodGreen}Done!${c.reset} Try:\n`);
  console.log(`  hoodscope scan 0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168 --chain robinhood`);
  console.log(`  hoodscope skills\n`);
  if (!withSkill) {
    console.log(
      `${c.dim}Tip: run ${c.reset}hoodscope install --skill${c.dim} to add the Cursor agent skill.${c.reset}\n`
    );
  }
}
