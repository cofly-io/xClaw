# xClaw Desktop packaging scripts

One-click build: each script first builds a **wheel** via
`scripts/wheel_build.sh` (includes the console frontend), then uses a
**temporary conda environment** and **conda-pack** (no current dev env).
Dependencies follow `pyproject.toml`.

- **Windows**: wheel → conda-pack → unpack → NSIS installer (`.exe`)
- **macOS**: wheel → conda-pack → unpack into `.app` → optional zip

## System Requirements

- **Windows**: Windows 10 or later
- **macOS**: macOS 14 (Sonoma) or later, Apple Silicon (M1/M2/M3/M4) recommended

## Prerequisites

- **conda** (Miniconda/Anaconda) on PATH
- **Node.js / npm** (for the console frontend)
- (Windows only) **NSIS**: `makensis` on PATH
- **Icons**: Pre-generated `icon.ico` (Windows) and `icon.icns` (macOS) are included in `scripts/pack/assets/`

## One-click build

From the **repo root**:

**macOS** (implementation lives in `scripts/pack/macos/`; wrapper keeps the old path working)
```bash
bash ./scripts/pack/macos/build.sh
# Output: dist/xClaw.app

CREATE_ZIP=1 bash ./scripts/pack/macos/build.sh   # also create .zip
# Equivalent: bash ./scripts/pack/build_macos.sh
```

**Windows (PowerShell)**
```powershell
./scripts/pack/build_win.ps1
# Output: dist/xClaw-Setup-<version>.exe
# Creates two launchers:
#   - xClaw Desktop.vbs (silent, no console window)
#   - xClaw Desktop (Debug).bat (shows console for troubleshooting)
# Note: Pre-compiles all Python files to .pyc for faster startup
```

## Run from terminal and see logs (macOS)

If the .app crashes on double-click, run it from Terminal to see the full error and logs:

```bash
# From repo root; force packed env only (no system conda / PYTHONPATH). Adjust path if needed.
APP_ENV="$(pwd)/dist/xClaw.app/Contents/Resources/env"
PYTHONPATH= PYTHONHOME="$APP_ENV" "$APP_ENV/bin/python" -m xclaw desktop
```

The `PYTHONNOUSERSITE=1` prevents Python from loading packages from `~/.local/lib/pythonX.Y/site-packages`, which can conflict with the packaged environment. All stdout/stderr (including Python tracebacks) will appear in the terminal. Use this to debug startup errors or to run with `--log-level debug`.

When you **double-click** the .app and nothing appears, the launcher writes stderr/stdout to `~/.xclaw/desktop.log`. Inspect that file for errors.

On first launch macOS may ask for “Desktop” or “Files and Folders” access: click **Allow** so the app can run properly; if you click Don’t Allow, the window may close.

## macOS: if “Apple cannot verify” / Gatekeeper blocks the app

When users download the xClaw macOS app (e.g. from Releases) as a `.app` (in a zip), macOS may show: *"Apple cannot verify that 'xClaw' contains no malicious software"*. The app is not notarized. They can still open it as follows:

- **Right-click to open (recommended)**
  Right-click (or Control+click) the xClaw app → **Open** → in the dialog click **Open** again. Gatekeeper will allow it; after that double-click works as usual.

- **Allow in System Settings**
  If still blocked, go to **System Settings → Privacy & Security**, find the message like *"xClaw was blocked because it is from an unidentified developer"*, and click **Open Anyway** or **Allow**.

- **Remove quarantine attribute (not recommended for most users)**
  In Terminal: `xattr -cr /Applications/xClaw.app` (or the path to the `.app` after unzipping). This clears the download quarantine flag; less safe than right-click → Open.

## CI

`.github/workflows/desktop-release.yml`:

- **Triggers**: Release publish or manual workflow_dispatch
- **Windows**: Build console → temporary conda env + conda-pack → NSIS → upload artifact
- **macOS**: Build console → temporary conda env + conda-pack → .app → zip → upload artifact
- **Release**: When triggered by a release, uploads the Windows installer and macOS zip as release assets

## Script reference

| File | Description |
|------|-------------|
| `build_common.py` | Create temporary conda env, install `xclaw[full]` from a wheel, conda-pack; produces archive. |
| `macos/build.sh` | One-click: build wheel → build_common → unpack into xClaw.app; optional zip. |
| `build_macos.sh` | Thin wrapper → `macos/build.sh` (CI / backwards compatibility). |
| `build_win.ps1` | One-click: build wheel → build_common → unpack → create VBS/BAT launchers → makensis installer. |
| `desktop.nsi` | NSIS script: pack `dist/win-unpacked`, add icons, and create shortcuts. |
| `assets/icon.ico` | Pre-generated Windows icon (installer and shortcuts). |
| `assets/icon.icns` | Pre-generated macOS icon (app bundle). |
