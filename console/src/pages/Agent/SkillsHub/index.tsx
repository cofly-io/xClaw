import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SkillsPage from "../Skills";
import SkillPoolPage from "../SkillPool";
import styles from "./index.module.less";

type SkillsTab = "workspace" | "pool";

function normalizeTab(raw: string | null): SkillsTab {
  return raw === "pool" ? "pool" : "workspace";
}

export default function SkillsHubPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = normalizeTab(searchParams.get("tab"));

  const tabs = useMemo(
    () => [
      { key: "workspace" as const, label: t("nav.skills") },
      { key: "pool" as const, label: t("nav.skillPool") },
    ],
    [t],
  );

  const handleTabChange = (next: SkillsTab) => {
    if (next === activeTab) return;
    const updated = new URLSearchParams(searchParams);
    if (next === "workspace") {
      updated.delete("tab");
    } else {
      updated.set("tab", "pool");
    }
    setSearchParams(updated, { replace: true });
  };

  return (
    <div className={styles.skillsHubPage}>
      <div className={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === tab.key ? styles.tabBtnActive : ""
            }`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.content}>
        {activeTab === "pool" ? <SkillPoolPage /> : <SkillsPage />}
      </div>
    </div>
  );
}
