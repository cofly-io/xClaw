#!/usr/bin/env bash
# One-click build: console -> conda-pack -> xClaw.app. Run from repo root on macOS.
# Requires: conda, node/npm (for console). Icons: ../assets/icon.icns (see README).
#
# Entry points (equivalent):
#   bash scripts/pack/macos/build.sh
#   bash scripts/pack/build_macos.sh   # thin wrapper for backwards compatibility

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PACK_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$PACK_ROOT/../.." && pwd)"
cd "$REPO_ROOT"

DIST="${DIST:-dist}"
ARCHIVE="${DIST}/xclaw-env.tar.gz"
APP_NAME="xClaw"
APP_DIR="${DIST}/${APP_NAME}.app"

echo "== Building wheel (includes console frontend) =="
VERSION_FILE="${REPO_ROOT}/src/xclaw/__version__.py"
CURRENT_VERSION=""
if [[ -f "${VERSION_FILE}" ]]; then
  CURRENT_VERSION="$(
    sed -n 's/^__version__[[:space:]]*=[[:space:]]*"\([^"]*\)".*/\1/p' \
      "${VERSION_FILE}" 2>/dev/null
  )"
fi
if [[ -n "${CURRENT_VERSION}" ]]; then
  shopt -s nullglob
  whls=("${REPO_ROOT}/dist/xclaw-${CURRENT_VERSION}-"*.whl)
  if [[ ${#whls[@]} -gt 0 ]]; then
    echo "dist/ already has wheel for version ${CURRENT_VERSION}, skipping."
  else
    old_whls=("${REPO_ROOT}/dist/xclaw-"*.whl)
    if [[ ${#old_whls[@]} -gt 0 ]]; then
      echo "Removing old wheel files: ${old_whls[*]}"
      rm -f "${old_whls[@]}"
    fi
    bash scripts/wheel_build.sh
  fi
else
  bash scripts/wheel_build.sh
fi

echo "== Building conda-packed env =="
python "${PACK_ROOT}/build_common.py" --output "$ARCHIVE" --format tar.gz

echo "== Building .app bundle =="
rm -rf "$APP_DIR"
mkdir -p "${APP_DIR}/Contents/MacOS"
mkdir -p "${APP_DIR}/Contents/Resources"

mkdir -p "${APP_DIR}/Contents/Resources/env"
tar -xzf "$ARCHIVE" -C "${APP_DIR}/Contents/Resources/env" --strip-components=0

if [[ -x "${APP_DIR}/Contents/Resources/env/bin/conda-unpack" ]]; then
  (cd "${APP_DIR}/Contents/Resources/env" && ./bin/conda-unpack)
fi

echo "== Bundling SUPOS_AK (xclaw.env) =="
BUNDLED_ENV="${APP_DIR}/Contents/Resources/xclaw.env"
WRITE_ENV_ARGS=(--output "${BUNDLED_ENV}")
if [[ -n "${SUPOS_AK:-}" ]]; then
  WRITE_ENV_ARGS+=(--supos-ak "${SUPOS_AK}")
fi
if python "${REPO_ROOT}/scripts/pack/write_bundled_env.py" "${WRITE_ENV_ARGS[@]}"; then
  echo "== Wrote ${BUNDLED_ENV}"
elif [[ "${ALLOW_MISSING_SUPOS_AK:-}" == "1" ]]; then
  echo "== WARN: SUPOS_AK missing; xclaw.env not written (ALLOW_MISSING_SUPOS_AK=1)"
else
  echo "ERROR: SUPOS_AK required for distributable macOS build."
  echo "  export SUPOS_AK=... or create desktop/supos_ak.env (see desktop/supos_ak.env.example)"
  echo "  or: ALLOW_MISSING_SUPOS_AK=1 for dev builds without bundled AK"
  exit 1
fi

cat > "${APP_DIR}/Contents/MacOS/${APP_NAME}" << 'LAUNCHER'
#!/usr/bin/env bash
ENV_DIR="$(cd "$(dirname "$0")/../Resources/env" && pwd)"
RESOURCES="$(cd "$(dirname "$0")/../Resources" && pwd)"
LOG="$HOME/.xclaw/desktop.log"
unset PYTHONPATH
export PYTHONHOME="$ENV_DIR"
export QWENPAW_DESKTOP_APP=1
if [ -f "$RESOURCES/xclaw.env" ]; then
  export QWENPAW_BUNDLED_ENV_FILE="$RESOURCES/xclaw.env"
fi

export PATH="$ENV_DIR/bin:$PATH"

if [ -x "$ENV_DIR/bin/python" ]; then
  CERT_FILE=$("$ENV_DIR/bin/python" -c \
    "import certifi; print(certifi.where())" 2>/dev/null)
  if [ -n "$CERT_FILE" ] && [ -f "$CERT_FILE" ]; then
    export SSL_CERT_FILE="$CERT_FILE"
    export REQUESTS_CA_BUNDLE="$CERT_FILE"
    export CURL_CA_BUNDLE="$CERT_FILE"
  fi
fi

cd "$HOME" || true

LOG_LEVEL="${QWENPAW_LOG_LEVEL:-info}"

if [ ! -t 2 ]; then
  mkdir -p "$HOME/.xclaw"
  { echo "=== $(date) xClaw starting ==="
    echo "ENV_DIR=$ENV_DIR"
    echo "Python: $ENV_DIR/bin/python (exists=$([ -x "$ENV_DIR/bin/python" ] && echo yes || echo no))"
    echo "PATH=$PATH"
    echo "LOG_LEVEL=$LOG_LEVEL"
    echo "SSL_CERT_FILE=${SSL_CERT_FILE:-not set}"
    if [ -n "$SSL_CERT_FILE" ] && [ -f "$SSL_CERT_FILE" ]; then
      echo "SSL certificate file found at $SSL_CERT_FILE"
    elif [ -n "$SSL_CERT_FILE" ]; then
      echo "WARNING: SSL_CERT_FILE set but file does not exist: $SSL_CERT_FILE"
    else
      echo "WARNING: SSL_CERT_FILE not set, SSL connections may fail"
    fi
  } >> "$LOG"
  exec 2>> "$LOG"
  exec 1>> "$LOG"
  if [ ! -x "$ENV_DIR/bin/python" ]; then
    echo "ERROR: python not executable at $ENV_DIR/bin/python"
    exit 1
  fi
  if [ ! -f "$HOME/.xclaw/config.json" ]; then
    "$ENV_DIR/bin/python" -u -m xclaw init --defaults --accept-security
  fi
  echo "Launching python with log-level=$LOG_LEVEL..."
  "$ENV_DIR/bin/python" -u -m xclaw desktop --log-level "$LOG_LEVEL"
  EXIT=$?
  if [ $EXIT -ge 128 ]; then
    SIG=$((EXIT - 128))
    echo "Exit code: $EXIT (killed by signal $SIG, e.g. 9=SIGKILL 15=SIGTERM)"
  else
    echo "Exit code: $EXIT"
  fi
  echo "--- Full log: $LOG (scroll up for Python traceback if app exited early) ---"
  exit $EXIT
fi
if [ ! -f "$HOME/.xclaw/config.json" ]; then
  "$ENV_DIR/bin/python" -u -m xclaw init --defaults --accept-security
fi
exec "$ENV_DIR/bin/python" -u -m xclaw desktop --log-level "$LOG_LEVEL"
LAUNCHER
chmod +x "${APP_DIR}/Contents/MacOS/${APP_NAME}"

if [[ -f "${PACK_ROOT}/assets/icon.icns" ]]; then
  echo "== Using pre-generated icon.icns =="
else
  echo "Warning: icon.icns not found at ${PACK_ROOT}/assets/icon.icns"
  echo "Generate it first: bash scripts/pack/generate_icons.sh"
fi

VERSION="${CURRENT_VERSION}"
if [[ -z "${VERSION}" ]]; then
  VERSION="$("${APP_DIR}/Contents/Resources/env/bin/python" -c \
    "from importlib.metadata import version; print(version('xclaw'))" 2>/dev/null \
    || echo "0.0.0")"
  echo "Using version from packed env metadata: ${VERSION}"
else
  echo "Version determined from __version__.py: ${VERSION}"
fi
ICON_PLIST=""
if [[ -f "${PACK_ROOT}/assets/icon.icns" ]]; then
  cp "${PACK_ROOT}/assets/icon.icns" "${APP_DIR}/Contents/Resources/"
  ICON_PLIST="<key>CFBundleIconFile</key><string>icon.icns</string>
  "
fi
cat > "${APP_DIR}/Contents/Info.plist" << INFOPLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" \
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key><string>${APP_NAME}</string>
  <key>CFBundleIdentifier</key><string>com.xclaw.desktop</string>
  <key>CFBundleName</key><string>${APP_NAME}</string>
  <key>CFBundleVersion</key><string>${VERSION}</string>
  <key>CFBundleShortVersionString</key><string>${VERSION}</string>
  ${ICON_PLIST}<key>NSHighResolutionCapable</key><true/>
  <key>LSMinimumSystemVersion</key><string>14.0</string>
  <key>NSDesktopFolderUsageDescription</key><string>xClaw may access files in your Desktop folder if you use file-related features. You can choose Don'\''t Allow; the app will still run with limited file access.</string>
</dict>
</plist>
INFOPLIST

echo "== Built ${APP_DIR} =="
if [[ -n "${CREATE_ZIP}" ]]; then
  ZIP_NAME="${DIST}/xClaw-${VERSION}-macOS.zip"
  ditto -c -k --sequesterRsrc --keepParent "${APP_DIR}" "${ZIP_NAME}"
  echo "== Created ${ZIP_NAME} =="
fi
