import type { LeveMagiState, NutsStatus, DifficultyId } from "./types";
import { DEFAULT_STATE } from "./constants";

// 旧ステータス→新ステータスのマッピング
const OLD_STATUS_MAP: Record<string, NutsStatus> = {
  someday: "いつかやる",
  active: "本作業中",
  blocked: "中断",
  done: "完了",
  archived: "没",
};

// 旧難易度（数値）→新難易度（ID）のマッピング
const OLD_DIFFICULTY_MAP: Record<number, DifficultyId> = {
  1: "easy",
  2: "easy",
  3: "normal",
  4: "hard",
  5: "hard",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateState(raw: any): LeveMagiState {
  if (!raw || typeof raw !== "object") return DEFAULT_STATE;

  const state: LeveMagiState = {
    nuts: Array.isArray(raw.nuts) ? raw.nuts : [],
    trunks: Array.isArray(raw.trunks) ? raw.trunks : [],
    leaves: Array.isArray(raw.leaves) ? raw.leaves : [],
    roots: Array.isArray(raw.roots) ? raw.roots : [],
    portals: Array.isArray(raw.portals) ? raw.portals : [],
    worklogs: Array.isArray(raw.worklogs) ? raw.worklogs : [],
    resources: Array.isArray(raw.resources) ? raw.resources : [],
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    userData: {
      totalXP: raw.userData?.totalXP ?? 0,
      collectedItems: Array.isArray(raw.userData?.collectedItems)
        ? raw.userData.collectedItems
        : [],
      gachaTickets: raw.userData?.gachaTickets ?? 0,
    },
  };

  // Nutsステータスのマイグレーション
  state.nuts = state.nuts.map((n) => {
    const mapped = OLD_STATUS_MAP[n.status as string];
    if (mapped) {
      return { ...n, status: mapped };
    }
    return n;
  });

  // Leaf難易度のマイグレーション
  state.leaves = state.leaves.map((l) => {
    if (typeof l.difficulty === "number") {
      return {
        ...l,
        difficulty: OLD_DIFFICULTY_MAP[l.difficulty] || "normal",
        priority: l.priority || "medium",
      };
    }
    return { ...l, priority: l.priority || "medium" };
  });

  // Trunkのマイグレーション（旧type→新type）
  const OLD_TRUNK_TYPE_MAP: Record<string, "non-issue" | "issue"> = {
    problem: "issue",
    hypothesis: "issue",
    decision: "non-issue",
    research: "non-issue",
  };
  state.trunks = state.trunks.map((t) => {
    const mapped = OLD_TRUNK_TYPE_MAP[t.type as string];
    if (mapped) {
      return { ...t, type: mapped, value: t.value || 2, tags: t.tags || [] };
    }
    return { ...t, tags: t.tags || [] };
  });

  return state;
}
