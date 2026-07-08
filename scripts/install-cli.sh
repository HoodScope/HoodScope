#!/usr/bin/env bash
set -euo pipefail

echo ""
echo " HoodScope CLI Installer"
echo " ======================="
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js not found. Install Node 18+ from https://nodejs.org"
  exit 1
fi

NODE_MAJOR="$(node -p "process.version.slice(1).split('.')[0]")"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "[ERROR] Node.js 18+ required. Current: $(node -v)"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "[1/3] Installing root dependencies..."
npm install

echo ""
echo "[2/3] Building CLI..."
cd cli
npm install
npm run build

echo ""
echo "[3/3] Linking global command: hoodscope ..."
npm link

cd "$ROOT"

echo ""
echo " Done! Try:"
echo "   hoodscope scan 0xYOUR_ADDRESS"
echo "   hoodscope chains"
echo "   hoodscope skills"
echo ""
echo " Cursor agent skill:"
echo "   hoodscope install --skill"
echo ""
echo " Without global install, use:"
echo "   npm run cli -- scan 0xYOUR_ADDRESS"
echo ""
