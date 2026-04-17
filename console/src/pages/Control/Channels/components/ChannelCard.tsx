import { Card } from "@agentscope-ai/design";
import { useTranslation } from "react-i18next";
import {
  getChannelDescription,
  getChannelLabel,
  type ChannelKey,
} from "./constants";
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
  const label = getChannelLabel(channelKey, t);
  const description = getChannelDescription(channelKey, t);

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
          <span className={styles.cardTitle}>{label}</span>
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

      <p className={styles.channelDescription}>{description}</p>
    </Card>
  );
}
