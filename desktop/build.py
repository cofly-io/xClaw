"""
xClaw 打包脚本。

推荐（随包带上 SUPOS_AK）：
  1. 复制 desktop/supos_ak.env.example 为 desktop/supos_ak.env
  2. 编辑 supos_ak.env，填写一行：SUPOS_AK=你的密钥
  3. 在项目根目录执行：python desktop/build.py

会在 dist/xClaw/ 生成 xclaw.env（与 xClaw.exe 同级），运行时自动加载。
本机若已在 CoPaw 里保存过 AK（~/.copaw.secret/envs.json），打包脚本会自动读取用于写入 xclaw.env。
"""
import json
import os
import shutil
import subprocess
import sys


def _pnpm_executable() -> str:
    # Prefer .cmd on Windows so subprocess does not need PowerShell for .ps1 shims.
    for name in ("pnpm.cmd", "pnpm"):
        p = shutil.which(name)
        if p:
            return p
    print(
        "ERROR: pnpm not found in PATH. Install Node.js + pnpm, or re-run with --skip-console "
        "after manually building console and syncing to src/copaw/console.",
    )
    sys.exit(1)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 统一产物目录（与 xclaw.spec 保持一致）
DIST_DIR = os.path.join(ROOT, "dist", "xClaw")
# 本地密钥文件：打包前放入 AK，避免仅依赖「当前 shell 环境变量」（与 supos_ak.env.example 配套）
DEFAULT_SUPOS_AK_FILE = os.path.join(ROOT, "desktop", "supos_ak.env")


def _read_supos_ak_from_copaw_envs_json() -> str:
    """本机开发时 CoPaw 持久化在 ~/.copaw.secret/envs.json 的 SUPOS_AK（未提交仓库）。"""
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
    """Priority: --supos-ak > env SUPOS_AK > --supos-ak-file > desktop/supos_ak.env > ~/.copaw.secret/envs.json"""
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
    """console/dist -> src/copaw/console（PyInstaller 从包内 copaw/console 收集静态资源）。"""
    dist_dir = os.path.join(ROOT, "console", "dist")
    target = os.path.join(ROOT, "src", "copaw", "console")
    if not os.path.isdir(dist_dir):
        print(f"ERROR: {dist_dir} not found. Run: pnpm --dir console install && pnpm --dir console build")
        sys.exit(1)
    if os.path.isdir(target):
        shutil.rmtree(target)
    shutil.copytree(dist_dir, target)
    print(f"==> Synced console/dist -> src/copaw/console")


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
    """Write SUPOS_AK into dist/xClaw/xclaw.env; exe 同级加载，供运行时 os.environ。"""
    env_path = os.path.join(DIST_DIR, "xclaw.env")
    v = (supos_ak or "").replace("\r", "").replace("\n", "").strip()
    if not v:
        return
    with open(env_path, "w", encoding="utf-8") as f:
        f.write(f"SUPOS_AK={v}\n")
    print(f"==> Wrote xclaw.env -> {DIST_DIR} (SUPOS_AK length={len(v)})")

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
        help="Skip pnpm build and skip syncing console/dist -> src/copaw/console",
    )
    args = parser.parse_args()

    supos_ak = resolve_supos_ak(args.supos_ak, args.supos_ak_file)
    if not supos_ak and not args.allow_missing_supos_ak:
        print(
            "ERROR: SUPOS_AK is required for a distributable build.\n"
            "  Set env SUPOS_AK, or: python desktop/build.py --supos-ak YOUR_KEY\n"
            "  Or create desktop/supos_ak.env (see desktop/supos_ak.env.example)\n"
            "  Or save SUPOS_AK in CoPaw settings so ~/.copaw.secret/envs.json exists\n"
            "  Or pass: --allow-missing-supos-ak  (dev only; exe will not have bundled AK)",
        )
        sys.exit(1)

    if not args.skip_console:
        _run_console_build()
    else:
        print("==> Skipping console build (--skip-console)", flush=True)

    # 1. 运行 PyInstaller
    print("==> Running PyInstaller...", flush=True)
    result = subprocess.run(
        [sys.executable, "-m", "PyInstaller", "desktop/xclaw.spec", "--clean", "--noconfirm"],
        cwd=ROOT,
    )
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
        print("==> WARN: SUPOS_AK missing; xclaw.env not written (--allow-missing-supos-ak).")

    print(f"\n==> Build complete: {DIST_DIR}")
    print(f"    EXE: {os.path.join(DIST_DIR, 'xClaw.exe')}")

if __name__ == "__main__":
    main()
