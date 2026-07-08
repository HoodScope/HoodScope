#!/usr/bin/env node
/**
 * Verify this folder is HoodScope before any git push.
 * Run: npm run github:check
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(
  readFileSync(path.join(root, "project.config.json"), "utf8")
);
const expectedOwner = config.github.owner;
const expectedRepo = config.github.repo;
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));

let failed = false;

function fail(msg) {
  console.error(`\x1b[31m✗\x1b[0m ${msg}`);
  failed = true;
}

function ok(msg) {
  console.log(`\x1b[32m✓\x1b[0m ${msg}`);
}

console.log("\n HoodScope — GitHub preflight\n");

if (pkg.name !== "hoodscope") {
  fail(`package.json name is "${pkg.name}", expected "hoodscope"`);
} else {
  ok('package.json name is "hoodscope"');
}

const gitDir = path.join(root, ".git");
if (!existsSync(gitDir)) {
  fail("Not a git repository");
} else {
  ok("Git repository detected");
}

try {
  const remote = execSync("git remote get-url origin", {
    cwd: root,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();

  const allowed =
    remote.includes(`${expectedOwner}/${expectedRepo}`) ||
    remote.toLowerCase().includes(`${expectedOwner}/${expectedRepo}`.toLowerCase());

  if (!allowed) {
    fail(`origin remote does not match HoodScope: ${remote}`);
    console.error(
      `  Expected owner/repo: ${expectedOwner}/${expectedRepo}`
    );
  } else {
    ok(`origin → ${remote}`);
  }
} catch {
  console.log(
    "\x1b[33m!\x1b[0m No git remote 'origin' yet — add only after creating the HoodScope repo:"
  );
  console.log(
    `   git remote add origin https://github.com/${expectedOwner}/${expectedRepo}.git`
  );
}

try {
  const ghUser = execSync("gh api user --jq .login", {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();
  ok(`GitHub CLI active account: ${ghUser}`);
  if (ghUser.toLowerCase() !== expectedOwner.toLowerCase()) {
    console.log(
      `\x1b[33m!\x1b[0m Active gh account (${ghUser}) ≠ configured owner (${expectedOwner}).`
    );
    console.log(
      "  Before pushing HoodScope, switch: gh auth switch -u " + expectedOwner
    );
  }
} catch {
  console.log(
    "\x1b[33m!\x1b[0m GitHub CLI not logged in. Login: https://github.com/login"
  );
  console.log("  Then run: gh auth login");
}

console.log("");
if (failed) {
  console.error("Preflight failed — fix before pushing HoodScope.\n");
  process.exit(1);
}
console.log("Preflight OK — safe to work on HoodScope only.\n");
