#!/usr/bin/env bash
# Backwards-compatible entry: delegates to scripts/pack/macos/build.sh
set -e
exec "$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)/macos/build.sh"
