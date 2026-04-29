import { Card } from "@agentscope-ai/design";
import { useTranslation } from "react-i18next";
import type { ACPAgentConfig } from "./ACPDrawer";
import styles from "../../../Control/Channels/index.module.less";

interface ACPCardProps {
  agentKey: string;
  config: ACPAgentConfig;
  isBuiltin: boolean;
  onClick: () => void;
}

export function ACPCard({ agentKey, config, isBuiltin, onClick }: ACPCardProps) {
  const { t } = useTranslation();
  const enabled = Boolean(config.enabled);
  const title = isBuiltin
    ? `${agentKey} (${t("acp.builtin")})`
    : `${agentKey} (${t("acp.custom")})`;

  return (
    <Card hoverable onClick={onClick} className={styles.channelCard} bodyStyle={{ padding: 0 }}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderMain}>
          <span className={styles.cardTitle}>{title}</span>
        </div>
        <div className={styles.statusIndicator}>
          <div
            className={`${styles.statusDot} ${enabled ? styles.statusOn : styles.statusOff}`}
          />
          <span className={styles.statusText}>
            {enabled ? t("common.enabled") : t("common.disabled")}
          </span>
        </div>
      </div>
      <div className={styles.cardDivider} />
      <p className={styles.channelDescription}>
        {config.command || t("common.notConfigured", { defaultValue: "Not configured" })}
      </p>
    </Card>
  );
}
