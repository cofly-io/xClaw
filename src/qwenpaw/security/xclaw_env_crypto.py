#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""xClaw env secret encryption/decryption helpers.

This module is intentionally simple: it provides best-effort encryption for
secrets stored in `xclaw.env` shipped next to the desktop executable.

Security note:
  - The key/iv are embedded in the app, so this is *obfuscation* rather than a
    strong at-rest protection against a determined reverse engineer.
  - It does, however, prevent accidental plaintext leakage in distributed
    bundles, screenshots, or basic string search.
"""

from __future__ import annotations

import base64

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

# Reuse the same fixed AES material currently used by supos auth proxy.
# Keep values base64-encoded so they are ASCII-safe in source control.
_KEY_B64 = "tHvYSzHZdz26jbR41CrXHxc8NkAOP70zBVoHCMU7vuQ="
_IV_B64 = "bX1Um6MPi5yBausow/+yJg=="


def _pkcs7_pad(data: bytes, block_size: int = 16) -> bytes:
    pad_len = block_size - (len(data) % block_size)
    return data + bytes([pad_len] * pad_len)


def _pkcs7_unpad(data: bytes, block_size: int = 16) -> bytes:
    if not data or (len(data) % block_size) != 0:
        raise ValueError("Invalid padded data length")
    pad_len = data[-1]
    if pad_len < 1 or pad_len > block_size:
        raise ValueError("Invalid PKCS7 padding")
    if data[-pad_len:] != bytes([pad_len] * pad_len):
        raise ValueError("Invalid PKCS7 padding bytes")
    return data[:-pad_len]


def encrypt_to_b64(plaintext: str) -> str:
    """Encrypt *plaintext* with AES-CBC and return base64 ciphertext."""
    key = base64.b64decode(_KEY_B64)
    iv = base64.b64decode(_IV_B64)
    cipher = Cipher(
        algorithms.AES(key),
        modes.CBC(iv),
        backend=default_backend(),
    )
    encryptor = cipher.encryptor()
    raw = plaintext.encode("utf-8")
    ct = encryptor.update(_pkcs7_pad(raw)) + encryptor.finalize()
    return base64.b64encode(ct).decode("utf-8")


def decrypt_from_b64(ciphertext_b64: str) -> str:
    """Decrypt base64 ciphertext (AES-CBC) and return UTF-8 plaintext."""
    key = base64.b64decode(_KEY_B64)
    iv = base64.b64decode(_IV_B64)
    cipher = Cipher(
        algorithms.AES(key),
        modes.CBC(iv),
        backend=default_backend(),
    )
    decryptor = cipher.decryptor()
    ct = base64.b64decode(ciphertext_b64)
    padded = decryptor.update(ct) + decryptor.finalize()
    raw = _pkcs7_unpad(padded)
    return raw.decode("utf-8")

