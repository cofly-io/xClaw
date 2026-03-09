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

# ---------------------------------------------------------------------------
# PyInstaller 兼容：确保打包后能找到资源
# ---------------------------------------------------------------------------
if getattr(sys, "frozen", False):
    # 打包后的路径
    BASE_DIR = sys._MEIPASS
    os.environ.setdefault("COPAW_STATIC_DIR", os.path.join(BASE_DIR, "copaw", "console"))
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def find_free_port() -> int:
    """找一个可用端口"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def wait_for_backend(port: int, timeout: int = 60) -> bool:
    """等待后端启动就绪"""
    start = time.time()
    while time.time() - start < timeout:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=1):
                return True
        except OSError:
            time.sleep(0.5)
    return False


def start_backend(port: int) -> None:
    """在子线程中启动 CoPaw FastAPI 后端"""
    import uvicorn
    from copaw.app._app import app  # noqa: E402

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=port,
        log_level="info",
        # 关闭 uvicorn 的信号处理，由主线程管理
        timeout_keep_alive=30,
    )


def main() -> None:
    """主入口"""
    import webview

    port = find_free_port()

    # 后台线程启动后端
    backend_thread = threading.Thread(
        target=start_backend,
        args=(port,),
        daemon=True,
    )
    backend_thread.start()

    # 创建加载窗口
    window = webview.create_window(
        title="supOS X 个人助手",
        url=f"http://127.0.0.1:{port}",
        width=1280,
        height=800,
        min_size=(900, 600),
        text_select=True,
    )

    def on_loaded():
        """窗口加载完成后的回调"""
        pass

    def on_closing():
        """窗口关闭时清理"""
        return True

    window.events.loaded += on_loaded
    window.events.closing += on_closing

    # 等待后端就绪
    if not wait_for_backend(port, timeout=60):
        webview.create_window(
            title="启动失败",
            html="<h2 style='text-align:center;margin-top:40vh;font-family:sans-serif;'>"
                 "后端启动失败，请检查日志</h2>",
            width=400,
            height=300,
        )
        webview.start()
        return

    # 启动 GUI 事件循环
    webview.start(debug=False)


if __name__ == "__main__":
    multiprocessing.freeze_support()
    main()
