import React, { useMemo } from "react";
import { Dropdown, Input, Tooltip } from "antd";
import type { MenuProps } from "antd";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  MessageCircle,
  Mic,
  Monitor,
  Send,
  Smartphone,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../contexts/ThemeContext";
import styles from "./index.module.less";

interface ChatSessionItemProps {
  /** Session display name */
  name: string;
  /** Channel key (e.g. console, dingtalk) — used with shared channel icons */
  channelKey?: string;
  /** Localized channel label (e.g. Console, DingTalk) */
  channelLabel?: string;
  /** Whether this is the currently selected session */
  active?: boolean;
  /** Whether the item is in inline-edit mode */
  editing?: boolean;
  /** Current value of the edit input */
  editValue?: string;
  /** Click callback (select session) */
  onClick?: () => void;
  /** Edit / rename callback */
  onEdit?: () => void;
  /** Delete callback */
  onDelete?: () => void;
  /** Edit input value change callback */
  onEditChange?: (value: string) => void;
  /** Confirm edit callback (Enter key or blur) */
  onEditSubmit?: () => void;
  /** Cancel edit callback */
  onEditCancel?: () => void;
  className?: string;
}

const CHANNEL_LUCIDE_ICONS: Record<string, LucideIcon> = {
  console: Monitor,
  dingtalk: MessageCircle,
  feishu: Send,
  telegram: Send,
  discord: MessageCircle,
  wecom: MessageCircle,
  weixin: MessageCircle,
  qq: MessageCircle,
  imessage: MessageCircle,
  voice: Mic,
  mqtt: Smartphone,
};

/** Match sidebar `navIconProps` / “新会话” label tone */
const ICON_STROKE = "#707070";

const ChatSessionItem: React.FC<ChatSessionItemProps> = (props) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const className = [
    styles.chatSessionItem,
    props.active ? styles.active : "",
    props.editing ? styles.editing : "",
    props.className || "",
  ]
    .filter(Boolean)
    .join(" ");

  const ChannelIcon =
    props.channelKey && CHANNEL_LUCIDE_ICONS[props.channelKey]
      ? CHANNEL_LUCIDE_ICONS[props.channelKey]
      : Bot;

  const channelTip =
    props.channelLabel?.trim() || props.channelKey?.trim() || "";

  const menuItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "rename",
        label: (
          <span style={{ fontSize: 12, lineHeight: "18px" }}>
            {t("chat.renameSession")}
          </span>
        ),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          props.onEdit?.();
        },
      },
      {
        key: "delete",
        label: (
          <span style={{ fontSize: 12, lineHeight: "18px" }}>
            {t("common.delete")}
          </span>
        ),
        danger: true,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          props.onDelete?.();
        },
      },
    ],
    [props.onDelete, props.onEdit, t],
  );

  return (
    <div
      className={className}
      onClick={props.editing ? undefined : props.onClick}
    >
      <Tooltip
        title={
          channelTip ? (
            <span style={{ fontSize: 12, lineHeight: "18px" }}>{channelTip}</span>
          ) : undefined
        }
        mouseEnterDelay={0.3}
        placement="top"
      >
        <span
          className={styles.leadIcon}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <ChannelIcon
            size={14}
            color={isDark ? "rgba(255, 255, 255, 0.55)" : ICON_STROKE}
            strokeWidth={2}
          />
        </span>
      </Tooltip>

      <div className={styles.main}>
        {props.editing ? (
          <Input
            autoFocus
            size="small"
            className={styles.editInput}
            value={props.editValue}
            onChange={(e) => props.onEditChange?.(e.target.value)}
            onPressEnter={props.onEditSubmit}
            onBlur={props.onEditSubmit}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className={styles.titleLine}>
            <span className={styles.title}>{props.name}</span>
            <span className={styles.moreWrap}>
              <Dropdown
                menu={{ items: menuItems }}
                trigger={["click"]}
                placement="bottomRight"
                overlayClassName="chatSessionDropdownOverlay"
              >
                <button
                  type="button"
                  className={styles.moreBtn}
                  aria-label={t("common.actions")}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  ...
                </button>
              </Dropdown>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSessionItem;
