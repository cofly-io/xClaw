import { Card } from "@agentscope-ai/design";
import { useTranslation } from "react-i18next";
import { getChannelIconUrl } from "./channelIcons";
import { getChannelLabel, type ChannelKey } from "./constants";
import styles from "../index.module.less";

interface ChannelCardProps {
  channelKey: ChannelKey;
  config: Record<string, unknown>;
  isHover: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function ChannelCard({
  channelKey,
  config,
  isHover,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: ChannelCardProps) {
  const { t } = useTranslation();
  const enabled = Boolean(config.enabled);
  const isBuiltin = Boolean(config.isBuiltin);
  const label = getChannelLabel(channelKey, t);
  const getConfigString = (key: string) =>
    typeof config[key] === "string" ? config[key] : "";
  const botPrefix = getConfigString("bot_prefix");

  const cardClass = isHover
    ? `${styles.channelCard} ${styles.cardHover}`
    : styles.channelCard;

  return (
    <Card
      hoverable
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cardClass}
      bodyStyle={{ padding: 0 }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderMain}>
          <div className={styles.iconWrapper}>
            <img
              src={getChannelIconUrl(channelKey)}
              alt={channelKey}
              width={28}
              height={28}
            />
          </div>
          <div className={styles.titleGroup}>
            <span className={styles.cardTitle}>{label}</span>
            {isBuiltin ? (
              <span className={styles.builtinTag}>{t("channels.builtin")}</span>
            ) : (
              <span className={styles.customTag}>{t("channels.custom")}</span>
            )}
          </div>
        </div>
        <div className={styles.statusIndicator}>
          <div
            className={`${styles.statusDot} ${
              enabled ? styles.statusOn : styles.statusOff
            }`}
          />
          <span className={styles.statusText}>
            {enabled ? t("common.enabled") : t("common.disabled")}
          </span>
        </div>
      </div>

      <div className={styles.cardDivider} />

      <div className={styles.cardFooterRow}>
        <span className={styles.infoLabel}>{t("channels.botPrefix")}</span>
        <span className={styles.infoValue}>
          {botPrefix || t("channels.notSet")}
        </span>
      </div>
    </Card>
  );
}
