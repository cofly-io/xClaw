# -*- coding: utf-8 -*-
"""supOS X 个人助手 - 桌面入口

使用 PyWebView 作为桌面壳，内嵌 CoPaw 后端。
"""
import multiprocessing
import os
import socket
import sys
import threading
import time

from copaw.security.xclaw_env_crypto import decrypt_from_b64

def _load_bundled_env() -> None:
    """Load env vars from xclaw.env next to the exe (Windows)."""
    if not getattr(sys, "frozen", False):
        return

    exe_dir = os.path.dirname(sys.executable)
    env_path = os.path.join(exe_dir, "xclaw.env")
    if not os.path.exists(env_path):
        return

    try:
        with open(env_path, "r", encoding="utf-8-sig") as f:
            for raw in f.read().splitlines():
                line = raw.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k and v:
                    os.environ.setdefault(k, v)
    except OSError:
        return

    # Back-compat and safety: decrypt bundled SUPOS_AK_ENC into SUPOS_AK
    # at runtime, so the env file does not contain plaintext.
    if not os.environ.get("SUPOS_AK"):
        enc = (os.environ.get("SUPOS_AK_ENC") or "").strip()
        if enc:
            try:
                os.environ["SUPOS_AK"] = decrypt_from_b64(enc).strip()
            except Exception:
                # Leave SUPOS_AK unset; downstream will show a clear error.
                pass

# ---------------------------------------------------------------------------
# PyInstaller 兼容：确保打包后能找到资源
# ---------------------------------------------------------------------------
if getattr(sys, "frozen", False):
    BASE_DIR = sys._MEIPASS
    _load_bundled_env()
    os.environ.setdefault("COPAW_STATIC_DIR", os.path.join(BASE_DIR, "copaw", "console"))
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------------------
# 加载页 HTML — 后端就绪前显示，避免黑屏
# ---------------------------------------------------------------------------
LOADING_HTML = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #0d1117;
    font-family: -apple-system, 'Segoe UI', sans-serif;
    color: #c9d1d9;
  }
  .logo { font-size: 32px; font-weight: 700; color: #1864ff; letter-spacing: 2px; margin-bottom: 8px; }
  .sub  { font-size: 13px; color: #8b949e; margin-bottom: 40px; }
  .spinner {
    width: 36px; height: 36px;
    border: 3px solid #21262d;
    border-top-color: #1864ff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  .tip { margin-top: 20px; font-size: 12px; color: #484f58; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>
  <div class="logo">supOS X</div>
  <div class="sub">个人助手</div>
  <div class="spinner"></div>
  <div class="tip">正在启动服务，请稍候…</div>
</body>
</html>"""


def find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def wait_for_backend(port: int, timeout: int = 60) -> bool:
    start = time.time()
    while time.time() - start < timeout:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=1):
                return True
        except OSError:
            time.sleep(0.1)  # 缩短轮询间隔，后端一好立刻跳转
    return False


def start_backend(port: int) -> None:
    import uvicorn
    from copaw.app._app import app

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=port,
        log_level="warning",   # 减少日志输出，略微提速
        timeout_keep_alive=30,
    )


def main() -> None:
    port = find_free_port()

    # ── 1. 后端线程尽早启动，与 webview 初始化并行 ──
    backend_thread = threading.Thread(target=start_backend, args=(port,), daemon=True)
    backend_thread.start()

    # ── 2. 导入 webview（耗时，与后端并行）──
    import webview

    # ── 3. 立即显示加载页，用户不会看到黑屏 ──
    window = webview.create_window(
        title="supOS X 个人助手",
        html=LOADING_HTML,          # 先显示本地加载页
        width=1280,
        height=800,
        min_size=(900, 600),
        text_select=True,
    )

    def on_backend_ready():
        """后端就绪后在后台线程跳转到真实 URL"""
        if wait_for_backend(port, timeout=60):
            window.load_url(f"http://127.0.0.1:{port}")
        else:
            window.load_html(
                "<h2 style='text-align:center;margin-top:40vh;font-family:sans-serif;color:#c00'>"
                "后端启动失败，请检查日志</h2>"
            )

    # ── 4. 用独立线程等待后端，不阻塞 GUI ──
    threading.Thread(target=on_backend_ready, daemon=True).start()

    webview.start(debug=False)


if __name__ == "__main__":
    multiprocessing.freeze_support()
    main()
