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
    os.environ.setdefault(
        "COPAW_STATIC_DIR", os.path.join(BASE_DIR, "copaw", "console")
    )
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
    tray = pystray.Icon("xclaw_desktop", image, "supOS X 个人助手", menu)
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
        title="supOS X 个人助手",
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
                "<h2 style='text-align:center;margin-top:40vh;font-family:sans-serif;color:#c00'>"
                "后端启动失败，请检查日志</h2>",
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
