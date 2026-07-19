export const BRANCH_SLIDE_ID = "choose-path";
export const BRANCH_REJOIN_SLIDE_ID = "gpt-image";

export type BranchOption = {
  id: "live" | "memory" | "relationship" | "build";
  label: string;
  labelEn: string;
  shortLabel: string;
  shortLabelEn: string;
  targetSlideId: "admin" | "memory" | "marketing" | "sites";
};

export const branchOptions: BranchOption[] = [
  {
    id: "live",
    label: "ライブ運営を深掘り",
    labelEn: "Explore live operations",
    shortLabel: "ライブ運営",
    shortLabelEn: "Live ops",
    targetSlideId: "admin",
  },
  {
    id: "memory",
    label: "マイページと記憶を見る",
    labelEn: "See personal memory",
    shortLabel: "記憶",
    shortLabelEn: "Memory",
    targetSlideId: "memory",
  },
  {
    id: "relationship",
    label: "関係構築をたどる",
    labelEn: "Follow the relationship loop",
    shortLabel: "関係構築",
    shortLabelEn: "Relationship",
    targetSlideId: "marketing",
  },
  {
    id: "build",
    label: "Codex + SitesのBuildを見る",
    labelEn: "See the Codex + Sites build",
    shortLabel: "Build",
    shortLabelEn: "Build",
    targetSlideId: "sites",
  },
];

export type BranchCounts = Record<string, number>;

export function resolveBranchWinner(counts: BranchCounts) {
  let winner: BranchOption | null = null;
  let highestCount = 0;
  for (const option of branchOptions) {
    const count = Math.max(0, Number(counts[option.id]) || 0);
    if (count > highestCount) {
      winner = option;
      highestCount = count;
    }
  }
  return winner ? { option: winner, count: highestCount } : null;
}

export function isBranchTargetSlide(slideId: string) {
  return branchOptions.some((option) => option.targetSlideId === slideId);
}
