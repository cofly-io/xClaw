#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""测试 Supos 登录接口"""
import base64
import json
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

# Supos 加密配置
KEY_CONTENT = "tHvYSzHZdz26jbR41CrXHxc8NkAOP70zBVoHCMU7vuQ="
IV_CONTENT = "bX1Um6MPi5yBausow/+yJg=="
PASSWORD = "Supos1304!"


def encrypt_password(password: str) -> str:
    """使用 AES/CBC/PKCS7Padding 加密密码"""
    try:
        # 解码 Base64 的 key 和 iv
        key_bytes = base64.b64decode(KEY_CONTENT)
        iv_bytes = base64.b64decode(IV_CONTENT)
        
        print(f"Key length: {len(key_bytes)} bytes")
        print(f"IV length: {len(iv_bytes)} bytes")
        
        # 创建 AES cipher
        cipher = Cipher(
            algorithms.AES(key_bytes),
            modes.CBC(iv_bytes),
            backend=default_backend()
        )
        encryptor = cipher.encryptor()
        
        # 密码转为 UTF-8 字节
        password_bytes = password.encode('utf-8')
        print(f"Password bytes: {password_bytes}")
        print(f"Password length: {len(password_bytes)}")
        
        # PKCS7 padding
        block_size = 16
        padding_length = block_size - (len(password_bytes) % block_size)
        padded_password = password_bytes + bytes([padding_length] * padding_length)
        
        print(f"Padded password length: {len(padded_password)}")
        print(f"Padding length: {padding_length}")
        
        # 加密
        encrypted = encryptor.update(padded_password) + encryptor.finalize()
        
        # Base64 编码
        encrypted_b64 = base64.b64encode(encrypted).decode('utf-8')
        print(f"Encrypted (Base64): {encrypted_b64}")
        
        return encrypted_b64
    except Exception as e:
        print(f"Encryption error: {e}")
        raise


def test_local_encryption():
    """测试本地加密"""
    print("=" * 60)
    print("测试本地加密")
    print("=" * 60)
    
    encrypted = encrypt_password(PASSWORD)
    print(f"\n明文密码: {PASSWORD}")
    print(f"加密后: {encrypted}")
    
    return encrypted


def test_backend_api():
    """测试后端 API"""
    print("\n" + "=" * 60)
    print("测试后端 API")
    print("=" * 60)
    
    import requests
    
    # 调用后端接口
    url = "http://127.0.0.1:8088/api/supos/login"
    payload = {
        "username": "admin",
        "password": PASSWORD  # 发送明文密码，后端会加密
    }
    
    print(f"\nPOST {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"\nStatus: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    # 测试本地加密
    encrypted = test_local_encryption()
    
    # 测试后端 API
    try:
        test_backend_api()
    except ImportError:
        print("\nrequests 库未安装，跳过后端 API 测试")
        print("可以手动测试: curl -X POST http://127.0.0.1:8088/api/supos/login -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"Supos1304!\"}'")
