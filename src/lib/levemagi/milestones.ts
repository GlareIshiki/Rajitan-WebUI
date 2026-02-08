import type { NutsStatus } from "./types";
import { getNutsStatusCategory } from "./constants";

export type PhaseId =
  | "not_started"
  | "green"
  | "yellow"
  | "red"
  | "deadline"
  | "fire"
  | "complete"
  | "no_dates";

export interface PhaseInfo {
  id: PhaseId;
  label: string;
  emoji: string;
  color: string;
}

export interface MilestonePhase {
  name: string;
  emoji: string;
  color: string;
  startDate: Date;
  endDate: Date;
  percentage: number;
}

// マイルストーンの5フェーズを計算
export function calculateMilestones(
  startDate: string,
  deadline: string
): MilestonePhase[] {
  const start = new Date(startDate).getTime();
  const end = new Date(deadline).getTime();
  const total = end - start;
  if (total <= 0) return [];

  const phases = [
    { name: "緑フェーズ", emoji: "🟢", color: "green", percentage: 0.5 },
    { name: "黄フェーズ", emoji: "🟡", color: "yellow", percentage: 0.15 },
    { name: "締切間近", emoji: "⚠️", color: "orange", percentage: 0.15 },
    { name: "最終ライン", emoji: "🚨", color: "red", percentage: 0.15 },
    { name: "炎上", emoji: "🔥", color: "red", percentage: 0.05 },
  ];

  let cursor = start;
  return phases.map((p) => {
    const duration = total * p.percentage;
    const phase: MilestonePhase = {
      ...p,
      startDate: new Date(cursor),
      endDate: new Date(cursor + duration),
    };
    cursor += duration;
    return phase;
  });
}

// 現在のフェーズを検出
export function detectPhase(
  startDate: string | undefined,
  deadline: string | undefined,
  status: NutsStatus
): PhaseInfo {
  if (getNutsStatusCategory(status) === "complete") {
    return { id: "complete", label: "完了", emoji: "✅", color: "green" };
  }

  if (!startDate || !deadline) {
    return { id: "no_dates", label: "日程未設定", emoji: "📅", color: "gray" };
  }

  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(deadline).getTime();

  if (now < start) {
    return { id: "not_started", label: "開始前", emoji: "🕒", color: "gray" };
  }

  const total = end - start;
  if (total <= 0) {
    return { id: "fire", label: "炎上", emoji: "🔥", color: "red" };
  }

  const elapsed = now - start;
  const ratio = elapsed / total;

  if (ratio <= 0.5) return { id: "green", label: "緑フェーズ", emoji: "🟢", color: "green" };
  if (ratio <= 0.65) return { id: "yellow", label: "黄フェーズ", emoji: "🟡", color: "yellow" };
  if (ratio <= 0.8) return { id: "red", label: "締切間近", emoji: "⚠️", color: "orange" };
  if (ratio <= 0.95) return { id: "deadline", label: "最終ライン", emoji: "🚨", color: "red" };
  return { id: "fire", label: "炎上", emoji: "🔥", color: "red" };
}
