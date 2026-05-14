import type { TFunction } from "i18next";
import type { AgentSummary } from "../api/types/agents";

export const DEFAULT_AGENT_ID = "default";
/** Legacy / API placeholder names that should show as i18n `agent.defaultDisplayName`. */
export const DEFAULT_AGENT_DISPLAY_NAME = "Default Agent";

function isDefaultAgentPlaceholderName(name: string): boolean {
  const n = name.trim().toLowerCase();
  return n === "default agent" || n === "default";
}

/** UI label for an agent; `default` id uses i18n, others use API `name` (fallback: id). */
export function getAgentDisplayName(
  agent: Pick<AgentSummary, "id" | "name">,
  t: TFunction,
): string {
  // For default agent, preserve i18n unless explicitly customized
  if (agent.id === DEFAULT_AGENT_ID) {
    // If name is customized (not API/legacy placeholders), show custom name
    if (agent.name && !isDefaultAgentPlaceholderName(agent.name)) {
      return agent.name;
    }
    // Otherwise, fall back to localized default name
    return t("agent.defaultDisplayName");
  }
  // For other agents, use user-defined name or fallback to id
  return agent.name || agent.id;
}
