# -*- coding: utf-8 -*-
"""xClaw 桌面入口：PyWebView 壳 + 内嵌本地后端。"""
import multiprocessing
import os
import socket
import sys
import threading
import time

try:
    from xclaw.security.xclaw_env_crypto import decrypt_from_b64
except ModuleNotFoundError:
    # Backward compatibility for environments still exposing the old package name.
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
    # New runtime env key; keep old key for compatibility with legacy builds.
    os.environ.setdefault(
        "QWENPAW_CONSOLE_STATIC_DIR", os.path.join(BASE_DIR, "xclaw", "console")
    )
    os.environ.setdefault(
        "COPAW_STATIC_DIR", os.path.join(BASE_DIR, "copaw", "console")
    )
    try:
        from xclaw.runtime_paths import prepend_bundled_node_to_os_path
    except ModuleNotFoundError:
        from copaw.runtime_paths import prepend_bundled_node_to_os_path

    prepend_bundled_node_to_os_path()
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

_DESKTOP_DIR = os.path.dirname(os.path.abspath(__file__))
if _DESKTOP_DIR not in sys.path:
    sys.path.insert(0, _DESKTOP_DIR)

if sys.platform == "win32":
    import instance_ipc  # noqa: E402
else:
    instance_ipc = None  # type: ignore[assignment, misc]

# ---------------------------------------------------------------------------
# 加载页 HTML — 后端就绪前显示，避免黑屏
# ---------------------------------------------------------------------------
LOADING_HTML = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="color-scheme" content="light">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: system-ui, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
    color: #334155;
    background: linear-gradient(165deg, #eef4ff 0%, #f8fafc 42%, #e8f4fc 100%);
  }
  .wrap {
    text-align: center;
    padding: 48px 56px;
    max-width: 420px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.82);
    box-shadow:
      0 1px 2px rgba(15, 23, 42, 0.04),
      0 12px 40px rgba(37, 99, 235, 0.08);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.9);
  }
  .brand {
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    background: linear-gradient(120deg, #1d4ed8 0%, #0ea5e9 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-bottom: 12px;
  }
  .slogan {
    font-size: 0.95rem;
    line-height: 1.55;
    color: #64748b;
    margin-bottom: 32px;
  }
  .loader {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 20px;
  }
  .loader span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3b82f6;
    opacity: 0.35;
    animation: bounce 1.1s ease-in-out infinite;
  }
  .loader span:nth-child(2) { animation-delay: 0.15s; }
  .loader span:nth-child(3) { animation-delay: 0.3s; }
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
    40% { transform: translateY(-10px); opacity: 1; }
  }
  .status {
    font-size: 0.8125rem;
    color: #94a3b8;
  }
</style>
</head>
<body>
  <div class="wrap">
    <div class="brand">xClaw</div>
    <p class="slogan">智在本地，与现场同频</p>
    <div class="loader"><span></span><span></span><span></span></div>
    <p class="status">正在启动本地服务，请稍候…</p>
  </div>
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
    try:
        from xclaw.app._app import app
    except ModuleNotFoundError:
        from copaw.app._app import app

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=port,
        log_level="warning",  # 减少日志输出，略微提速
        timeout_keep_alive=30,
    )


_RUNTIME: dict = {
    "allow_close": False,
    "window": None,
    "tray_icon": None,
    "control_server": None,
    "hide_hint_shown": False,
}


def _use_windows_tray_shell() -> bool:
    if sys.platform != "win32":
        return False
    if instance_ipc is None:
        return False
    v = os.environ.get("XCLAW_DESKTOP_CLASSIC", "").strip().lower()
    return v not in ("1", "true", "yes")


def _tray_icon_candidates() -> list[str]:
    paths: list[str] = []
    if getattr(sys, "frozen", False):
        paths.append(os.path.join(sys._MEIPASS, "icon.ico"))
        paths.append(os.path.join(os.path.dirname(sys.executable), "icon.ico"))
    paths.append(os.path.join(BASE_DIR, "icon.ico"))
    paths.append(os.path.join(_DESKTOP_DIR, "icon.ico"))
    return paths


def _bring_window_forward() -> None:
    w = _RUNTIME.get("window")
    if w is None:
        return
    try:
        w.show()
    except Exception:
        pass


