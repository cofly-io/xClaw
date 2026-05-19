import type { ProviderInfo, ActiveModelsInfo } from "../../../../../api/types";
import { LocalProviderCard } from "./LocalProviderCard";
import { RemoteProviderCard } from "./RemoteProviderCard";

interface ProviderCardProps {
  provider: ProviderInfo;
  activeModels: ActiveModelsInfo | null;
  onSaved: () => void;
  onOpenConfig: (provider: ProviderInfo) => void;
  onOpenModels: (provider: ProviderInfo) => void;
}

const LOCAL_PROVIDER_IDS = new Set([
  "xclaw-local",
  "qwenpaw-local",
  "copaw-local",
]);

export function ProviderCard({
  provider,
  onSaved,
  onOpenConfig,
  onOpenModels,
}: ProviderCardProps) {
  if (LOCAL_PROVIDER_IDS.has(provider.id)) {
    return (
      <LocalProviderCard provider={provider} onOpenModels={onOpenModels} />
    );
  }

  return (
    <RemoteProviderCard
      provider={provider}
      onSaved={onSaved}
      onOpenConfig={onOpenConfig}
      onOpenModels={onOpenModels}
    />
  );
}
