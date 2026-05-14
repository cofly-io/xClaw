import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { Dropdown, Spin, Tooltip } from "antd";
import { useAppMessage } from "../../../hooks/useAppMessage";
import {
  CheckOutlined,
  LoadingOutlined,
  SearchOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";
import { SparkDownLine } from "@agentscope-ai/icons";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { providerApi } from "../../../api/modules/provider";
import type { ProviderInfo, ActiveModelsInfo } from "../../../api/types";
import { useAgentStore } from "../../../stores/agentStore";
import { confirmFreeModelSwitch } from "@/utils/freeModelSwitchWarning";
import { ProviderIcon } from "../../Settings/Models/components/ProviderIconComponent";
import styles from "./index.module.less";

function ProviderAvatar({
  providerId,
  size,
}: {
  providerId: string;
  size: number;
}) {
  return (
    <img
      src={providerIcon(providerId)}
      alt=""
      width={size}
      height={size}
      className={styles.providerIcon}
      draggable={false}
    />
  );
}

interface EligibleProvider {
  id: string;
  name: string;
  base_url?: string;
  models: ProviderInfo["models"];
}

/** Keeps search state inside the dropdown tree so typing does not re-render
 * the parent Dropdown on every keystroke (which remounts the overlay and
 * drops focus from the input). */
const ModelSelectorPanel = memo(function ModelSelectorPanel({
  open,
  loading,
  eligibleProviders,
  activeProviderId,
  activeModelId,
  onSelect,
}: {
  open: boolean;
  loading: boolean;
  eligibleProviders: EligibleProvider[];
  activeProviderId?: string;
  activeModelId?: string;
  onSelect: (providerId: string, modelId: string) => void;
}) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) setSearchQuery("");
  }, [open]);

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  const trimmedSearch = searchQuery.trim();
  const filteredProviders = useMemo(() => {
    if (!trimmedSearch) return eligibleProviders;
    const query = trimmedSearch.toLowerCase();
    return eligibleProviders
      .map((p) => ({
        ...p,
        models: p.models.filter(
          (m) =>
            (m.name || m.id).toLowerCase().includes(query) ||
            p.name.toLowerCase().includes(query),
        ),
      }))
      .filter((p) => p.models.length > 0);
  }, [eligibleProviders, trimmedSearch]);

  const stopDropdownFocusSteal = useCallback((e: React.MouseEvent) => {
    const el = e.target as HTMLElement;
    if (el.closest("input, textarea, select, [contenteditable='true']")) {
      return;
    }
    e.preventDefault();
  }, []);

  return (
    <div className={styles.panel} onMouseDown={stopDropdownFocusSteal}>
      <div className={styles.searchWrapper}>
        <SearchOutlined className={styles.searchIcon} />
        <input
          ref={searchInputRef}
          type="search"
          inputMode="search"
          autoComplete="off"
          className={styles.searchInput}
          placeholder={t("modelSelector.searchModels")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <CloseCircleFilled
            className={styles.searchClear}
            onClick={(e) => {
              e.stopPropagation();
              setSearchQuery("");
              searchInputRef.current?.focus();
            }}
          />
        )}
      </div>

      <div className={styles.listContainer}>
        {loading ? (
          <div className={styles.spinWrapper}>
            <Spin size="small" />
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className={styles.emptyTip}>
            {trimmedSearch
              ? t("modelSelector.noModelsFound")
              : t("modelSelector.noConfiguredModels")}
          </div>
        ) : (
          filteredProviders.map((provider) => (
            <div key={provider.id} className={styles.providerGroup}>
              <div className={styles.providerHeader}>
                <ProviderAvatar providerId={provider.id} size={16} />
                <span className={styles.providerHeaderName}>
                  {provider.name}
                </span>
              </div>
              {provider.models.map((model) => {
                const isActive =
                  provider.id === activeProviderId &&
                  model.id === activeModelId;
                return (
                  <div
                    key={model.id}
                    className={[
                      styles.modelItem,
                      isActive ? styles.modelItemActive : "",
                    ].join(" ")}
                    onClick={() => onSelect(provider.id, model.id)}
                  >
                    <span className={styles.modelName}>
                      {model.name || model.id}
                    </span>
                    <div className={styles.modelTags}>
                      {model.is_free && (
                        <span className={styles.freeTag}>
                          {t("modelSelector.free")}
                        </span>
                      )}
                      {(model.supports_image || model.supports_multimodal) && (
                        <span className={styles.visionTag}>
                          {t("modelSelector.vision")}
                        </span>
                      )}
                      {isActive && (
                        <CheckOutlined className={styles.checkIcon} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default function ModelSelector() {
  const { t } = useTranslation();
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [activeModels, setActiveModels] = useState<ActiveModelsInfo | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const savingRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const { selectedAgent } = useAgentStore();
  const { message } = useAppMessage();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [provData, activeData] = await Promise.all([
        providerApi.listProviders(),
        providerApi.getActiveModels({
          scope: "effective",
          agent_id: selectedAgent,
        }),
      ]);
      if (Array.isArray(provData)) setProviders(provData);
      if (activeData) setActiveModels(activeData);
    } catch (err) {
      console.error("ModelSelector: failed to load data", err);
    } finally {
      setLoading(false);
    }
  }, [selectedAgent]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const prevPathRef = useRef(location.pathname);
  useEffect(() => {
    const prev = prevPathRef.current;
    const curr = location.pathname;
    prevPathRef.current = curr;
    const comingToChat = curr.startsWith("/chat") && !prev.startsWith("/chat");
    if (comingToChat) {
      providerApi
        .getActiveModels({
          scope: "effective",
          agent_id: selectedAgent,
        })
        .then((activeData) => {
          if (activeData) setActiveModels(activeData);
        })
        .catch(() => {});
    }
  }, [location.pathname, selectedAgent]);

  const eligibleProviders = useMemo((): EligibleProvider[] => {
    return providers
      .filter((p) => {
        const hasModels =
          (p.models?.length ?? 0) + (p.extra_models?.length ?? 0) > 0;
        if (!hasModels) return false;
        if (p.require_api_key === false) return !!p.base_url;
        if (p.is_custom) return !!p.base_url;
        if (p.require_api_key ?? true) return !!p.api_key;
        return true;
      })
      .map((p) => ({
        id: p.id,
        name: p.name,
        base_url: p.base_url,
        models: [...(p.models ?? []), ...(p.extra_models ?? [])],
      }));
  }, [providers]);

  // Filter providers/models by search query
  const trimmedSearch = searchQuery.trim();
  const filteredProviders = (() => {
    if (!trimmedSearch) return eligibleProviders;
    const query = trimmedSearch.toLowerCase();
    return eligibleProviders
      .map((p) => ({
        ...p,
        models: p.models.filter(
          (m) =>
            (m.name || m.id).toLowerCase().includes(query) ||
            p.name.toLowerCase().includes(query),
        ),
      }))
      .filter((p) => p.models.length > 0);
  })();

  // Focus search input when dropdown opens; clear query when closes
  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [open]);

  const activeProviderId = activeModels?.active_llm?.provider_id;
  const activeModelId = activeModels?.active_llm?.model;

  const activeModelName = (() => {
    if (!activeProviderId || !activeModelId)
      return t("modelSelector.selectModel");
    for (const p of eligibleProviders) {
      if (p.id === activeProviderId) {
        const m = p.models.find((m) => m.id === activeModelId);
        if (m) return m.name || m.id;
      }
    }
    return activeModelId;
  })();

  const showActiveProviderIcon = Boolean(activeProviderId);

  const handleOpenChange = useCallback(
    async (next: boolean) => {
      setOpen(next);
      if (next) {
        try {
          const activeData = await providerApi.getActiveModels({
            scope: "effective",
            agent_id: selectedAgent,
          });
          if (activeData) setActiveModels(activeData);
        } catch {
          // ignore
        }
      }
    },
    [selectedAgent],
  );

  const handleSelect = useCallback(
    async (providerId: string, modelId: string) => {
      if (savingRef.current) return;
      if (providerId === activeProviderId && modelId === activeModelId) {
        setOpen(false);
        return;
      }

      setOpen(false);

      savingRef.current = true;
      setSaving(true);
      try {
        await providerApi.setActiveLlm({
          provider_id: providerId,
          model: modelId,
          scope: "agent",
          agent_id: selectedAgent,
        });
        setActiveModels({
          active_llm: { provider_id: providerId, model: modelId },
        });
        window.dispatchEvent(new CustomEvent("model-switched"));
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : t("modelSelector.switchFailed");
        message.error(msg);
      } finally {
        setSaving(false);
        savingRef.current = false;
      }
    },
    [activeProviderId, activeModelId, message, selectedAgent, t],
  );

  const dropdownRender = useCallback(
    () => (
      <ModelSelectorPanel
        open={open}
        loading={loading}
        eligibleProviders={eligibleProviders}
        activeProviderId={activeProviderId}
        activeModelId={activeModelId}
        onSelect={handleSelect}
      />
    ),
    [
      open,
      loading,
      handleSelect,
      eligibleProviders,
      activeProviderId,
      activeModelId,
    ],
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={handleOpenChange}
      dropdownRender={dropdownRender}
      destroyOnHidden
      trigger={["click"]}
      placement="bottomLeft"
    >
      <Tooltip title={t("chat.modelSelectTooltip")} mouseEnterDelay={0.5}>
        <div
          className={[styles.trigger, open ? styles.triggerActive : ""].join(
            " ",
          )}
        >
          {saving && (
            <LoadingOutlined style={{ fontSize: 11, color: "#FF7F16" }} />
          )}
          {showActiveProviderIcon && activeProviderId && (
            <ProviderAvatar providerId={activeProviderId} size={16} />
          )}
          <span className={styles.triggerName}>{activeModelName}</span>
          <SparkDownLine
            className={[
              styles.triggerArrow,
              open ? styles.triggerArrowOpen : "",
            ].join(" ")}
          />
        </div>
      </Tooltip>
    </Dropdown>
  );
}
