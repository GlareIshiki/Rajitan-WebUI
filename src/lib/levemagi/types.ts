// LeveMagi 型定義

// 成果物（プロジェクト）
export interface Nuts {
  id: string;
  name: string;
  description: string;
  status: "someday" | "active" | "blocked" | "done" | "archived";
  priority: "high" | "medium" | "low";
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  createdAt: string;
}

// イシュー（なぜやるか）
export interface Trunk {
  id: string;
  nutsId: string;
  title: string;
  type: "problem" | "hypothesis" | "decision" | "research";
  status: "pending" | "in_progress" | "done";
  what: string;
  idea: string;
  conclusion: string;
  createdAt: string;
}

// タスク（何をやるか）
export interface Leaf {
  id: string;
  nutsId?: string;
  trunkId?: string;
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

// ナレッジ
export interface Root {
  id: string;
  nutsId?: string;
  title: string;
  type: "seed" | "knowledge" | "guide" | "column" | "archive";
  tags: string[];
  what: string;
  content: string;
  createdAt: string;
}

// タグ
export interface Tag {
  id: string;
  name: string;
  isFavorite: boolean;
}

// ガチャアイテム
export interface GachaItem {
  id: string;
  name: string;
  rarity: "normal" | "rare";
  emoji: string;
  description: string;
}

// ユーザーデータ
export interface UserData {
  totalXP: number;
  collectedItems: string[];
  gachaTickets: number;
}

// 全体の状態
export interface LeveMagiState {
  nuts: Nuts[];
  trunks: Trunk[];
  leaves: Leaf[];
  roots: Root[];
  tags: Tag[];
  userData: UserData;
}

// タスクのステータス（算出用）
export type LeafStatus = "pending" | "in_progress" | "completed";

// ステータス算出関数
export function getLeafStatus(leaf: Leaf): LeafStatus {
  if (leaf.completedAt) return "completed";
  if (leaf.startedAt) return "in_progress";
  return "pending";
}

// XP算出（完了タスクのみ）
export function getLeafXP(leaf: Leaf): number {
  return leaf.completedAt ? leaf.difficulty : 0;
}
