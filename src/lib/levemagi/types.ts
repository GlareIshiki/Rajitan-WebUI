// LeveMagi 型定義 — 共通基盤システム仕様書準拠

// === 難易度マスタ ===
export type DifficultyId = "easy" | "normal" | "hard";
export interface DifficultyMaster {
  id: DifficultyId;
  label: string;
  estimateHours: number;
}

// === Nuts ステータス ===
export type NutsTodoStatus = "いつかやる" | "中断" | "没";
export type NutsInProgressStatus =
  | "構想中"
  | "モック"
  | "本作業中"
  | "動作確認"
  | "1回目テスト"
  | "1回目修正"
  | "最終テスト"
  | "最終修正"
  | "レビュー待ち";
export type NutsCompleteStatus = "完了";
export type NutsStatus = NutsTodoStatus | NutsInProgressStatus | NutsCompleteStatus;

// === 成果物 ===
export interface Nuts {
  id: string;
  name: string;
  description: string;
  status: NutsStatus;
  priority: "high" | "medium" | "low";
  difficulty: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  tags: string[];
  startDate?: string;
  deadline?: string;
  icon?: string;
  imageUrl?: string;
  version?: string;
  publicUrl?: string;
  createdAt: string;
}

// === イシュー ===
export interface Trunk {
  id: string;
  nutsId: string;
  title: string;
  type: "non-issue" | "issue";
  value: 1 | 2 | 3;
  status: "pending" | "in_progress" | "done";
  what: string;
  idea: string;
  conclusion: string;
  tags: string[];
  createdAt: string;
}

// === タスク ===
export interface Leaf {
  id: string;
  nutsId?: string;
  trunkId?: string;
  title: string;
  priority: "high" | "medium" | "low";
  difficulty: DifficultyId;
  startedAt?: string;
  completedAt?: string;
  actualHours?: number;
  bonusHours?: number;
  xpSubtotal?: number;
  memo?: string;
  createdAt: string;
}

// === ナレッジ ===
export type RootType = "seed" | "knowledge" | "guide" | "column" | "archive";
export interface Root {
  id: string;
  nutsId?: string;
  title: string;
  type: RootType;
  value?: number;
  tags: string[];
  what: string;
  content: string;
  url?: string;
  createdAt: string;
}

// === タグ ===
export interface Tag {
  id: string;
  name: string;
  isFavorite: boolean;
}

// === ポータル ===
export type PortalCategory =
  | "🎨 創作・開発"
  | "📝 思考・学習"
  | "📋 仕事・キャリア"
  | "🏠 生活・健康"
  | "🎮 エンタメ・趣味";

export interface Portal {
  id: string;
  name: string;
  category: PortalCategory;
  description: string;
  tags: string[];
  rating?: number;
  createdAt: string;
}

// === 作業記録 ===
export interface Worklog {
  id: string;
  nutsId: string;
  name: string;
  startedAt: string;
  completedAt?: string;
  statusSnapshot: NutsStatus;
  phaseSnapshot: string;
  levelSnapshot: number;
  deadlineSnapshot?: string;
  note?: string;
}

// === リソース ===
export type ResourceType = "画像" | "文書" | "音楽" | "動画" | "歌詞";
export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  tags: string[];
  description?: string;
  url?: string;
  createdAt: string;
}

// === ガチャアイテム ===
export interface GachaItem {
  id: string;
  name: string;
  rarity: "normal" | "rare";
  emoji: string;
  description: string;
}

// === ユーザーデータ ===
export interface UserData {
  totalXP: number;
  collectedItems: string[];
  gachaTickets: number;
}

// === 全体の状態 ===
export interface LeveMagiState {
  nuts: Nuts[];
  trunks: Trunk[];
  leaves: Leaf[];
  roots: Root[];
  portals: Portal[];
  worklogs: Worklog[];
  resources: Resource[];
  tags: Tag[];
  userData: UserData;
}

// === ステータス算出 ===
export type LeafStatus = "pending" | "in_progress" | "completed";
export function getLeafStatus(leaf: Leaf): LeafStatus {
  if (leaf.completedAt) return "completed";
  if (leaf.startedAt) return "in_progress";
  return "pending";
}
