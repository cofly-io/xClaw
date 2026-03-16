---
name: supos_data
description: "Access supOS platform data via xClaw proxy. Use this skill when the user asks to query, browse, or interact with supOS platform APIs."
metadata:
  {
    "copaw":
      {
        "emoji": "🏭",
        "requires": {}
      }
  }
---
# supOS Platform Access

xClaw acts as a proxy to the supOS platform. The user logs in via the xClaw UI with their supOS credentials. Once logged in, all supOS API calls go through the local xClaw proxy — no direct supOS URL or token handling needed.

## Getting Auth Info

```python
import requests

r = requests.get("http://127.0.0.1:8088/api/supos/token", timeout=5)
if r.status_code == 401:
    print("请先在 xClaw 界面登录 supOS 平台，然后再试。")
else:
    info = r.json()
    ticket = info["ticket"]       # Bearer token for supOS APIs
    supos_url = info["supos_url"] # supOS base URL
```

## Calling supOS APIs via Proxy

For APIs that xClaw proxies (e.g. UNS tree), call the local endpoint directly:

```python
r = requests.post("http://127.0.0.1:8088/api/supos/<endpoint>", json={...}, timeout=15)
if r.status_code == 401:
    print("请先在 xClaw 界面登录 supOS 平台，然后再试。")
```

For APIs not yet proxied, use the ticket directly against supOS:

```python
r = requests.get(
    f"{supos_url}/inter-api/...",
    headers={"Authorization": f"Bearer {ticket}"},
    timeout=15,
    verify=False,
)
```
