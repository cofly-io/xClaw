# -*- coding: utf-8 -*-
"""Load encrypted secrets from xclaw.env shipped with desktop builds."""
from __future__ import annotations

import os
import sys
from pathlib import Path

from .xclaw_env_crypto import decrypt_from_b64, encrypt_to_b64


def write_bundled_env_file(output_path: str | Path, supos_ak: str) -> None:
    """Write SUPOS_AK_ENC into *output_path* (xclaw.env)."""
    path = Path(output_path)
    v = (supos_ak or "").replace("\r", "").replace("\n", "").strip()
    if not v:
        return
    enc = encrypt_to_b64(v)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f"SUPOS_AK_ENC={enc}\n", encoding="utf-8")


def _apply_env_line(key: str, value: str) -> None:
    if key and value:
        os.environ.setdefault(key, value)


def _decrypt_supos_ak_enc_in_environ() -> None:
    if os.environ.get("SUPOS_AK"):
        return
    enc = (os.environ.get("SUPOS_AK_ENC") or "").strip()
    if not enc:
        return
    try:
        ak = decrypt_from_b64(enc).strip()
        if ak:
            os.environ["SUPOS_AK"] = ak
    except Exception:
        pass


def _load_env_file(path: Path) -> bool:
    if not path.is_file():
        return False
    try:
        text = path.read_text(encoding="utf-8-sig")
    except OSError:
        return False
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        _apply_env_line(key.strip(), value.strip().strip('"').strip("'"))
    _decrypt_supos_ak_enc_in_environ()
    return True


def bundled_env_candidates() -> list[Path]:
    """Paths to try for a shipped xclaw.env (first match wins)."""
    paths: list[Path] = []
    explicit = (os.environ.get("QWENPAW_BUNDLED_ENV_FILE") or "").strip()
    if explicit:
        paths.append(Path(explicit))
    if getattr(sys, "frozen", False):
        paths.append(Path(sys.executable).resolve().parent / "xclaw.env")
    return paths


def load_bundled_env_into_environ() -> bool:
    """Load xclaw.env next to the desktop binary, if present."""
    for path in bundled_env_candidates():
        if _load_env_file(path):
            return True
    return False
