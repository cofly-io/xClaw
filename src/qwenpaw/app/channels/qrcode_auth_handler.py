# -*- coding: utf-8 -*-
"""Shim: delegate to ``xclaw.app.channels.qrcode_auth_handler``."""

from importlib import import_module

_mod = import_module("xclaw.app.channels.qrcode_auth_handler")

FeishuQRCodeAuthHandler = _mod.FeishuQRCodeAuthHandler
QRCodeAuthHandler = _mod.QRCodeAuthHandler
QRCODE_AUTH_HANDLERS = _mod.QRCODE_AUTH_HANDLERS

__all__ = [
    "FeishuQRCodeAuthHandler",
    "QRCodeAuthHandler",
    "QRCODE_AUTH_HANDLERS",
]
