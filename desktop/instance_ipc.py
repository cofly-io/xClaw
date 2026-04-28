# -*- coding: utf-8 -*-
"""Windows: single-instance mutex + loopback TCP to wake the primary window."""

from __future__ import annotations

import ctypes
import getpass
import hashlib
import json
import os
import secrets
import socket
import threading
import time
from pathlib import Path
from typing import Callable

ERROR_ALREADY_EXISTS = 183


def _mutex_name() -> str:
    user = getpass.getuser().encode("utf-8", errors="replace")
    digest = hashlib.sha256(user).hexdigest()[:20]
    return f"Local\\xClawDesktop_{digest}"


def _ipc_dir() -> Path:
    base = os.environ.get("LOCALAPPDATA") or os.path.expanduser("~")
    d = Path(base) / "xClaw"
    d.mkdir(parents=True, exist_ok=True)
    return d


def ipc_file_path() -> Path:
    return _ipc_dir() / "desktop_ipc.json"


def try_acquire_primary_mutex() -> tuple[bool, int | None]:
    """Return (is_primary, mutex_handle).

    ``is_primary`` is False when another instance already holds the mutex
    (caller should signal that instance and exit). When creation fails but
    the mutex name is free, ``is_primary`` is True and handle may be None
    (degraded mode without singleton protection).
    """
    kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
    CreateMutexW = kernel32.CreateMutexW
    CreateMutexW.argtypes = (
        ctypes.c_void_p,
        ctypes.c_bool,
        ctypes.c_wchar_p,
    )
    CreateMutexW.restype = ctypes.c_void_p

    handle = CreateMutexW(None, False, _mutex_name())
    err = ctypes.get_last_error()
    if err == ERROR_ALREADY_EXISTS:
        if handle:
            kernel32.CloseHandle(handle)
        return False, None
    if not handle:
        return True, None
    return True, int(handle)


def close_mutex(handle: int | None) -> None:
    if not handle:
        return
    kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
    kernel32.CloseHandle.argtypes = (ctypes.c_void_p,)
    kernel32.CloseHandle.restype = ctypes.c_bool
    kernel32.CloseHandle(ctypes.c_void_p(handle))


def _message_box(text: str, title: str = "xClaw") -> None:
    MB_OK = 0x00000000
    u32 = ctypes.WinDLL("user32", use_last_error=True)
    MessageBoxW = u32.MessageBoxW
    MessageBoxW.argtypes = (
        ctypes.c_void_p,
        ctypes.c_wchar_p,
        ctypes.c_wchar_p,
        ctypes.c_uint,
    )
    MessageBoxW.restype = ctypes.c_int
    MessageBoxW(None, text, title, MB_OK)


def signal_show_existing(secret: str, port: int) -> bool:
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=3.0) as s:
            s.sendall(f"SHOW {secret}\n".encode("utf-8"))
            s.recv(16)
        return True
    except OSError:
        return False


def activate_existing_or_notify() -> None:
    """Second instance: wake primary or show an error."""
    path = ipc_file_path()
    deadline = time.monotonic() + 12.0
    while time.monotonic() < deadline:
        if path.is_file():
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                port = int(data["port"])
                secret = str(data["secret"])
                if signal_show_existing(secret, port):
                    return
            except (OSError, ValueError, KeyError, TypeError):
                pass
        time.sleep(0.15)
    _message_box(
        "无法连接到已在后台运行的 xClaw。\n"
        "请在托盘中选择「退出 xClaw」后重新启动，或检查任务管理器中的残留进程。",
        "xClaw",
    )


class ControlServer:
    """Loopback TCP: SHOW <secret>\\n -> invoke on_show (from worker thread)."""

    def __init__(
        self,
        secret: str,
        on_show: Callable[[], None],
    ) -> None:
        self._secret = secret
        self._on_show = on_show
        self._sock: socket.socket | None = None
        self._shutdown = threading.Event()
        self._thread: threading.Thread | None = None

    def start(self) -> int:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind(("127.0.0.1", 0))
        sock.listen(8)
        sock.settimeout(1.0)
        self._sock = sock
        port = int(sock.getsockname()[1])
        self._thread = threading.Thread(target=self._serve, daemon=True)
        self._thread.start()
        return port

    def _serve(self) -> None:
        assert self._sock is not None
        while not self._shutdown.is_set():
            try:
                conn, _ = self._sock.accept()
            except socket.timeout:
                continue
            except OSError:
                break
            try:
                with conn:
                    conn.settimeout(5.0)
                    buf = bytearray()
                    while len(buf) < 256 and b"\n" not in buf:
                        chunk = conn.recv(128)
                        if not chunk:
                            break
                        buf.extend(chunk)
                    line = bytes(buf).decode("utf-8", errors="replace").strip()
                    if line == f"SHOW {self._secret}":
                        try:
                            self._on_show()
                        except Exception:
                            pass
                    try:
                        conn.sendall(b"OK\n")
                    except OSError:
                        pass
            except OSError:
                pass

    def write_ipc_file(self, port: int) -> None:
        path = ipc_file_path()
        payload = {
            "pid": os.getpid(),
            "port": port,
            "secret": self._secret,
        }
        path.write_text(json.dumps(payload), encoding="utf-8")

    def stop(self) -> None:
        self._shutdown.set()
        if self._sock is not None:
            try:
                self._sock.close()
            except OSError:
                pass
            self._sock = None


def remove_ipc_file() -> None:
    path = ipc_file_path()
    try:
        path.unlink(missing_ok=True)
    except OSError:
        pass


def new_ipc_secret() -> str:
    return secrets.token_hex(16)
