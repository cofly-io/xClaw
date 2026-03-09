# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import copy_metadata

datas = [('D:\\SourceCode\\CoPaw\\src\\copaw\\console', 'copaw\\console'), ('D:\\SourceCode\\CoPaw\\src\\copaw\\agents\\skills', 'copaw\\agents\\skills'), ('D:\\SourceCode\\CoPaw\\src\\copaw\\agents\\md_files', 'copaw\\agents\\md_files')]
datas += copy_metadata('fastmcp')
datas += copy_metadata('agentscope')
datas += copy_metadata('agentscope_runtime')
datas += copy_metadata('reme-ai')
datas += copy_metadata('copaw')


a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=datas,
    hiddenimports=['uvicorn.logging', 'uvicorn.loops.auto', 'uvicorn.protocols.http.auto', 'uvicorn.protocols.http.h11_impl', 'uvicorn.protocols.websockets.auto', 'uvicorn.lifespan.on', 'webview', 'agentscope_runtime', 'agentscope_runtime.engine', 'agentscope_runtime.engine.app', 'agentscope_runtime.engine.runner', 'agentscope_runtime.engine.schemas', 'agentscope_runtime.engine.schemas.agent_schemas', 'agentscope_runtime.engine.helpers', 'agentscope_runtime.engine.helpers.agent_api_builder', 'fastmcp', 'reme'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=['desktop/hook-block-sandbox.py'],
    excludes=['agentscope_runtime.sandbox', 'tkinter', 'matplotlib', 'scipy', 'IPython', 'jupyter', 'pytest'],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='supOS X',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['D:\\SourceCode\\CoPaw\\desktop\\icon.ico'],
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='supOS X',
)
