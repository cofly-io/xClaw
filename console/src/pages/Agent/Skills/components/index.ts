export { SkillCard } from "./SkillCard";
export {
  SkillDrawer,
  parseFrontmatter,
  type SkillDrawerFormValues,
} from "./SkillDrawer";
export { getFileIcon, getSkillVisual } from "./SkillCard";
export {
  getSkillDisplaySource,
  getPoolBuiltinStatusLabel,
  getPoolBuiltinStatusTone,
} from "./skillMetadata";
export { useConflictRenameModal } from "./useConflictRenameModal";
export { ImportHubModal } from "./ImportHubModal";
export { PoolTransferModal } from "./PoolTransferModal";
export { HeaderActions } from "./HeaderActions";
export { SkillsToolbar } from "./SkillsToolbar";
export { SkillListItem } from "./SkillListItem";

/** Match backend `skills` router limits for skill tags. */
export const MAX_TAGS = 8;
export const MAX_TAG_LENGTH = 16;

export const SUPPORTED_SKILL_URL_PREFIXES = [
  "https://skills.sh/",
  "https://clawhub.ai/",
  "https://skillsmp.com/",
  "https://lobehub.com/",
  "https://market.lobehub.com/",
  "https://github.com/",
  "https://modelscope.cn/skills/",
];

export type SkillMarket = {
  key: string;
  name: string;
  homepage: string;
  urlPrefix: string;
  examples: Array<{ label: string; url: string }>;
};

export const skillMarkets: SkillMarket[] = [
  {
    key: "skills.sh",
    name: "skills.sh",
    homepage: "https://skills.sh/",
    urlPrefix: "https://skills.sh/",
    examples: [
      {
        label: "vercel-labs/find-skills",
        url: "https://skills.sh/vercel-labs/skills/find-skills",
      },
    ],
  },
  {
    key: "clawhub",
    name: "ClawHub",
    homepage: "https://clawhub.ai/",
    urlPrefix: "https://clawhub.ai/",
    examples: [],
  },
  {
    key: "skillsmp",
    name: "skillsmp",
    homepage: "https://skillsmp.com/",
    urlPrefix: "https://skillsmp.com/",
    examples: [],
  },
  {
    key: "lobehub",
    name: "LobeHub",
    homepage: "https://lobehub.com/",
    urlPrefix: "https://lobehub.com/",
    examples: [
      {
        label: "openclaw-skills-cli-developer",
        url: "https://lobehub.com/zh/skills/openclaw-skills-cli-developer",
      },
    ],
  },
  {
    key: "market.lobehub",
    name: "LobeHub Market",
    homepage: "https://market.lobehub.com/",
    urlPrefix: "https://market.lobehub.com/",
    examples: [
      {
        label: "cli-developer",
        url: "https://market.lobehub.com/api/v1/skills/openclaw-skills-cli-developer/download",
      },
    ],
  },
  {
    key: "github",
    name: "GitHub",
    homepage: "https://github.com/",
    urlPrefix: "https://github.com/",
    examples: [
      {
        label: "anthropics/skill-creator",
        url: "https://github.com/anthropics/skills/tree/main/skills/skill-creator",
      },
    ],
  },
  {
    key: "modelscope",
    name: "ModelScope",
    homepage: "https://modelscope.cn/skills/",
    urlPrefix: "https://modelscope.cn/skills/",
    examples: [
      {
        label: "@anthropics/skill-creator",
        url: "https://modelscope.cn/skills/@anthropics/skill-creator",
      },
    ],
  },
];

export function isSupportedSkillUrl(url: string): boolean {
  return skillMarkets.some((m) => url.startsWith(m.urlPrefix));
}
