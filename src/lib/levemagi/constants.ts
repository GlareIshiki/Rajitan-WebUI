import type { GachaItem } from "./types";

// レベル閾値テーブル
export const LEVEL_THRESHOLDS = [
  0, // Lv1
  10, // Lv2
  25, // Lv3
  50, // Lv4
  100, // Lv5
  180, // Lv6
  300, // Lv7
  500, // Lv8
  800, // Lv9
  1200, // Lv10
];

// XPからレベルを計算
export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

// 次のレベルまでのXPを計算
export function getXPToNextLevel(xp: number): {
  current: number;
  required: number;
  progress: number;
} {
  const level = calculateLevel(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

  const current = xp - currentThreshold;
  const required = nextThreshold - currentThreshold;
  const progress = required > 0 ? (current / required) * 100 : 100;

  return { current, required, progress };
}

// ガチャアイテム（10種）
export const GACHA_ITEMS: GachaItem[] = [
  // ノーマル（7種）
  { id: "n1", name: "銅のコイン", rarity: "normal", emoji: "🪙", description: "どこにでもある銅貨" },
  { id: "n2", name: "木の剣", rarity: "normal", emoji: "🗡️", description: "初心者向けの木剣" },
  { id: "n3", name: "癒やしの薬草", rarity: "normal", emoji: "🌿", description: "回復効果がある薬草" },
  { id: "n4", name: "古びた地図", rarity: "normal", emoji: "🗺️", description: "冒険の記録が残る地図" },
  { id: "n5", name: "魔法の羽根", rarity: "normal", emoji: "🪶", description: "不思議な鳥の羽根" },
  { id: "n6", name: "星の欠片", rarity: "normal", emoji: "⭐", description: "夜空から落ちた星" },
  { id: "n7", name: "知恵の書", rarity: "normal", emoji: "📖", description: "古代の知識が詰まった本" },
  // レア（3種）
  { id: "r1", name: "黄金の冠", rarity: "rare", emoji: "👑", description: "王族だけが身につける冠" },
  { id: "r2", name: "魔法の杖", rarity: "rare", emoji: "🪄", description: "強力な魔力を秘めた杖" },
  { id: "r3", name: "ドラゴンの卵", rarity: "rare", emoji: "🥚", description: "伝説のドラゴンの卵" },
];

// ガチャを引く
export function pullGacha(): GachaItem {
  const roll = Math.random() * 100;
  const rarity = roll < 70 ? "normal" : "rare";
  const items = GACHA_ITEMS.filter((item) => item.rarity === rarity);
  return items[Math.floor(Math.random() * items.length)];
}

// localStorage キー
export const STORAGE_KEY = "levemagi-data";

// デフォルト状態
export const DEFAULT_STATE = {
  nuts: [],
  trunks: [],
  leaves: [],
  roots: [],
  tags: [],
  userData: {
    totalXP: 0,
    collectedItems: [],
    gachaTickets: 0,
  },
};

// ステータス表示用
export const STATUS_LABELS = {
  someday: "いつかやる",
  active: "進行中",
  blocked: "ブロック",
  done: "完了",
  archived: "アーカイブ",
} as const;

export const PRIORITY_LABELS = {
  high: "高",
  medium: "中",
  low: "低",
} as const;

export const TRUNK_TYPE_LABELS = {
  problem: "課題",
  hypothesis: "仮説",
  decision: "決定事項",
  research: "調査",
} as const;

export const ROOT_TYPE_LABELS = {
  seed: "シード",
  knowledge: "ナレッジ",
  guide: "ガイド",
  column: "コラム",
  archive: "アーカイブ",
} as const;
