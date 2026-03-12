# -*- coding: utf-8 -*-
"""Supos 认证代理接口"""
import base64
import json
import logging
from pathlib import Path
from typing import Optional

import requests
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ...constant import WORKING_DIR

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/supos", tags=["supos"])

# Supos AES 加密配置（固定）
KEY_CONTENT = "tHvYSzHZdz26jbR41CrXHxc8NkAOP70zBVoHCMU7vuQ="
IV_CONTENT = "bX1Um6MPi5yBausow/+yJg=="

# 配置文件路径
_CONFIG_FILE = Path(WORKING_DIR) / "supos_config.json"
_TOKEN_FILE = Path(WORKING_DIR) / "supos_token.json"

# ─── token 文件读写 ───────────────────────────────────────────────────────────

def _write_token(token: str, ticket: str, username: str, supos_url: str) -> None:
    _TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
    _TOKEN_FILE.write_text(
        json.dumps({"token": token, "ticket": ticket, "username": username, "supos_url": supos_url}, ensure_ascii=False),
        encoding="utf-8",
    )

def _read_token() -> dict:
    if _TOKEN_FILE.exists():
        try:
            return json.loads(_TOKEN_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


# ─── 配置读写 ────────────────────────────────────────────────────────────────

def _read_config() -> dict:
    if _CONFIG_FILE.exists():
        try:
            return json.loads(_CONFIG_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def _write_config(data: dict) -> None:
    _CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
    _CONFIG_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def _get_login_url() -> str:
    cfg = _read_config()
    base = cfg.get("supos_url", "").rstrip("/")
    if not base:
        raise HTTPException(status_code=400, detail="supOS 平台地址未配置，请先在设置中填写")
    return f"{base}/os/inter-api/auth/v1/login"


# ─── 加密 ────────────────────────────────────────────────────────────────────

def encrypt_password(password: str) -> str:
    key_bytes = base64.b64decode(KEY_CONTENT)
    iv_bytes = base64.b64decode(IV_CONTENT)
    cipher = Cipher(algorithms.AES(key_bytes), modes.CBC(iv_bytes), backend=default_backend())
    encryptor = cipher.encryptor()
    password_bytes = password.encode("utf-8")
    block_size = 16
    padding_length = block_size - (len(password_bytes) % block_size)
    padded = password_bytes + bytes([padding_length] * padding_length)
    encrypted = encryptor.update(padded) + encryptor.finalize()
    return base64.b64encode(encrypted).decode("utf-8")


# ─── Schemas ─────────────────────────────────────────────────────────────────

class SuposConfig(BaseModel):
    supos_url: str


class SuposLoginRequest(BaseModel):
    username: str
    password: str  # 明文
    force_login: bool = False  # 强制踢出旧会话


class SuposLoginResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None


# ─── 接口 ─────────────────────────────────────────────────────────────────────

@router.get("/token")
def get_supos_token():
    """返回当前登录用户的 token 和 ticket，供 skill 使用"""
    data = _read_token()
    logger.info(f"get_supos_token called, token_len={len(data.get('token', ''))}")
    if not data.get("ticket") and not data.get("token"):
        raise HTTPException(status_code=401, detail="未登录或 token 已过期，请先在 xClaw 界面登录")
    return {
        "token": data.get("token", ""),
        "ticket": data.get("ticket", ""),
        "username": data.get("username", ""),
        "supos_url": data.get("supos_url", ""),
    }


@router.get("/config")
def get_supos_config():
    """获取已保存的 supOS 配置"""
    cfg = _read_config()
    return {"supos_url": cfg.get("supos_url", "")}


@router.post("/config")
def save_supos_config(body: SuposConfig):
    """保存 supOS 平台地址到配置文件"""
    url = body.supos_url.strip().rstrip("/")
    if not url.startswith("http"):
        raise HTTPException(status_code=400, detail="地址格式不正确，需以 http:// 或 https:// 开头")
    cfg = _read_config()
    cfg["supos_url"] = url
    _write_config(cfg)
    logger.info(f"supOS config saved: {url}")
    return {"success": True, "supos_url": url}


@router.post("/login", response_model=SuposLoginResponse)
def supos_login(req: SuposLoginRequest) -> SuposLoginResponse:
    """代理 supOS 登录，自动加密密码"""
    login_url = _get_login_url()
    encrypted_password = encrypt_password(req.password)

    try:
        resp = requests.post(
            login_url,
            json={"username": req.username, "password": encrypted_password, "forceLogin": req.force_login},
            timeout=10,
            verify=False,
        )
        result = resp.json()
        logger.info(f"supOS login status={resp.status_code}")

        # supOS 成功时 code=100000000
        if resp.status_code == 200 and result.get("code") == 100000000:
            outer = result.get("data") or {}
            # accessToken 可能在 outer 直接，也可能在 outer["data"] 里（不同版本结构不同）
            if isinstance(outer, dict):
                token = outer.get("accessToken", "")
                ticket = outer.get("ticket", "")
                if not token:
                    inner = outer.get("data")
                    token = inner.get("accessToken", "") if isinstance(inner, dict) else ""
                    ticket = inner.get("ticket", ticket) if isinstance(inner, dict) else ticket
            else:
                token = ""
                ticket = ""
            cfg = _read_config()
            _write_token(token, ticket, req.username, cfg.get("supos_url", ""))
            logger.info(f"supOS token saved, user={req.username}, token_len={len(token)}, ticket_len={len(ticket)}")

            # needForceLogin=True 表示需要二次确认踢出旧会话
            if isinstance(outer, dict) and outer.get("needForceLogin") and not req.force_login:
                return SuposLoginResponse(
                    success=False,
                    message=f"__FORCE_LOGIN__:{outer.get('kickoutMsg', '登录超出上限，是否踢出最早登录的用户？')}",
                    data=result,
                )

            return SuposLoginResponse(success=True, message="登录成功", data=result)
        else:
            msg = result.get("message") or result.get("msg") or "登录失败"
            return SuposLoginResponse(success=False, message=msg, data=result)

    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=502, detail="无法连接到 supOS 平台，请检查地址是否正确")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="连接 supOS 平台超时")
    except Exception as e:
        logger.error(f"supOS login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── UNS 代理 ─────────────────────────────────────────────────────────────────

class UnsTreeRequest(BaseModel):
    parentId: str = "0"
    pageNo: int = 1
    pageSize: int = 100
    keyword: str = ""
    searchType: int = 1


@router.post("/uns/tree")
def proxy_uns_tree(body: UnsTreeRequest):
    """代理 supOS UNS 树查询，自动附加 ticket 认证"""
    data = _read_token()
    ticket = data.get("ticket", "")
    supos_url = data.get("supos_url", "")
    if not ticket:
        raise HTTPException(status_code=401, detail="未登录或 ticket 已过期，请先在 xClaw 界面登录")
    if not supos_url:
        raise HTTPException(status_code=400, detail="supOS 平台地址未配置")

    url = f"{supos_url.rstrip('/')}/inter-api/supos/uns/condition/tree"
    try:
        resp = requests.post(
            url,
            json=body.model_dump(),
            headers={"Authorization": f"Bearer {ticket}"},
            timeout=10,
            verify=False,
        )
        return resp.json()
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=502, detail="无法连接到 supOS 平台")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="连接 supOS 平台超时")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
