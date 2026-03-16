import { useCallback, useContext, useMemo } from "react";
import { HistoryPanel, useProviderContext } from "@agentscope-ai/chat";
// @ts-ignore
import { useContextSelector } from "use-context-selector";
// @ts-ignore
import { ChatAnywhereSessionsContext, useChatAnywhereSessions } from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/Context/ChatAnywhereSessionsContext";
// @ts-ignore
import { ChatAnywhereInputContext } from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/Context/ChatAnywhereInputContext";
// @ts-ignore
import { ChatAnyWhereLayoutContext } from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/Context/ChatAnywhereLayoutContext";
import { Button } from "@agentscope-ai/design";
import { SparkDeleteLine, SparkOperateLeftLine, SparkOperateRightLine, SparkPlusLine } from "@agentscope-ai/icons";
import styles from "./index.module.css";

const DAY = 86400000;

function getGroup(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < DAY) return "今天";
  if (diff < 2 * DAY) return "昨天";
  if (diff < 4 * DAY) return "过去 3 天";
  if (diff < 8 * DAY) return "过去 7 天";
  if (diff < 31 * DAY) return "过去 30 天";
  return "更早";
}

export default function CustomSessionList() {
  const { collapsed, toggleCollapsed } = useContext(ChatAnyWhereLayoutContext);
  const { getPrefixCls } = useProviderContext();
  const prefixCls = getPrefixCls("chat-anywhere-sessions");

  // Use useContextSelector (use-context-selector) so we get reactive updates
  const sessions: any[] = useContextSelector(ChatAnywhereSessionsContext, (v: any) => v.sessions) ?? [];
  const currentSessionId: string | undefined = useContextSelector(ChatAnywhereSessionsContext, (v: any) => v.currentSessionId);
  const loading: boolean = useContextSelector(ChatAnywhereInputContext, (v: any) => v.loading);

  const { createSession, changeCurrentSessionId, removeSession } = useChatAnywhereSessions();

  const items = useMemo(() => {
    return sessions.map((session: any) => {
      const ts = session.updateAt || Date.now();
      const group = getGroup(ts);
      return { key: session.id, label: session.name || "New Chat", timestamp: ts, group };
    });
  }, [sessions]);

  const handleDelete = useCallback(async (session: any) => {
    await removeSession({ id: session.key });
  }, [removeSession]);

  return (
    <div className={`${prefixCls}`} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header: 折叠按钮单独一行 */}
      <div className={`${prefixCls}-header`} style={{ padding: "10px 12px 4px", display: "flex", justifyContent: "flex-end" }}>
        <button className={styles.collapseBtn} onClick={toggleCollapsed} title={collapsed ? "展开" : "收起"}>
          {collapsed ? <SparkOperateRightLine /> : <SparkOperateLeftLine />}
        </button>
      </div>

      {/* New Chat 按钮单独一行，折叠时隐藏 */}
      {!collapsed && (
        <div className={`${prefixCls}-adder`}>
          <Button
            block
            type="primary"
            icon={<SparkPlusLine />}
            disabled={!!loading}
            onClick={async () => { await createSession(); }}
          >
            New Chat
          </Button>
        </div>
      )}

      {/* Session list，折叠时隐藏 */}
      {!collapsed && (
        <div className={`${prefixCls}-content`} style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div className={`${prefixCls}-list`} style={{ flex: 1, overflow: "auto" }}>
            <HistoryPanel
              groupable={true}
              items={items}
              menu={[{ key: "delete", icon: <SparkDeleteLine />, danger: true, onClick: handleDelete }]}
              activeKey={currentSessionId}
              onActiveChange={(key: string) => { changeCurrentSessionId(key); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
