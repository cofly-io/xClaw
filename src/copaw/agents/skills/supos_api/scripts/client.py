# -*- coding: utf-8 -*-
"""supOS API 通用调用脚本

Usage:
    python client.py get /os/open-api/auth/v1/users
    python client.py post /os/open-api/uns/v2/instance/condition/tree '{"parentId":"0","pageSize":100}'
    python client.py put /os/open-api/auth/v1/users/123 '{"name":"new_name"}'
    python client.py delete /os/open-api/auth/v1/users/123

Examples:
    # 查询用户列表
    python client.py get /os/open-api/auth/v1/users

    # 查询 UNS 树结构
    python client.py post /os/open-api/uns/v2/instance/condition/tree '{"parentId":"0","pageSize":100}'

    # 查询部门人员
    python client.py get /os/open-api/org/v1/departments/1/members
"""

import argparse
import json
import os
import sys
import requests


def get_supos_url() -> str:
    """从 xClaw 获取 supOS 平台地址"""
    try:
        cfg = requests.get("http://127.0.0.1:8088/api/supos/config", timeout=3).json()
        url = cfg.get("supos_url", "").rstrip("/")
        if not url:
            raise RuntimeError("未配置 supOS 平台地址，请在设置页面配置")
        return url
    except Exception as e:
        raise RuntimeError(f"获取 supOS 平台地址失败: {e}")


def get_headers() -> dict:
    """获取认证 headers"""
    ak = os.environ.get("SUPOS_AK", "")
    print(f"[DEBUG client.py] SUPOS_AK from env = '{ak}'")
    if not ak:
        raise RuntimeError("未找到 SUPOS_AK 环境变量")
    return {"Authorization": f"Bearer {ak}"}


def api_call(method: str, path: str, data: dict = None) -> dict:
    """通用 API 调用"""
    url = f"{get_supos_url()}{path}"
    headers = get_headers()

    methods = {
        "get": lambda: requests.get(url, headers=headers, params=data, timeout=10, verify=False),
        "post": lambda: requests.post(url, headers=headers, json=data, timeout=10, verify=False),
        "put": lambda: requests.put(url, headers=headers, json=data, timeout=10, verify=False),
        "delete": lambda: requests.delete(url, headers=headers, timeout=10, verify=False),
    }

    if method.lower() not in methods:
        raise ValueError(f"不支持的请求方法: {method}，支持: get, post, put, delete")

    r = methods[method.lower()]()

    # 处理错误响应
    if r.status_code == 401:
        raise RuntimeError("认证失败：SUPOS_AK 无效或已过期")
    elif r.status_code == 400:
        try:
            err = r.json()
            raise RuntimeError(f"参数错误: {err.get('message', r.text[:200])}")
        except Exception:
            raise RuntimeError(f"参数错误: {r.text[:200]}")
    elif r.status_code == 502:
        raise RuntimeError("无法连接 supOS 平台，请检查平台地址和网络")
    elif r.status_code not in (200, 204):
        raise RuntimeError(f"请求失败 {r.status_code}: {r.text[:300]}")

    return r.json() if r.content else {}


def main():
    parser = argparse.ArgumentParser(description="supOS API 通用调用工具")
    parser.add_argument("method", choices=["get", "post", "put", "delete"], help="HTTP 方法")
    parser.add_argument("path", help="API 路径 (如 /os/open-api/auth/v1/users)")
    parser.add_argument("data", nargs="?", default=None, help="请求数据 (JSON 字符串，仅 POST/PUT)")
    args = parser.parse_args()

    try:
        data = None
        if args.data:
            data = json.loads(args.data)

        result = api_call(args.method, args.path, data)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"错误: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