def _quit_desktop() -> None:
    _RUNTIME["allow_close"] = True
    icon = _RUNTIME.get("tray_icon")
    if icon is not None:
        try:
            icon.stop()
        except Exception:
            pass
    w = _RUNTIME.get("window")
    if w is not None:
        try:
            w.destroy()
        except Exception:
            pass


def _start_tray() -> None:
    import pystray
    from PIL import Image

    def load_image():
        for p in _tray_icon_candidates():
            if os.path.isfile(p):
                return Image.open(p)
        return Image.new("RGBA", (32, 32), (24, 100, 255, 255))

    image = load_image().copy()

    def on_show(_icon, _item) -> None:
        _bring_window_forward()

    def on_quit(_icon, _item) -> None:
        _quit_desktop()

    menu = pystray.Menu(
        pystray.MenuItem("打开主窗口", on_show, default=True),
        pystray.MenuItem("退出 xClaw", on_quit),
    )
    tray = pystray.Icon("xclaw_desktop", image, "xClaw", menu)
    _RUNTIME["tray_icon"] = tray
    threading.Thread(target=tray.run, daemon=True).start()


def main() -> None:
    use_shell = _use_windows_tray_shell()
    mutex_handle: int | None = None
    control = None

    if use_shell:
        is_primary, mutex_handle = instance_ipc.try_acquire_primary_mutex()
        if not is_primary:
            instance_ipc.activate_existing_or_notify()
            return

    port = find_free_port()

    # ── 1. 后端线程尽早启动，与 webview 初始化并行 ──
    backend_thread = threading.Thread(
        target=start_backend, args=(port,), daemon=True
    )
    backend_thread.start()

    # ── 2. 导入 webview（耗时，与后端并行）──
    import webview

    # ── 3. 立即显示加载页，用户不会看到黑屏 ──
    window = webview.create_window(
        title="xClaw",
        html=LOADING_HTML,  # 先显示本地加载页
        width=1280,
        height=800,
        min_size=(900, 600),
        text_select=True,
    )
    _RUNTIME["window"] = window

    if use_shell:
        secret = instance_ipc.new_ipc_secret()
        control = instance_ipc.ControlServer(secret, _bring_window_forward)
        ctrl_port = control.start()
        control.write_ipc_file(ctrl_port)
        _RUNTIME["control_server"] = control

        def on_closing() -> bool:
            if _RUNTIME["allow_close"]:
                return True
            try:
                window.hide()
            except Exception:
                pass
            if not _RUNTIME.get("hide_hint_shown"):
                _RUNTIME["hide_hint_shown"] = True
                ic = _RUNTIME.get("tray_icon")
                if ic is not None and hasattr(ic, "notify"):
                    try:
                        ic.notify(
                            "xClaw 在后台运行",
                            "点击托盘图标可重新打开；选择「退出 xClaw」可彻底结束。",
                        )
                    except Exception:
                        pass
            return False

        window.events.closing += on_closing
        _start_tray()

    def on_backend_ready():
        """后端就绪后在后台线程跳转到真实 URL"""
        if wait_for_backend(port, timeout=60):
            window.load_url(f"http://127.0.0.1:{port}")
        else:
            window.load_html(
                "<!DOCTYPE html><html lang='zh-CN'><head><meta charset='utf-8'>"
                "<meta name='color-scheme' content='light'>"
                "<style>body{margin:0;min-height:100vh;display:flex;align-items:center;"
                "justify-content:center;font-family:system-ui,'Segoe UI','Microsoft YaHei',sans-serif;"
                "background:linear-gradient(165deg,#eef4ff,#f8fafc);color:#b91c1c;}"
                ".box{text-align:center;padding:2rem;max-width:360px;}"
                "h2{font-size:1.1rem;font-weight:600;margin:0;}</style></head><body>"
                "<div class='box'><h2>后端启动失败，请检查日志后重试</h2></div></body></html>"
            )

    # ── 4. 用独立线程等待后端，不阻塞 GUI ──
    threading.Thread(target=on_backend_ready, daemon=True).start()

    try:
        webview.start(debug=False)
    finally:
        if use_shell:
            cs = _RUNTIME.get("control_server")
            if cs is not None:
                try:
                    cs.stop()
                except Exception:
                    pass
                _RUNTIME["control_server"] = None
            instance_ipc.remove_ipc_file()
            if mutex_handle is not None:
                instance_ipc.close_mutex(mutex_handle)


if __name__ == "__main__":
    multiprocessing.freeze_support()
    main()
