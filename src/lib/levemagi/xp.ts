import { DIFFICULTY_MASTER } from "./constants";
import type { Leaf } from "./types";

// 実作業時間を計算（時間単位）
export function calculateActualHours(
  startedAt: string,
  completedAt: string
): number {
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  return Math.max(0, (end - start) / (1000 * 60 * 60));
}

// ボーナス時間（見積より早い分）
export function calculateBonusHours(
  estimateHours: number,
  actualHours: number
): number {
  return Math.max(0, estimateHours - actualHours);
}

// Leaf単体のXP小計
export function calculateLeafXP(leaf: Leaf): number {
  if (!leaf.completedAt || !leaf.startedAt) return 0;
  const actual = calculateActualHours(leaf.startedAt, leaf.completedAt);
  const estimate = DIFFICULTY_MASTER[leaf.difficulty].estimateHours;
  const bonus = calculateBonusHours(estimate, actual);
  return actual + bonus;
}

// Nuts全体のXP合計: sum(経験値小計) + sum(ボーナス) × 2
export function calculateNutsXP(leaves: Leaf[]): number {
  let sumSubtotals = 0;
  let sumBonuses = 0;
  for (const leaf of leaves) {
    if (!leaf.completedAt || !leaf.startedAt) continue;
    const actual = calculateActualHours(leaf.startedAt, leaf.completedAt);
    const estimate = DIFFICULTY_MASTER[leaf.difficulty].estimateHours;
    const bonus = calculateBonusHours(estimate, actual);
    sumSubtotals += actual + bonus;
    sumBonuses += bonus;
  }
  return sumSubtotals + sumBonuses * 2;
}

// 全Leafから総XPを計算
export function calculateTotalXP(leaves: Leaf[]): number {
  // Nuts単位でグルーピングしてボーナスを計算
  const nutsMap = new Map<string, Leaf[]>();
  const unlinked: Leaf[] = [];

  for (const leaf of leaves) {
    if (leaf.nutsId) {
      const arr = nutsMap.get(leaf.nutsId) || [];
      arr.push(leaf);
      nutsMap.set(leaf.nutsId, arr);
    } else {
      unlinked.push(leaf);
    }
  }

  let total = 0;
  for (const group of nutsMap.values()) {
    total += calculateNutsXP(group);
  }
  // 未紐づけのLeafは個別計算（ボーナス2倍なし）
  for (const leaf of unlinked) {
    total += calculateLeafXP(leaf);
  }
  return total;
}

// XPを小数点1桁にフォーマット
export function formatXP(xp: number): string {
  return xp.toFixed(1);
}

// 時間をフォーマット
export function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}分`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}時間${m}分` : `${h}時間`;
}
