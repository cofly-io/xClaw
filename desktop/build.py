"""
supOS X 打包脚本
用法：python desktop/build.py
"""
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_DIR = os.path.join(ROOT, "dist", "supOS X")

def main():
    # 1. 运行 PyInstaller
    print("==> Running PyInstaller...")
    result = subprocess.run(
        [sys.executable, "-m", "PyInstaller", "desktop/suposx.spec", "--clean", "--noconfirm"],
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
            print(f"==> Copied {dll} -> dist/supOS X/")

    print(f"\n==> Build complete: {DIST_DIR}")
    print(f"    EXE: {os.path.join(DIST_DIR, 'supOS X.exe')}")

if __name__ == "__main__":
    main()
