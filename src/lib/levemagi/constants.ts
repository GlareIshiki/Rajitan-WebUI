import type {
  GachaItem,
  DifficultyMaster,
  DifficultyId,
  NutsStatus,
  LeveMagiState,
} from "./types";

// === 難易度マスタ ===
export const DIFFICULTY_MASTER: Record<DifficultyId, DifficultyMaster> = {
  easy: { id: "easy", label: "Easy", estimateHours: 0.5 },
  normal: { id: "normal", label: "Normal", estimateHours: 2 },
  hard: { id: "hard", label: "Hard", estimateHours: 5 },
};

export const DIFFICULTY_OPTIONS: DifficultyId[] = ["easy", "normal", "hard"];

// === レベル計算（成長曲線 Lv1-100） ===
// 次レベルに必要なXP = level² × 10
export function calculateLevel(xp: number): number {
  let level = 1;
  let totalNeeded = 0;
  while (level < 100) {
    const costForNext = level * level * 10;
    if (totalNeeded + costForNext > xp) break;
    totalNeeded += costForNext;
    level++;
  }
  return level;
}

export function getXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += i * i * 10;
  }
  return total;
}

export function getXPToNextLevel(xp: number): {
  current: number;
  required: number;
  progress: number;
} {
  const level = calculateLevel(xp);
  if (level >= 100) return { current: 0, required: 0, progress: 100 };
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const current = xp - currentLevelXP;
  const required = nextLevelXP - currentLevelXP;
  return {
    current,
    required,
    progress: required > 0 ? (current / required) * 100 : 100,
  };
}

// === 称号（レベル帯） ===
export const ACHIEVEMENT_TITLES: { maxLevel: number; title: string }[] = [
  { maxLevel: 3, title: "《銀樹の羽根ペン》" },
  { maxLevel: 5, title: "《翠晶の探索者》" },
  { maxLevel: 10, title: "《蒼穹の旅人》" },
  { maxLevel: 20, title: "《紫炎の語り部》" },
  { maxLevel: 35, title: "《虹霧の巡礼者》" },
  { maxLevel: 50, title: "《星塵の設計士》" },
  { maxLevel: 70, title: "《天蓋の創造主》" },
  { maxLevel: 90, title: "《深淵の大魔導師》" },
  { maxLevel: 99, title: "《世界樹の守護者》" },
  { maxLevel: 100, title: "《神核変異体アダム=カドモン》" },
];

export function getAchievementTitle(level: number): string {
  for (const entry of ACHIEVEMENT_TITLES) {
    if (level <= entry.maxLevel) return entry.title;
  }
  return ACHIEVEMENT_TITLES[ACHIEVEMENT_TITLES.length - 1].title;
}

// === Nutsステータス ===
export const NUTS_STATUS_TODO: NutsStatus[] = ["いつかやる", "中断", "没"];
export const NUTS_STATUS_IN_PROGRESS: NutsStatus[] = [
  "構想中",
  "モック",
  "本作業中",
  "動作確認",
  "1回目テスト",
  "1回目修正",
  "最終テスト",
  "最終修正",
  "レビュー待ち",
];
export const NUTS_STATUS_COMPLETE: NutsStatus[] = ["完了"];
export const ALL_NUTS_STATUSES: NutsStatus[] = [
  ...NUTS_STATUS_TODO,
  ...NUTS_STATUS_IN_PROGRESS,
  ...NUTS_STATUS_COMPLETE,
];

// ステータス→進捗率
export const STATUS_PROGRESS_MAP: Record<NutsStatus, number> = {
  いつかやる: 0,
  中断: 0,
  没: 0,
  構想中: 10,
  モック: 25,
  本作業中: 50,
  動作確認: 60,
  "1回目テスト": 70,
  "1回目修正": 80,
  最終テスト: 85,
  最終修正: 90,
  レビュー待ち: 95,
  完了: 100,
};

// ステータスカテゴリ判定
export function getNutsStatusCategory(
  status: NutsStatus
): "todo" | "in_progress" | "complete" {
  if (NUTS_STATUS_TODO.includes(status)) return "todo";
  if (NUTS_STATUS_IN_PROGRESS.includes(status)) return "in_progress";
  return "complete";
}

// === 優先度 ===
export const PRIORITY_LABELS = {
  high: "高",
  medium: "中",
  low: "低",
} as const;

// === Trunkタイプ ===
export const TRUNK_TYPE_LABELS = {
  "non-issue": "非イシュー",
  issue: "イシュー",
} as const;

// === Rootタイプ ===
export const ROOT_TYPE_LABELS = {
  seed: "シード",
  knowledge: "ナレッジ",
  guide: "ガイド",
  column: "コラム",
  archive: "アーカイブ",
} as const;

// === ポータルカテゴリ ===
export const PORTAL_CATEGORIES = [
  "🎨 創作・開発",
  "📝 思考・学習",
  "📋 仕事・キャリア",
  "🏠 生活・健康",
  "🎮 エンタメ・趣味",
] as const;

// === リソース種類 ===
export const RESOURCE_TYPES = [
  "画像",
  "文書",
  "音楽",
  "動画",
  "歌詞",
] as const;

// === ガチャアイテム（10種） ===
export const GACHA_ITEMS: GachaItem[] = [
  { id: "n1", name: "銅のコイン", rarity: "normal", emoji: "🪙", description: "どこにでもある銅貨" },
  { id: "n2", name: "木の剣", rarity: "normal", emoji: "🗡️", description: "初心者向けの木剣" },
  { id: "n3", name: "癒やしの薬草", rarity: "normal", emoji: "🌿", description: "回復効果がある薬草" },
  { id: "n4", name: "古びた地図", rarity: "normal", emoji: "🗺️", description: "冒険の記録が残る地図" },
  { id: "n5", name: "魔法の羽根", rarity: "normal", emoji: "🪶", description: "不思議な鳥の羽根" },
  { id: "n6", name: "星の欠片", rarity: "normal", emoji: "⭐", description: "夜空から落ちた星" },
  { id: "n7", name: "知恵の書", rarity: "normal", emoji: "📖", description: "古代の知識が詰まった本" },
  { id: "r1", name: "黄金の冠", rarity: "rare", emoji: "👑", description: "王族だけが身につける冠" },
  { id: "r2", name: "魔法の杖", rarity: "rare", emoji: "🪄", description: "強力な魔力を秘めた杖" },
  { id: "r3", name: "ドラゴンの卵", rarity: "rare", emoji: "🥚", description: "伝説のドラゴンの卵" },
];

export function pullGacha(): GachaItem {
  const roll = Math.random() * 100;
  const rarity = roll < 70 ? "normal" : "rare";
  const items = GACHA_ITEMS.filter((item) => item.rarity === rarity);
  return items[Math.floor(Math.random() * items.length)];
}

// === localStorage ===
export const STORAGE_KEY = "levemagi-data";

export const DEFAULT_STATE: LeveMagiState = {
  nuts: [],
  trunks: [],
  leaves: [],
  roots: [],
  portals: [],
  worklogs: [],
  resources: [],
  tags: [],
  userData: {
    totalXP: 0,
    collectedItems: [],
    gachaTickets: 0,
  },
};
