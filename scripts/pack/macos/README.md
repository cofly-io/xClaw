# macOS desktop packaging

This folder holds the **macOS** desktop build script, mirroring how **Windows** uses
`scripts/pack/build_win.ps1` + `desktop.nsi` in the parent `pack/` directory.

## Layout

| Path | Role |
|------|------|
| `macos/build.sh` | One-click: wheel → `build_common.py` (conda-pack) → `dist/xClaw.app`; optional zip |
| `../build_common.py` | Shared with Windows: create packed Python env |
| `../assets/icon.icns` | App bundle icon |

## Requirements

- Run on **macOS** (needs `ditto` for optional zip, paths for `.app` bundle).
- **conda**, **Node/npm** (console build), same as `../README.md`.

## Commands

From **repository root**:

```bash
chmod +x scripts/pack/macos/build.sh
bash scripts/pack/macos/build.sh
# Output: dist/xClaw.app

CREATE_ZIP=1 bash scripts/pack/macos/build.sh   # also dist/xClaw-<version>-macOS.zip
```

The wrapper `scripts/pack/build_macos.sh` calls this script for CI and old docs.

## Gatekeeper / distribution

See `../README.md` (English) or `../README_zh.md` for “unidentified developer”, zip upload, and debugging via `~/.xclaw/desktop.log`.
