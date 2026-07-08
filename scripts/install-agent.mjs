#!/usr/bin/env node
/**
 * Cross-platform HoodScope agent installer.
 * Usage: npm run install:agent [-- --skill]
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { homedir, platform } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const withSkill = process.argv.includes("--skill");

function run(cmd, args, cwd = root) {
  const result = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("\n HoodScope agent installer\n");

run("npm", ["install"], root);
run("npm", ["install"], path.join(root, "cli"));
run("npm", ["run", "build"], path.join(root, "cli"));
run("npm", ["link"], path.join(root, "cli"));

if (withSkill) {
  const skillSrc = path.join(root, "cli", "skill", "SKILL.md");
  const skillDir = path.join(homedir(), ".cursor", "skills", "hoodscope-cli");
  const skillDest = path.join(skillDir, "SKILL.md");
  if (!existsSync(skillSrc)) {
    console.error(`Skill file missing: ${skillSrc}`);
    process.exit(1);
  }
  mkdirSync(skillDir, { recursive: true });
  copyFileSync(skillSrc, skillDest);
  console.log(`\n Cursor skill installed → ${skillDest}`);
}

console.log("\n Done! Try:");
console.log("   hoodscope scan 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 --chain base");
if (platform() === "win32") {
  console.log("\n Or: npm run cli -- scan 0x... --chain base\n");
} else {
  console.log("\n Or: npm run cli -- scan 0x... --chain base\n");
}
