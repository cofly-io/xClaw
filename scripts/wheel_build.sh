#!/usr/bin/env bash
# Build a full wheel package including the latest console frontend.
# Run from repo root: bash scripts/wheel_build.sh
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

CONSOLE_DIR="$REPO_ROOT/console"
CONSOLE_DEST="$REPO_ROOT/src/xclaw/console"

echo "[wheel_build] Building console frontend..."
if ! command -v pnpm >/dev/null 2>&1; then
  echo "[wheel_build] ERROR: pnpm is required (console uses pnpm-lock.yaml)." >&2
  echo "  Install: https://pnpm.io/installation  or: corepack enable && corepack prepare pnpm@9 --activate" >&2
  exit 1
fi
(cd "$CONSOLE_DIR" && pnpm install --frozen-lockfile)
(cd "$CONSOLE_DIR" && pnpm run build)

echo "[wheel_build] Copying console/dist/* -> src/xclaw/console/..."
rm -rf "$CONSOLE_DEST"/*

mkdir -p "$CONSOLE_DEST"
cp -R "$CONSOLE_DIR/dist/"* "$CONSOLE_DEST/"

echo "[wheel_build] Bundling website docs into package..."
DOCS_SRC="$REPO_ROOT/website/public/docs"
DOCS_DEST="$REPO_ROOT/src/qwenpaw/docs"
rm -rf "$DOCS_DEST"
mkdir -p "$DOCS_DEST"
cp "$DOCS_SRC/"*.md "$DOCS_DEST/"

echo "[wheel_build] Building wheel + sdist..."
python3 -m pip install --quiet build
rm -rf dist/*
python3 -m build --outdir dist .

echo "[wheel_build] Done. Wheel(s) in: $REPO_ROOT/dist/"
