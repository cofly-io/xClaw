# -*- mode: python ; coding: utf-8 -*-
"""PyInstaller spec for supOS X 个人助手

构建命令（在项目根目录执行）：
  python desktop/build.py
  或：python -m PyInstaller desktop/xclaw.spec --clean --noconfirm
"""
import os
import subprocess
import sys

block_cipher = None
ROOT = os.path.dirname(os.path.abspath(SPECPATH))
DESKTOP_DIR = os.path.join(ROOT, "desktop")

# 用 subprocess 获取包路径，避免 import 触发副作用（pygame/litellm 等）
# 兼容 namespace package（__file__ 为 None），此时取 __path__[0]
def _get_pkg_dir(pkg_name):
    code = (
        f"import {pkg_name}, os\n"
        f"f = getattr({pkg_name}, '__file__', None)\n"
        f"if f:\n"
        f"    print(os.path.dirname(f))\n"
        f"else:\n"
        f"    paths = list(getattr({pkg_name}, '__path__', []))\n"
        f"    print(paths[0] if paths else '')\n"
    )
    result = subprocess.run(
        [sys.executable, "-c", code],
        capture_output=True, text=True
    )
    return result.stdout.strip()

copaw_pkg = _get_pkg_dir("copaw")
reme_pkg = _get_pkg_dir("reme")

# ─── 收集数据文件 ───
datas = []

# copaw 数据
if not copaw_pkg or not os.path.isabs(copaw_pkg):
    raise SystemExit(
        f"ERROR: cannot resolve 'copaw' package directory (got {copaw_pkg!r}). "
        "Make sure 'copaw' is importable in the current Python environment."
    )
for subpath, target in [
    ("console", os.path.join("copaw", "console")),
    (os.path.join("agents", "skills"), os.path.join("copaw", "agents", "skills")),
    ("tokenizer", os.path.join("copaw", "tokenizer")),
    (os.path.join("agents", "md_files"), os.path.join("copaw", "agents", "md_files")),
]:
    full = os.path.join(copaw_pkg, subpath)
    if os.path.exists(full):
        datas.append((full, target))

# reme 配置文件（copaw.yaml 等）
reme_config_dir = os.path.join(reme_pkg, "config")
if os.path.isdir(reme_config_dir):
    datas.append((reme_config_dir, os.path.join("reme", "config")))

# 托盘图标（与 EXE 图标同源，供 pystray 加载）
_icon = os.path.join(DESKTOP_DIR, "icon.ico")
if os.path.isfile(_icon):
    datas.append((_icon, "."))

# 包 metadata（fastmcp 等需要 importlib.metadata 查版本）
from PyInstaller.utils.hooks import copy_metadata
for pkg_name in ["fastmcp", "agentscope", "agentscope_runtime", "copaw"]:
    try:
        datas += copy_metadata(pkg_name)
    except Exception:
        pass

# ─── Python 运行时 DLL（放到 EXE 同级目录，避免找不到模块）───
import sys as _sys
_py_dir = os.path.dirname(_sys.executable)
_binaries = []
for _dll in [
    f"python{_sys.version_info.major}{_sys.version_info.minor}.dll",
    f"python{_sys.version_info.major}.dll",
]:
    _dll_path = os.path.join(_py_dir, _dll)
    if os.path.exists(_dll_path):
        _binaries.append((_dll_path, "."))  # 放到 EXE 同级，不是 _internal

# ─── Analysis ───
a = Analysis(
    [os.path.join(ROOT, "desktop", "main.py")],
    pathex=[DESKTOP_DIR, ROOT],
    binaries=_binaries,
    datas=datas,
    hiddenimports=[
        # uvicorn
        "uvicorn.logging",
        "uvicorn.loops.auto",
        "uvicorn.protocols.http.auto",
        "uvicorn.protocols.http.h11_impl",
        "uvicorn.protocols.websockets.auto",
        "uvicorn.protocols.websockets.websockets_impl",
        "uvicorn.lifespan.on",
        # webview + tray
        "webview",
        "pystray",
        "pystray._win32",
        "instance_ipc",
        # xclaw channels（动态 importlib.import_module）
        # 仅保留中国大陆使用的 channel，其余（discord/telegram/imessage/matrix/
        # mattermost）不打包，避免引入 discord-py / python-telegram-bot /
        # matrix-nio 等大依赖。如需启用海外 channel，加回 hiddenimports 并
        # 从下方 excludes 移除即可。
        "xclaw.app.channels.console",
        "xclaw.app.channels.console.channel",
        "xclaw.app.channels.dingtalk",
        "xclaw.app.channels.feishu",
        "xclaw.app.channels.mqtt",
        "xclaw.app.channels.qq",
        "xclaw.app.channels.voice",
        "xclaw.app.channels.wecom",
        "xclaw.app.channels.weixin",
        "xclaw.app.channels.xiaoyi",
    ],
    hookspath=[],
    runtime_hooks=[os.path.join(ROOT, "desktop", "hook-block-sandbox.py")],
    excludes=[
        "tkinter", "matplotlib", "scipy", "IPython",
        "jupyter", "notebook", "pytest", "sphinx",
        "agentscope_runtime.sandbox",
        # ─── 非中国大陆 channel：目录与其顶层依赖库一起排除 ───
        "xclaw.app.channels.discord_",
        "xclaw.app.channels.imessage",
        "xclaw.app.channels.telegram",
        "xclaw.app.channels.matrix",
        "xclaw.app.channels.mattermost",
        # 顶层库（防止从别处被间接拉进）
        "discord",          # discord-py
        "telegram",         # python-telegram-bot
        "nio",              # matrix-nio
    ],
    noarchive=False,
    cipher=block_cipher,
)

pyz = PYZ(a.pure, cipher=block_cipher)

exe = EXE(
    pyz, a.scripts, [],
    exclude_binaries=True,
    name="xClaw",
    debug=False,
    strip=False,
    upx=True,
    console=False,          # 不弹 cmd 窗口
    icon=os.path.join(ROOT, "desktop", "icon.ico"),
)

coll = COLLECT(
    exe, a.binaries, a.datas,
    strip=False, upx=True, upx_exclude=[],
    name="xClaw",
)

# ─── Post-build：把 Python DLL 复制到 EXE 同级 ───────────────────────────────
import shutil as _shutil
_dist_dir = os.path.join(ROOT, "dist", "xClaw")
_internal_dir = os.path.join(_dist_dir, "_internal")
for _dll in [
    f"python{_sys.version_info.major}{_sys.version_info.minor}.dll",
    f"python{_sys.version_info.major}.dll",
]:
    _src = os.path.join(_internal_dir, _dll)
    _dst = os.path.join(_dist_dir, _dll)
    if os.path.exists(_src) and not os.path.exists(_dst):
        _shutil.copy2(_src, _dst)
        print(f"[post-build] Copied {_dll} to EXE directory")
