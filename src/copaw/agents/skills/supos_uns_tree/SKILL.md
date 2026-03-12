---
name: supos_uns_tree
description: "Query supOS UNS (Unified Namespace) tree. Use this skill when the user asks to browse, list, search, or explore the supOS UNS node tree structure."
metadata:
  {
    "copaw":
      {
        "emoji": "🌳",
        "requires": {}
      }
  }
---
# supOS UNS Tree Query Skill

## ONLY ONE WAY TO QUERY — USE THIS EXACT CODE

Do NOT use any other URL. Do NOT call `/api/supos/token`. Do NOT use `accessToken` or `ticket` directly.

```python
import requests, json

def uns(pid="0"):
    r = requests.post("http://127.0.0.1:8088/api/supos/uns/tree",
        json={"parentId": pid, "pageNo": 1, "pageSize": 100, "keyword": "", "searchType": 1},
        timeout=15)
    data = r.json()
    if r.status_code == 401:
        print("请先在 xClaw 界面登录 supOS 平台，然后再试。")
        return
    for n in (data.get("data") or []):
        print(f"{'[folder]' if n.get('hasChildren') else '[point]'} {n['name']}  id={n['id']}  path={n.get('path','')}")

uns("0")
```

To drill into a folder, call `uns("<id>")` with the node's id.
