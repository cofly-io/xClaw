# -*- coding: utf-8 -*-
"""
xClaw 打包脚本。

推荐（随包带上 SUPOS_AK）：
  1. 复制 desktop/supos_ak.env.example 为 desktop/supos_ak.env
  2. 编辑 supos_ak.env，填写一行：SUPOS_AK=你的密钥
  3. 在项目根目录执行：python desktop/build.py

会在 dist/xClaw/ 生成 xclaw.env（与 xClaw.exe 同级），运行时自动加载。
本机若已在 xClaw 里保存过 AK（~/.xClaw/envs.json），打包脚本会自动读取用于写入 xclaw.env。

Windows 打包默认还会把官方便携 Node 解压到 dist/xClaw/node/（与 exe 同级），
运行时会优先加入 PATH，技能里可直接使用 node/npm。可用 --skip-node-bundle 跳过。

开发迭代想快一点：
  python desktop/build.py --fast --allow-missing-supos-ak
  等价于 --no-clean --skip-console --skip-node-bundle（需已存在 console/dist 且已同步到
  src/xclaw/console；否则不要用 --skip-console / --fast）。
  发版或怀疑缓存坏了时，用默认（带 --clean）全量打包。
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import zipfile

# Windows portable Node (LTS) next to xClaw.exe: dist/xClaw/node/
WIN_NODE_VERSION = "20.18.1"
NODE_ZIP_NAME = f"node-v{WIN_NODE_VERSION}-win-x64.zip"
NODE_DIST_URL = (
    "https://nodejs.org/dist/"
    f"v{WIN_NODE_VERSION}/{NODE_ZIP_NAME}"
)


def _pnpm_executable() -> str:
    # Prefer .cmd on Windows so subprocess does not need PowerShell for .ps1 shims.
    for name in ("pnpm.cmd", "pnpm"):
        p = shutil.which(name)
        if p:
            return p
    print(
        "ERROR: pnpm not found in PATH. Install Node.js + pnpm, or use "
        "--skip-console after building console and syncing to src/xclaw/console.",
    )
    sys.exit(1)


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 统一产物目录（与 xclaw.spec 保持一致）
DIST_DIR = os.path.join(ROOT, "dist", "xClaw")
# 本地密钥文件：打包前放入 AK，避免仅依赖「当前 shell 环境变量」（与 supos_ak.env.example 配套）
DEFAULT_SUPOS_AK_FILE = os.path.join(ROOT, "desktop", "supos_ak.env")


def _read_supos_ak_from_copaw_envs_json() -> str:
    """本机开发时 xClaw 持久化在 ~/.xClaw/envs.json 的 SUPOS_AK（未提交仓库）。"""
    path = os.path.join(os.path.expanduser("~"), ".copaw.secret", "envs.json")
    if not os.path.isfile(path):
        return ""
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            data = json.load(f)
        if isinstance(data, dict):
            v = data.get("SUPOS_AK")
            if v is not None:
                return str(v).strip()
    except (OSError, ValueError, TypeError):
        pass
    return ""


def _read_supos_ak_from_file(path: str) -> str:
    """Read SUPOS_AK from a file: KEY=value lines or a single-line token."""
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            text = f.read()
    except OSError:
        return ""
    for line in text.splitlines():
        s = line.strip()
        if not s or s.startswith("#"):
            continue
        if s.upper().startswith("SUPOS_AK="):
            return s.split("=", 1)[1].strip().strip('"').strip("'")
    # No KEY= line: first non-empty line as raw token
    for line in text.splitlines():
        s = line.strip()
        if s and not s.startswith("#"):
            return s
    return ""


def resolve_supos_ak(cli_ak: str, cli_file: str) -> str:
    """Resolve SUPOS_AK: CLI, env, file, desktop/supos_ak.env, ~/.copaw.secret."""
    v = (cli_ak or "").strip()
    if v:
        return v
    v = (os.environ.get("SUPOS_AK") or "").strip()
    if v:
        return v
    path = (cli_file or "").strip() or DEFAULT_SUPOS_AK_FILE
    if path and os.path.isfile(path):
        v = _read_supos_ak_from_file(path).strip()
        if v:
            return v
    return _read_supos_ak_from_copaw_envs_json()


def _sync_console_dist_to_package() -> None:
    """console/dist -> src/xclaw/console（PyInstaller 从包内 xclaw/console 收集静态资源）。"""
    dist_dir = os.path.join(ROOT, "console", "dist")
    target = os.path.join(ROOT, "src", "xclaw", "console")
    if not os.path.isdir(dist_dir):
        print(
            f"ERROR: {dist_dir} not found. Run: pnpm --dir console install && pnpm --dir console build"
        )
        sys.exit(1)
    # Prefer a clean replace, but on Windows this can fail when files are
    # temporarily locked by dev tools/indexers. Fall back to in-place overwrite.
    if os.path.isdir(target):
        try:
            shutil.rmtree(target)
        except OSError as e:
            print(
                f"==> WARN: failed to remove {target}, fallback to overwrite copy: {e}",
            )
            shutil.copytree(dist_dir, target, dirs_exist_ok=True)
            print("==> Synced console/dist -> src/xclaw/console (overwrite)")
            return
    shutil.copytree(dist_dir, target)
    print("==> Synced console/dist -> src/xclaw/console")


def _run_console_build() -> None:
    print("==> Building console (pnpm)...")
    pnpm = _pnpm_executable()
    r = subprocess.run(
        [pnpm, "install"],
        cwd=os.path.join(ROOT, "console"),
    )
    if r.returncode != 0:
        print("ERROR: pnpm install in console/ failed")
        sys.exit(1)
    r = subprocess.run(
        [pnpm, "run", "build"],
        cwd=os.path.join(ROOT, "console"),
    )
    if r.returncode != 0:
        print("ERROR: pnpm run build in console/ failed")
        sys.exit(1)
    _sync_console_dist_to_package()


def _write_env_file(supos_ak: str) -> None:
    """Write encrypted SUPOS_AK into dist/xClaw/xclaw.env (SUPOS_AK_ENC)."""
    from xclaw.security.bundled_env import write_bundled_env_file

    env_path = os.path.join(DIST_DIR, "xclaw.env")
    write_bundled_env_file(env_path, supos_ak)
    if (supos_ak or "").strip():
        print(f"==> Wrote xclaw.env -> {DIST_DIR}")


def _download_file(url: str, dest_path: str) -> None:
    """Download URL to dest_path (streaming, for large Node zip)."""
    try:
        from urllib.request import urlopen
    except ImportError:
        urlopen = None  # pragma: no cover
    if urlopen is None:
        raise RuntimeError("urllib not available")
    os.makedirs(os.path.dirname(dest_path) or ".", exist_ok=True)
    with urlopen(url) as resp, open(dest_path, "wb") as out:
        chunk = resp.read(256 * 1024)
        while chunk:
            out.write(chunk)
            chunk = resp.read(256 * 1024)


def _bundle_portable_node_windows(dist_dir: str, skip: bool) -> None:
    """Extract official Windows x64 Node zip to dist_dir/node/ (node.exe there)."""
    if skip:
        print("==> Skipping portable Node bundle (--skip-node-bundle)")
        return
    if sys.platform != "win32":
        print(
            "==> Skipping portable Node bundle (auto only on Windows; "
            "on macOS/Linux copy node/ next to the exe yourself).",
        )
        return

    dest = os.path.join(dist_dir, "node")
    node_exe = os.path.join(dest, "node.exe")
    if os.path.isfile(node_exe):
        print(f"==> Portable Node already present: {node_exe}")
        return

    cache_dir = os.path.join(ROOT, "desktop", "cache")
    cache_zip = os.path.join(cache_dir, NODE_ZIP_NAME)
    manual_zip = os.path.join(ROOT, "desktop", NODE_ZIP_NAME)

    zip_path = None
    if os.path.isfile(manual_zip):
        zip_path = manual_zip
        print(f"==> Using manual Node zip: {manual_zip}")
    elif os.path.isfile(cache_zip):
        zip_path = cache_zip
        print(f"==> Using cached Node zip: {cache_zip}")
    else:
        print(
            f"==> Downloading portable Node {WIN_NODE_VERSION} ...", flush=True
        )
        os.makedirs(cache_dir, exist_ok=True)
        try:
            _download_file(NODE_DIST_URL, cache_zip)
        except Exception as e:
            zip_hint = (
                f"desktop/{NODE_ZIP_NAME} or desktop/cache/{NODE_ZIP_NAME}"
            )
            print(
                "ERROR: Could not download Node.js portable zip.\n"
                f"  {e}\n"
                f"  Download manually: {NODE_DIST_URL}\n"
                f"  Save as: {zip_hint}\n"
                "  Or use --skip-node-bundle and copy dist/xClaw/node/ yourself.",
            )
            sys.exit(1)
        zip_path = cache_zip

    try:
        with tempfile.TemporaryDirectory() as tmp:
            with zipfile.ZipFile(zip_path, "r") as zf:
                zf.extractall(tmp)
            entries = [x for x in os.listdir(tmp) if not x.startswith(".")]
            if len(entries) != 1:
                print(f"ERROR: Unexpected Node zip layout: {entries!r}")
                sys.exit(1)
            inner = os.path.join(tmp, entries[0])
            if os.path.isdir(dest):
                shutil.rmtree(dest)
            shutil.copytree(inner, dest)
    except (OSError, zipfile.BadZipFile) as e:
        print(f"ERROR: Failed to extract Node zip: {e}")
        sys.exit(1)

    if not os.path.isfile(node_exe):
        print(f"ERROR: node.exe missing after extract: {node_exe}")
        sys.exit(1)
    print(f"==> Bundled portable Node -> {dest}")


def _find_makensis() -> str:
    """Locate makensis.exe. PATH first, then common install dirs."""
    p = shutil.which("makensis")
    if p:
        return p
    for candidate in (
        r"C:\Program Files (x86)\NSIS\makensis.exe",
        r"C:\Program Files\NSIS\makensis.exe",
    ):
        if os.path.isfile(candidate):
            return candidate
    return ""


def _read_xclaw_version() -> str:
    """Parse __version__ from src/xclaw/__version__.py. Returns '' on failure."""
    version_file = os.path.join(ROOT, "src", "xclaw", "__version__.py")
    try:
        with open(version_file, "r", encoding="utf-8") as f:
            text = f.read()
    except OSError:
        return ""
    import re
    m = re.search(r'__version__\s*=\s*"([^"]+)"', text)
    return m.group(1) if m else ""


def _build_nsis_installer(skip: bool) -> None:
    """Pack dist/xClaw/ into a single NSIS installer (LZMA solid compression)."""
    if skip:
        print("==> Skipping NSIS installer (--skip-installer)")
        return
    if sys.platform != "win32":
        print("==> Skipping NSIS installer (Windows only)")
        return
    if not os.path.isdir(DIST_DIR):
        print(f"==> Skipping NSIS installer: {DIST_DIR} not found")
        return

    makensis = _find_makensis()
    if not makensis:
        print(
            "==> WARN: makensis not found; skipping installer build.\n"
            "    Install NSIS (https://nsis.sourceforge.io) or: winget install NSIS.NSIS\n"
            "    Or pass --skip-installer to suppress this warning.",
        )
        return

    nsi_path = os.path.join(ROOT, "desktop", "xclaw.nsi")
    if not os.path.isfile(nsi_path):
        print(f"==> WARN: {nsi_path} missing; skipping installer")
        return

    # PyInstaller puts datas marked "." under _internal/; NSIS needs icon at
    # dist/xClaw/icon.ico (referenced by the .nsi MUI_ICON macro).
    icon_src = os.path.join(ROOT, "desktop", "icon.ico")
    icon_dst = os.path.join(DIST_DIR, "icon.ico")
    if os.path.isfile(icon_src) and not os.path.isfile(icon_dst):
        shutil.copy2(icon_src, icon_dst)
        print(f"==> Copied icon.ico -> {DIST_DIR} (for installer/shortcut)")

    version = _read_xclaw_version() or "0.0.0"
    out_exe = os.path.join(ROOT, "dist", f"xClaw-Setup-{version}.exe")
    # 老产物先删，避免被 NSIS 误认为在用
    if os.path.isfile(out_exe):
        try:
            os.remove(out_exe)
        except OSError:
            pass

    print(f"==> Building NSIS installer (lzma solid)... -> {out_exe}")
    cmd = [
        makensis,
        f"/DXCLAW_VERSION={version}",
        f"/DUNPACKED={DIST_DIR}",
        f"/DOUTPUT_EXE={out_exe}",
        nsi_path,
    ]
    # NSIS 自带彩色日志；压缩阶段可能沉默几分钟，这是正常的
    r = subprocess.run(cmd, cwd=ROOT)
    if r.returncode != 0:
        print(f"ERROR: makensis failed with exit code {r.returncode}")
        sys.exit(1)
    if not os.path.isfile(out_exe):
        print(f"ERROR: NSIS did not produce {out_exe}")
        sys.exit(1)
    size_mb = os.path.getsize(out_exe) / 1024 / 1024
    print(f"==> Installer built: {out_exe} ({size_mb:.1f} MB)")


def _purge_dist_user_data() -> None:
    """Ensure no developer machine data is shipped in dist/xClaw.

    Normally user data lives under WORKING_DIR (~/.copaw). However during local
    testing it's possible to point working dir into the dist folder, or drop
    workspace files next to the exe. This removes common persisted artifacts.
    """
    if not os.path.isdir(DIST_DIR):
        return
    candidates = [
        os.path.join(DIST_DIR, "sessions"),
        os.path.join(DIST_DIR, "memory"),
        os.path.join(DIST_DIR, "chats.json"),
        os.path.join(DIST_DIR, "jobs.json"),
        os.path.join(DIST_DIR, "config.json"),
        os.path.join(DIST_DIR, "supos_token.json"),
        os.path.join(DIST_DIR, "supos_config.json"),
        os.path.join(DIST_DIR, "token_usage.json"),
    ]
    removed = 0
    for p in candidates:
        if os.path.isdir(p):
            shutil.rmtree(p, ignore_errors=True)
            removed += 1
        elif os.path.isfile(p):
            try:
                os.remove(p)
                removed += 1
            except OSError:
                pass
    if removed:
        print(f"==> Purged {removed} persisted data paths from dist/xClaw/")


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="Build xClaw executable; bundles SUPOS_AK via xclaw.env next to exe.",
    )
    parser.add_argument(
        "--supos-ak",
        default="",
        help="supOS API Key (overrides env and file)",
    )
    parser.add_argument(
        "--supos-ak-file",
        default="",
        help=f"Path to env file (default: {DEFAULT_SUPOS_AK_FILE})",
    )
    parser.add_argument(
        "--allow-missing-supos-ak",
        action="store_true",
        help="Do not fail if SUPOS_AK is missing (no xclaw.env)",
    )
    parser.add_argument(
        "--skip-console",
        action="store_true",
        help="Skip pnpm build and skip syncing console/dist -> src/xclaw/console",
    )
    parser.add_argument(
        "--skip-node-bundle",
        action="store_true",
        help="Do not download/extract portable Node into dist/xClaw/node/",
    )
    parser.add_argument(
        "--skip-installer",
        action="store_true",
        help="Do not build NSIS installer at dist/xClaw-Setup-<version>.exe",
    )
    parser.add_argument(
        "--no-clean",
        action="store_true",
        help="Omit PyInstaller --clean for faster incremental rebuilds (default: full clean).",
    )
    parser.add_argument(
        "--fast",
        action="store_true",
        help=(
            "Dev shortcut: enables --no-clean, --skip-console, --skip-node-bundle "
            "(console must already be built and synced to src/xclaw/console)."
        ),
    )
    args = parser.parse_args()

    if args.fast:
        args.no_clean = True
        args.skip_console = True
        args.skip_node_bundle = True
        print(
            "==> Fast mode: --no-clean --skip-console --skip-node-bundle",
            flush=True,
        )

    supos_ak = resolve_supos_ak(args.supos_ak, args.supos_ak_file)
    if not supos_ak and not args.allow_missing_supos_ak:
        print(
            "ERROR: SUPOS_AK is required for a distributable build.\n"
            "  Set env SUPOS_AK, or: python desktop/build.py --supos-ak YOUR_KEY\n"
            "  Or create desktop/supos_ak.env (see desktop/supos_ak.env.example)\n"
            "  Or save SUPOS_AK in xClaw settings so ~/.xClaw/envs.json exists\n"
            "  Or pass: --allow-missing-supos-ak  (dev only; exe will not have bundled AK)",
        )
        sys.exit(1)

    if not args.skip_console:
        _run_console_build()
    else:
        print("==> Skipping console build (--skip-console)", flush=True)

    # 1. 运行 PyInstaller（默认 --clean 全量；--no-clean 便于迭代加速）
    print("==> Running PyInstaller...", flush=True)
    pyinstaller_cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "desktop/xclaw.spec",
        "--noconfirm",
    ]
    if not args.no_clean:
        pyinstaller_cmd.append("--clean")
    else:
        print("==> PyInstaller incremental (no --clean)", flush=True)
    result = subprocess.run(pyinstaller_cmd, cwd=ROOT)
    if result.returncode != 0:
        print("ERROR: PyInstaller failed")
        sys.exit(1)

    # 2. 把关键 DLL 复制到 EXE 同级
    # python313.dll 依赖 MSVCP140/VCRUNTIME140，这些都必须在 EXE 同级才能被 Windows 加载器找到
    py_dir = os.path.dirname(sys.executable)
    internal_dir = os.path.join(DIST_DIR, "_internal")
    dlls_to_hoist = [
        f"python{sys.version_info.major}{sys.version_info.minor}.dll",
        f"python{sys.version_info.major}.dll",
        "MSVCP140.dll",
        "VCRUNTIME140.dll",
        "VCRUNTIME140_1.dll",
    ]
    for dll in dlls_to_hoist:
        # 优先从 Python 安装目录复制，其次从 _internal
        src = os.path.join(py_dir, dll)
        if not os.path.exists(src):
            src = os.path.join(internal_dir, dll)
        dst = os.path.join(DIST_DIR, dll)
        if os.path.exists(src):
            shutil.copy2(src, dst)
            print(f"==> Copied {dll} -> dist/xClaw/")

    # 3. 写入随包分发的密钥（与 xClaw.exe 同级，安装时整目录复制即可）
    if supos_ak:
        _write_env_file(supos_ak)
    else:
        print(
            "==> WARN: SUPOS_AK missing; xclaw.env not written (--allow-missing-supos-ak)."
        )

    # 3b. 便携 Node（与 exe 同级 node/），技能里可直接使用 node/npm 而无需用户安装
    _bundle_portable_node_windows(DIST_DIR, args.skip_node_bundle)

    # 4. 打包前清理 dist 里的用户数据（避免把开发机记录带进安装包）
    _purge_dist_user_data()

    # 5. 用 NSIS 把整个 dist/xClaw/ 压成单 exe 安装器（LZMA solid 压缩）
    _build_nsis_installer(args.skip_installer)

    print(f"\n==> Build complete: {DIST_DIR}")
    print(f"    EXE: {os.path.join(DIST_DIR, 'xClaw.exe')}")
    version = _read_xclaw_version() or "0.0.0"
    installer = os.path.join(ROOT, "dist", f"xClaw-Setup-{version}.exe")
    if os.path.isfile(installer):
        size_mb = os.path.getsize(installer) / 1024 / 1024
        print(f"    Installer: {installer} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()
