---
name: cron
description: 閫氳繃 copaw 鍛戒护绠＄悊瀹氭椂浠诲姟 - 鍒涘缓銆佹煡璇€佹殏鍋溿€佹仮澶嶃€佸垹闄や换鍔?metadata: { "copaw": { "emoji": "鈴? } }
---

# 瀹氭椂浠诲姟绠＄悊

浣跨敤 `copaw cron` 鍛戒护绠＄悊瀹氭椂浠诲姟銆?
## 甯哥敤鍛戒护

```bash
# 鍒楀嚭鎵€鏈変换鍔★紙榛樿鎿嶄綔 default agent锛?copaw cron list

# 涓虹壒瀹?agent 鍒楀嚭浠诲姟
copaw cron list --agent-id abc123

# 鏌ョ湅浠诲姟璇︽儏
copaw cron get <job_id>

# 鏌ョ湅浠诲姟鐘舵€?copaw cron state <job_id>

# 鍒犻櫎浠诲姟
copaw cron delete <job_id>

# 鏆傚仠/鎭㈠浠诲姟
copaw cron pause <job_id>
copaw cron resume <job_id>

# 绔嬪嵆鎵ц涓€娆?copaw cron run <job_id>
```

**娉ㄦ剰**锛氭墍鏈夊懡浠ら兘鏀寔 `--agent-id` 鍙傛暟锛岄粯璁や负 `default`銆傚鏋滈渶瑕佹搷浣滅壒瀹?agent 鐨勪换鍔★紝璇锋寚瀹氬搴旂殑 agent ID銆?
## 鍒涘缓浠诲姟

鏀寔涓ょ浠诲姟绫诲瀷锛?- **text**锛氬畾鏃跺悜棰戦亾鍙戦€佸浐瀹氭秷鎭?- **agent**锛氬畾鏃跺悜 Agent 鎻愰棶骞跺彂閫佸洖澶嶅埌棰戦亾

### 蹇€熷垱寤?
```bash
# 姣忓ぉ 9:00 鍙戦€佹枃鏈秷鎭紙榛樿 agent锛?copaw cron create \
  --type text \
  --name "姣忔棩鏃╁畨" \
  --cron "0 9 * * *" \
  --channel imessage \
  --target-user "CHANGEME" \
  --target-session "CHANGEME" \
  --text "鏃╀笂濂斤紒"

# 涓虹壒瀹?agent 鍒涘缓浠诲姟
copaw cron create \
  --agent-id abc123 \
  --type agent \
  --name "妫€鏌ュ緟鍔? \
  --cron "0 */2 * * *" \
  --channel dingtalk \
  --target-user "CHANGEME" \
  --target-session "CHANGEME" \
  --text "鎴戞湁浠€涔堝緟鍔炰簨椤癸紵"
```

### 蹇呭～鍙傛暟

鍒涘缓浠诲姟闇€瑕侊細
- `--type`锛氫换鍔＄被鍨嬶紙text 鎴?agent锛?- `--name`锛氫换鍔″悕绉?- `--cron`锛歝ron 琛ㄨ揪寮忥紙濡?`"0 9 * * *"` 琛ㄧず姣忓ぉ 9:00锛?- `--channel`锛氱洰鏍囬閬擄紙console / feishu / dingtalk / discord / qq / telegram / imessage / matrix / mattermost 绛夛級銆傜敤鎴锋湭鎸囧畾鏃讹紝浣跨敤"褰撳墠鐨刢hannel"鐨勫€?- `--target-user`锛氱敤鎴锋爣璇?- `--target-session`锛氫細璇濇爣璇?- `--text`锛氭秷鎭唴瀹癸紙text 绫诲瀷锛夋垨鎻愰棶鍐呭锛坅gent 绫诲瀷锛?
### 鍙€夊弬鏁?
- `--agent-id`锛氭寚瀹?agent ID锛堥粯璁わ細default锛夈€傜敤浜庡 agent 鍦烘櫙銆?
### 浠?JSON 鍒涘缓锛堝鏉傞厤缃級

```bash
copaw cron create -f job_spec.json
```

## Cron 琛ㄨ揪寮忕ず渚?
```
0 9 * * *      # 姣忓ぉ 9:00
0 */2 * * *    # 姣?2 灏忔椂
30 8 * * 1-5   # 宸ヤ綔鏃?8:30
0 0 * * 0      # 姣忓懆鏃ラ浂鐐?*/15 * * * *   # 姣?15 鍒嗛挓
```

## 浣跨敤寤鸿

- 缂哄皯鍙傛暟鏃讹紝璇㈤棶鐢ㄦ埛琛ュ厖鍚庡啀鍒涘缓
- 鏆傚仠/鍒犻櫎/鎭㈠鍓嶏紝鐢?`copaw cron list` 鏌ユ壘 job_id
- 鎺掓煡闂鏃讹紝鐢?`copaw cron state <job_id>` 鏌ョ湅鐘舵€?- 缁欑敤鎴风殑鍛戒护瑕佸畬鏁淬€佸彲鐩存帴澶嶅埗鎵ц
- 璁板緱鎸囧畾 `--agent-id` 鍙傛暟
