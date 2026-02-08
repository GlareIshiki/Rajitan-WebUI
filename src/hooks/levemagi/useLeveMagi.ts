"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { LeveMagiState, Nuts, Trunk, Leaf, Root, Tag } from "@/lib/levemagi/types";
import { getLeafXP } from "@/lib/levemagi/types";
import {
  STORAGE_KEY,
  DEFAULT_STATE,
  calculateLevel,
  getXPToNextLevel,
  pullGacha,
} from "@/lib/levemagi/constants";

// ID生成
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useLeveMagi() {
  const [state, setState, isLoaded] = useLocalStorage<LeveMagiState>(STORAGE_KEY, DEFAULT_STATE);

  // === 派生データ ===

  // 総XP
  const totalXP = useMemo(() => {
    return state.leaves.reduce((sum, leaf) => sum + getLeafXP(leaf), 0);
  }, [state.leaves]);

  // レベル
  const level = useMemo(() => calculateLevel(totalXP), [totalXP]);

  // 次のレベルまでの進捗
  const xpProgress = useMemo(() => getXPToNextLevel(totalXP), [totalXP]);

  // === Nuts（成果物）操作 ===

  const addNuts = useCallback(
    (data: Omit<Nuts, "id" | "createdAt">) => {
      const newNuts: Nuts = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, nuts: [...prev.nuts, newNuts] }));
      return newNuts;
    },
    [setState]
  );

  const updateNuts = useCallback(
    (id: string, data: Partial<Omit<Nuts, "id" | "createdAt">>) => {
      setState((prev) => ({
        ...prev,
        nuts: prev.nuts.map((n) => (n.id === id ? { ...n, ...data } : n)),
      }));
    },
    [setState]
  );

  const deleteNuts = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        nuts: prev.nuts.filter((n) => n.id !== id),
        trunks: prev.trunks.filter((t) => t.nutsId !== id),
        leaves: prev.leaves.filter((l) => l.nutsId !== id),
      }));
    },
    [setState]
  );

  // === Trunk（イシュー）操作 ===

  const addTrunk = useCallback(
    (data: Omit<Trunk, "id" | "createdAt">) => {
      const newTrunk: Trunk = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, trunks: [...prev.trunks, newTrunk] }));
      return newTrunk;
    },
    [setState]
  );

  const updateTrunk = useCallback(
    (id: string, data: Partial<Omit<Trunk, "id" | "createdAt">>) => {
      setState((prev) => ({
        ...prev,
        trunks: prev.trunks.map((t) => (t.id === id ? { ...t, ...data } : t)),
      }));
    },
    [setState]
  );

  const deleteTrunk = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        trunks: prev.trunks.filter((t) => t.id !== id),
        leaves: prev.leaves.map((l) => (l.trunkId === id ? { ...l, trunkId: undefined } : l)),
      }));
    },
    [setState]
  );

  // === Leaf（タスク）操作 ===

  const addLeaf = useCallback(
    (data: Omit<Leaf, "id" | "createdAt">) => {
      const newLeaf: Leaf = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, leaves: [...prev.leaves, newLeaf] }));
      return newLeaf;
    },
    [setState]
  );

  const startLeaf = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        leaves: prev.leaves.map((l) =>
          l.id === id ? { ...l, startedAt: new Date().toISOString() } : l
        ),
      }));
    },
    [setState]
  );

  const completeLeaf = useCallback(
    (id: string, createSeed: boolean = false) => {
      const leaf = state.leaves.find((l) => l.id === id);
      if (!leaf) return null;

      const prevLevel = level;
      const xpGained = leaf.difficulty;

      setState((prev) => {
        const newLeaves = prev.leaves.map((l) =>
          l.id === id
            ? { ...l, completedAt: new Date().toISOString(), startedAt: l.startedAt || new Date().toISOString() }
            : l
        );

        // シード自動生成
        let newRoots = prev.roots;
        if (createSeed) {
          const seed: Root = {
            id: generateId(),
            nutsId: leaf.nutsId,
            title: `${leaf.title}から学んだこと`,
            type: "seed",
            tags: [],
            what: "",
            content: "",
            createdAt: new Date().toISOString(),
          };
          newRoots = [...prev.roots, seed];
        }

        // レベルアップ判定
        const newTotalXP = newLeaves.reduce((sum, l) => sum + getLeafXP(l), 0);
        const newLevel = calculateLevel(newTotalXP);
        const leveledUp = newLevel > prevLevel;

        return {
          ...prev,
          leaves: newLeaves,
          roots: newRoots,
          userData: {
            ...prev.userData,
            totalXP: newTotalXP,
            gachaTickets: prev.userData.gachaTickets + (leveledUp ? 1 : 0),
          },
        };
      });

      return xpGained;
    },
    [setState, state.leaves, level]
  );

  const deleteLeaf = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        leaves: prev.leaves.filter((l) => l.id !== id),
      }));
    },
    [setState]
  );

  // === Root（ナレッジ）操作 ===

  const addRoot = useCallback(
    (data: Omit<Root, "id" | "createdAt">) => {
      const newRoot: Root = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, roots: [...prev.roots, newRoot] }));
      return newRoot;
    },
    [setState]
  );

  const updateRoot = useCallback(
    (id: string, data: Partial<Omit<Root, "id" | "createdAt">>) => {
      setState((prev) => ({
        ...prev,
        roots: prev.roots.map((r) => (r.id === id ? { ...r, ...data } : r)),
      }));
    },
    [setState]
  );

  const deleteRoot = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        roots: prev.roots.filter((r) => r.id !== id),
      }));
    },
    [setState]
  );

  // === Tag（タグ）操作 ===

  const addTag = useCallback(
    (name: string) => {
      const newTag: Tag = {
        id: generateId(),
        name,
        isFavorite: false,
      };
      setState((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
      return newTag;
    },
    [setState]
  );

  const deleteTag = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        tags: prev.tags.filter((t) => t.id !== id),
      }));
    },
    [setState]
  );

  // === ガチャ ===

  const doGacha = useCallback(() => {
    if (state.userData.gachaTickets <= 0) return null;

    const item = pullGacha();

    setState((prev) => ({
      ...prev,
      userData: {
        ...prev.userData,
        gachaTickets: prev.userData.gachaTickets - 1,
        collectedItems: prev.userData.collectedItems.includes(item.id)
          ? prev.userData.collectedItems
          : [...prev.userData.collectedItems, item.id],
      },
    }));

    return item;
  }, [setState, state.userData.gachaTickets]);

  return {
    // 状態
    state,
    isLoaded,
    totalXP,
    level,
    xpProgress,

    // Nuts
    addNuts,
    updateNuts,
    deleteNuts,

    // Trunk
    addTrunk,
    updateTrunk,
    deleteTrunk,

    // Leaf
    addLeaf,
    startLeaf,
    completeLeaf,
    deleteLeaf,

    // Root
    addRoot,
    updateRoot,
    deleteRoot,

    // Tag
    addTag,
    deleteTag,

    // ガチャ
    doGacha,
  };
}
