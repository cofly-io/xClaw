# -*- mode: python ; coding: utf-8 -*-
"""PyInstaller spec for supOS X 个人助手

构建命令（在项目根目录执行）：
  python -m PyInstaller desktop/suposx.spec --clean --noconfirm
"""
import os

block_cipher = None
ROOT = os.path.dirname(os.path.abspath(SPECPATH))

import copaw
copaw_pkg = os.path.dirname(copaw.__file__)

import reme
reme_pkg = os.path.dirname(reme.__file__)

# ─── 收集数据文件 ───
datas = []

# copaw 数据
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

# 包 metadata（fastmcp 等需要 importlib.metadata 查版本）
from PyInstaller.utils.hooks import copy_metadata
for pkg_name in ["fastmcp", "agentscope", "agentscope_runtime", "reme-ai", "copaw"]:
    try:
        datas += copy_metadata(pkg_name)
    except Exception:
        pass

# ─── Analysis ───
a = Analysis(
    [os.path.join(ROOT, "desktop", "main.py")],
    pathex=[],
    binaries=[],
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
        # webview
        "webview",
        # copaw channels（动态 importlib.import_module）
        "copaw.app.channels.console",
        "copaw.app.channels.console.channel",
        "copaw.app.channels.dingtalk",
        "copaw.app.channels.discord_",
        "copaw.app.channels.feishu",
        "copaw.app.channels.imessage",
        "copaw.app.channels.qq",
        "copaw.app.channels.telegram",
        "copaw.app.channels.voice",
    ],
    hookspath=[],
    runtime_hooks=[os.path.join(ROOT, "desktop", "hook-block-sandbox.py")],
    excludes=[
        "tkinter", "matplotlib", "scipy", "IPython",
        "jupyter", "notebook", "pytest", "sphinx",
        "agentscope_runtime.sandbox",
    ],
    noarchive=False,
    cipher=block_cipher,
)

pyz = PYZ(a.pure, cipher=block_cipher)

exe = EXE(
    pyz, a.scripts, [],
    exclude_binaries=True,
    name="supOS X",
    debug=False,
    strip=False,
    upx=True,
    console=False,          # 不弹 cmd 窗口
    icon=os.path.join(ROOT, "desktop", "icon.ico"),
)

coll = COLLECT(
    exe, a.binaries, a.datas,
    strip=False, upx=True, upx_exclude=[],
    name="supOS X",
)
