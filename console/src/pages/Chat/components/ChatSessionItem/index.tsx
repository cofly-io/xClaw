import React, { useMemo, useRef } from "react";
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
import type { ChatStatus } from "../../../../api/types/chat";
import { useTheme } from "../../../../contexts/ThemeContext";
import {
  ContextMenu,
  useContextMenu,
  type ContextMenuItem,
} from "../../../../components/ContextMenu";
import styles from "./index.module.less";

interface ChatSessionItemProps {
  /** Unique session id — used to call back parent handlers without inline closures */
  sessionId: string;
  /** Session display name */
  name: string;
  /** Optional subtitle time string (drawer) */
  time?: string;
  /** Session lifecycle status (drawer) */
  chatStatus?: ChatStatus;
  /** Whether the session stream is still generating (drawer) */
  generating?: boolean;
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
  /** Whether the chat is pinned (optional; enables pin in context menu when onPin is set) */
  pinned?: boolean;
  /** Click callback (select session) */
  onClick?: () => void;
  /** Edit / rename callback */
  onEdit?: () => void;
  /** Delete callback */
  onDelete?: () => void;
  /** Pin / unpin callback (optional) */
  onPin?: () => void;
  /** Edit input value change callback */
  onEditChange?: (value: string) => void;
  /** Confirm edit callback (Enter key or blur) */
  onEditSubmit?: () => void;
  /** Cancel edit callback */
  onEditCancel?: () => void;
  /** Drawer: parent-owned context menu (e.g. single menu for virtualized list) */
  onContextMenu?: (sessionId: string, event: React.MouseEvent) => void;
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
  const contextMenu = useContextMenu();
  const isComposingRef = useRef(false);

  const contextMenuItems: ContextMenuItem[] = useMemo(() => {
    const items: ContextMenuItem[] = [
      {
        key: "open",
        label: t("chat.contextMenu.open", "Open"),
        onClick: props.onClick,
      },
      {
        key: "rename",
        label: t("chat.contextMenu.rename", "Rename"),
        onClick: props.onEdit,
      },
    ];
    if (props.onPin) {
      items.push({
        key: "pin",
        label: props.pinned
          ? t("chat.contextMenu.unpin", "Unpin")
          : t("chat.contextMenu.pin", "Pin"),
        onClick: props.onPin,
      });
    }
    items.push({ key: "divider-1", label: "", divider: true });
    items.push({
      key: "delete",
      label: t("chat.contextMenu.delete", "Delete"),
      danger: true,
      onClick: props.onDelete,
    });
    return items;
  }, [
    t,
    props.onClick,
    props.onEdit,
    props.onPin,
    props.onDelete,
    props.pinned,
  ]);

  const className = [
    styles.chatSessionItem,
    props.active ? styles.active : "",
    props.editing ? styles.editing : "",
    props.pinned ? styles.pinned : "",
    props.className || "",
  ]
    .filter(Boolean)
    .join(" ");

  const ChannelIconComp =
    props.channelKey && CHANNEL_LUCIDE_ICONS[props.channelKey]
      ? CHANNEL_LUCIDE_ICONS[props.channelKey]
      : Bot;

  const channelTip =
    props.channelLabel?.trim() || props.channelKey?.trim() || "";

  const menuItems: MenuProps["items"] = useMemo(() => {
    const items: MenuProps["items"] = [
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
    ];
    if (props.onPin) {
      items.push({
        key: "pin",
        label: (
          <span style={{ fontSize: 12, lineHeight: "18px" }}>
            {props.pinned
              ? t("chat.contextMenu.unpin", "Unpin")
              : t("chat.contextMenu.pin", "Pin")}
          </span>
        ),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          props.onPin?.();
        },
      });
    }
    items.push({
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
    });
    return items;
  }, [props.onDelete, props.onEdit, props.onPin, props.pinned, t]);

  const handleContextMenu = props.editing
    ? undefined
    : props.onContextMenu && props.sessionId
    ? (e: React.MouseEvent) => {
        e.preventDefault();
        props.onContextMenu!(props.sessionId!, e);
      }
    : contextMenu.show;

  return (
    <div
      className={className}
      onClick={props.editing ? undefined : props.onClick}
      onContextMenu={handleContextMenu}
    >
      <Tooltip
        title={
          channelTip ? (
            <span style={{ fontSize: 12, lineHeight: "18px" }}>
              {channelTip}
            </span>
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
          <ChannelIconComp
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
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.nativeEvent.isComposing &&
                !isComposingRef.current
              ) {
                e.preventDefault();
                props.onEditSubmit?.();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                props.onEditCancel?.();
              }
            }}
            onBlur={() => {
              /* Delay slightly so that IME composition end + blur
                 ordering issues on some browsers don't cause
                 premature submit */
              setTimeout(() => {
                if (!isComposingRef.current) {
                  props.onEditSubmit?.();
                }
              }, 100);
            }}
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
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        items={contextMenuItems}
        onClose={contextMenu.hide}
      />
    </div>
  );
};

export default React.memo(ChatSessionItem);
