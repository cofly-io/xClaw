import { useContext, useMemo, useState, useEffect } from "react";
import { Button } from "antd";
import { Conversations, useProviderContext } from "@agentscope-ai/chat";
import { useChatAnywhereInput } from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/Context/ChatAnywhereInputContext";
import { SparkPlusLine, SparkDeleteLine, SparkOperateLeftLine, SparkOperateRightLine } from "@agentscope-ai/icons";
import { useChatAnywhereSessions } from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/Context/ChatAnywhereSessionsContext";
import { ChatAnyWhereLayoutContext } from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/Context/ChatAnywhereLayoutContext";
import { useTranslation } from "react-i18next";
import sessionApi from "../sessionApi";
import i18n from "../../../i18n";
import styles from "./index.module.less";

function getSessionGroup(updateAt: number): string {
  const now = Date.now();
  const diffDays = (now - updateAt) / (1000 * 60 * 60 * 24);
  if (diffDays < 1) return i18n.t("chat.group.today");
  if (diffDays < 3) return i18n.t("chat.group.last3Days");
  if (diffDays < 7) return i18n.t("chat.group.last7Days");
  return i18n.t("chat.group.monthAgo");
}

export default function SessionList() {
  const { t } = useTranslation();
  const { getPrefixCls } = useProviderContext();
  const prefixCls = getPrefixCls("chat-anywhere-sessions");

  const { collapsed, toggleCollapsed } = useContext(ChatAnyWhereLayoutContext);
  const { loading } = useChatAnywhereInput((v) => ({ loading: v.loading }));
  const { createSession, removeSession, changeCurrentSessionId, getCurrentSessionId } =
    useChatAnywhereSessions();

  // Subscribe to sessionApi changes for reactive re-render
  const [tick, setTick] = useState(0);
  useEffect(() => {
    return sessionApi.subscribe(() => setTick((n) => n + 1));
  }, []);

  const sessions = sessionApi.sessionList;
  const currentSessionId = getCurrentSessionId();

  const items = useMemo(() => {
    return sessions.map((session) => ({
      key: session.id,
      label: session.name || t("chat.newChat"),
      group: getSessionGroup((session as any).updateAt ?? Date.now()),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, t, tick]);

  return (
    <div className={`${prefixCls} ${styles.wrap}`}>
      <div className={`${prefixCls}-header`}>
        <div className={`${prefixCls}-header-left`}>
          <span>{t("nav.chat")}</span>
        </div>
        <Button
          type="text"
          icon={collapsed ? <SparkOperateRightLine /> : <SparkOperateLeftLine />}
          onClick={toggleCollapsed}
        />
      </div>

      <div className={`${prefixCls}-content`} style={{ display: collapsed ? "none" : "flex" }}>
        <div className={`${prefixCls}-adder`}>
          <Button
            block
            type="primary"
            icon={<SparkPlusLine />}
            disabled={!!loading}
            onClick={() => createSession()}
          >
            {t("chat.newChat")}
          </Button>
        </div>

        <div className={`${prefixCls}-list`}>
          <Conversations
            groupable
            activeKey={currentSessionId}
            items={items}
            menu={[
              {
                key: "delete",
                icon: <SparkDeleteLine />,
                danger: true,
                onClick: async (session: { key: string }) => {
                  await removeSession({ id: session.key });
                },
              },
            ]}
            onActiveChange={(key: string) => changeCurrentSessionId(key)}
          />
        </div>
      </div>
    </div>
  );
}
