import { useMemo, useState } from "react";
import { Button, Modal } from "@agentscope-ai/design";
import { SnippetsOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { isSupportedSkillUrl, skillMarkets, type SkillMarket } from "./index";
import styles from "./ImportHubModal.module.less";

interface ImportHubModalProps {
  open: boolean;
  importing: boolean;
  onCancel: () => void;
  onConfirm: (url: string, targetName?: string) => Promise<void>;
  cancelImport?: () => void;
  hint?: string;
}

type ValidationResult =
  | { ok: true; source: string }
  | { ok: false; messageKey: string };

function validateUrl(url: string): ValidationResult {
  const trimmed = url.trim();
  if (!trimmed) {
    return { ok: false, messageKey: "" };
  }

  try {
    new URL(trimmed);
  } catch {
    return { ok: false, messageKey: "skills.invalidUrl" };
  }

  const source = skillMarkets.find((m) =>
    trimmed.toLowerCase().startsWith(m.urlPrefix.toLowerCase()),
  );
  if (!source) {
    return { ok: false, messageKey: "skills.invalidSkillUrlSource" };
  }

  return { ok: true, source: source.name };
}

export function ImportHubModal({
  open,
  importing,
  onCancel,
  onConfirm,
  cancelImport,
  hint,
}: ImportHubModalProps) {
  const { t } = useTranslation();
  const [importUrl, setImportUrl] = useState("");
  const [touched, setTouched] = useState(false);

  const handleClose = () => {
    if (importing) return;
    setImportUrl("");
    setTouched(false);
    onCancel();
  };

  const handleUrlChange = (value: string) => {
    setImportUrl(value);
    if (!touched) setTouched(true);
  };

  const validation = useMemo(() => {
    const trimmed = importUrl.trim();
    if (!trimmed) return { ok: false, message: "" };
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      if (!isSupportedSkillUrl(trimmed)) {
        return { ok: false, message: t("skills.invalidSkillUrlSource") };
      }
      return { ok: true, message: t("skills.skillUrlLooksValid") };
    }
    return { ok: false, message: t("skills.enterValidUrl") };
  }, [importUrl, t]);

  const handleConfirm = async () => {
    if (importing) return;
    const trimmed = importUrl.trim();
    if (!trimmed) return;
    if (!isSupportedSkillUrl(trimmed)) {
      setTouched(true);
      return;
    }
    await onConfirm(trimmed);
  };

  const canConfirm = !!importUrl.trim() && validation.ok && !importing;
  const showTip = touched && !!importUrl.trim();

  const setExample = (url: string) => {
    if (importing) return;
    setImportUrl(url);
    setTouched(true);
  };

  const onPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) handleUrlChange(text);
    } catch {
      // ignore
    }
  };

  const onClear = () => {
    if (importing) return;
    setImportUrl("");
    setTouched(false);
  };

  return (
    <Modal
      className={styles.importHubModal}
      title={t("skills.importHub")}
      open={open}
      onCancel={handleClose}
      keyboard={!importing}
      closable={!importing}
      maskClosable={!importing}
      width={680}
      footer={
        <div className={styles.modalFooter}>
          <Button
            className={styles.cancelButton}
            onClick={importing && cancelImport ? cancelImport : handleClose}
          >
            {t(
              importing && cancelImport
                ? "skills.cancelImport"
                : "common.cancel",
            )}
          </Button>
          <Button
            className={styles.importButton}
            type="primary"
            onClick={handleConfirm}
            loading={importing}
            disabled={!canConfirm}
          >
            {t("skills.importHub")}
          </Button>
        </div>
      }
    >
      {hint ? <div className={styles.hint}>{hint}</div> : null}

      <div className={styles.urlRow}>
        <input
          className={`${styles.urlInput} ${
            showTip && !validation.ok ? styles.urlInputError : ""
          }`}
          value={importUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={t("skills.enterSkillUrl")}
          disabled={importing}
        />

        <Button onClick={onPaste} disabled={importing}>
          {t("common.paste")}
        </Button>
        <Button onClick={onClear} disabled={importing || !importUrl}>
          {t("common.clear")}
        </Button>
      </div>

      {showTip ? (
        <div
          className={`${styles.urlTip} ${
            validation.ok ? "" : styles.urlTipError
          }`}
        >
          {validation.message}
        </div>
      ) : null}

      {importing ? (
        <div className={styles.loadingText}>{t("common.loading")}</div>
      ) : null}

      <div className={styles.sourcesTitle}>
        <SnippetsOutlined />
        <span>{t("skills.orChooseFromSources")}</span>
      </div>

      <div className={styles.sourcesGrid}>
        {skillMarkets.map((m: SkillMarket) => (
          <div
            key={m.key}
            className={styles.sourceCard}
            onClick={() => setExample(m.homepage)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.sourceCardHeader}>
              <div className={styles.sourceName}>{m.name}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {t("skills.clickToFill")}
              </div>
            </div>

            <div className={styles.sourcePrefix}>{m.urlPrefix}</div>

            {m.examples.length ? (
              <div className={styles.examples}>
                {m.examples.map((ex) => (
                  <Button
                    key={ex.url}
                    type="text"
                    className={styles.exampleBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExample(ex.url);
                    }}
                  >
                    {ex.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Modal>
  );
}
