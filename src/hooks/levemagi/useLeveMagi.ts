"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type {
  LeveMagiState,
  Nuts,
  Trunk,
  Leaf,
  Root,
  Tag,
  Portal,
  Resource,
  Worklog,
  NutsStatus,
} from "@/lib/levemagi/types";
import {
  STORAGE_KEY,
  DEFAULT_STATE,
  calculateLevel,
  getXPToNextLevel,
  pullGacha,
  DIFFICULTY_MASTER,
} from "@/lib/levemagi/constants";
import {
  calculateActualHours,
  calculateBonusHours,
  calculateTotalXP,
} from "@/lib/levemagi/xp";
import { detectPhase } from "@/lib/levemagi/milestones";
import { migrateState } from "@/lib/levemagi/migration";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useLeveMagi() {
  const [rawState, setRawState, isLoaded] = useLocalStorage<LeveMagiState>(
    STORAGE_KEY,
    DEFAULT_STATE
  );

  // マイグレーション適用
  const state = useMemo(() => migrateState(rawState), [rawState]);
  const setState = useCallback(
    (updater: LeveMagiState | ((prev: LeveMagiState) => LeveMagiState)) => {
      if (typeof updater === "function") {
        setRawState((prev) => updater(migrateState(prev)));
      } else {
        setRawState(updater);
      }
    },
    [setRawState]
  );

  // === 派生データ ===
  const totalXP = useMemo(() => calculateTotalXP(state.leaves), [state.leaves]);
  const level = useMemo(() => calculateLevel(totalXP), [totalXP]);
  const xpProgress = useMemo(() => getXPToNextLevel(totalXP), [totalXP]);

  // === Nuts 操作 ===
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
        worklogs: prev.worklogs.filter((w) => w.nutsId !== id),
      }));
    },
    [setState]
  );

  // 未完了Worklogを閉じるヘルパー
  const closeOpenWorklogs = (worklogs: Worklog[], nutsId: string, now: string, nutsStatus: NutsStatus, phaseLabel: string, currentLevel: number): Worklog[] => {
    return worklogs.map((w) =>
      w.nutsId === nutsId && !w.completedAt
        ? { ...w, completedAt: now, statusSnapshot: nutsStatus, phaseSnapshot: phaseLabel, levelSnapshot: currentLevel }
        : w
    );
  };

  // 作業開始（ステータス変更 + Worklog生成）
  const startWork = useCallback(
    (nutsId: string, newStatus?: NutsStatus) => {
      setState((prev) => {
        const nuts = prev.nuts.find((n) => n.id === nutsId);
        if (!nuts) return prev;

        const phase = detectPhase(nuts.startDate, nuts.deadline, nuts.status);
        const now = new Date();
        const nowISO = now.toISOString();
        const currentLevel = calculateLevel(calculateTotalXP(prev.leaves));

        // 前回の未完了Worklogを自動クローズ
        const updatedWorklogs = closeOpenWorklogs(prev.worklogs, nutsId, nowISO, nuts.status, phase.label, currentLevel);

        const worklog: Worklog = {
          id: generateId(),
          nutsId,
          name: `${nuts.name}の作業記録：${now.toLocaleDateString("ja-JP")} ${now.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`,
          startedAt: nowISO,
          statusSnapshot: nuts.status,
          phaseSnapshot: phase.label,
          levelSnapshot: currentLevel,
          deadlineSnapshot: nuts.deadline,
        };

        return {
          ...prev,
          nuts: prev.nuts.map((n) =>
            n.id === nutsId
              ? {
                  ...n,
                  status: newStatus || "本作業中",
                  startDate: n.startDate || nowISO,
                }
              : n
          ),
          worklogs: [...updatedWorklogs, worklog],
        };
      });
    },
    [setState]
  );

  // 成果物を完了にする
  const completeNuts = useCallback(
    (nutsId: string) => {
      setState((prev) => {
        const nuts = prev.nuts.find((n) => n.id === nutsId);
        if (!nuts) return prev;

        const nowISO = new Date().toISOString();
        const phase = detectPhase(nuts.startDate, nuts.deadline, nuts.status);
        const currentLevel = calculateLevel(calculateTotalXP(prev.leaves));

        // 未完了Worklogをクローズ
        const updatedWorklogs = closeOpenWorklogs(prev.worklogs, nutsId, nowISO, "完了", phase.label, currentLevel);

        return {
          ...prev,
          nuts: prev.nuts.map((n) =>
            n.id === nutsId ? { ...n, status: "完了" as NutsStatus } : n
          ),
          worklogs: updatedWorklogs,
        };
      });
    },
    [setState]
  );

  // === Trunk 操作 ===
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
        leaves: prev.leaves.map((l) =>
          l.trunkId === id ? { ...l, trunkId: undefined } : l
        ),
      }));
    },
    [setState]
  );

  // === Leaf 操作 ===
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

      const now = new Date().toISOString();
      const startedAt = leaf.startedAt || now;
      const actualHours = calculateActualHours(startedAt, now);
      const estimate = DIFFICULTY_MASTER[leaf.difficulty].estimateHours;
      const bonusHours = calculateBonusHours(estimate, actualHours);
      const xpSubtotal = actualHours + bonusHours;

      const prevLevel = level;

      setState((prev) => {
        const newLeaves = prev.leaves.map((l) =>
          l.id === id
            ? {
                ...l,
                completedAt: now,
                startedAt: l.startedAt || now,
                actualHours,
                bonusHours,
                xpSubtotal,
              }
            : l
        );

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

        const newTotalXP = calculateTotalXP(newLeaves);
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

      return xpSubtotal;
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

  // === Root 操作 ===
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

  // === Portal 操作 ===
  const addPortal = useCallback(
    (data: Omit<Portal, "id" | "createdAt">) => {
      const newPortal: Portal = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, portals: [...prev.portals, newPortal] }));
      return newPortal;
    },
    [setState]
  );

  const updatePortal = useCallback(
    (id: string, data: Partial<Omit<Portal, "id" | "createdAt">>) => {
      setState((prev) => ({
        ...prev,
        portals: prev.portals.map((p) =>
          p.id === id ? { ...p, ...data } : p
        ),
      }));
    },
    [setState]
  );

  const deletePortal = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        portals: prev.portals.filter((p) => p.id !== id),
      }));
    },
    [setState]
  );

  // === Resource 操作 ===
  const addResource = useCallback(
    (data: Omit<Resource, "id" | "createdAt">) => {
      const newResource: Resource = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        resources: [...prev.resources, newResource],
      }));
      return newResource;
    },
    [setState]
  );

  const updateResource = useCallback(
    (id: string, data: Partial<Omit<Resource, "id" | "createdAt">>) => {
      setState((prev) => ({
        ...prev,
        resources: prev.resources.map((r) =>
          r.id === id ? { ...r, ...data } : r
        ),
      }));
    },
    [setState]
  );

  const deleteResource = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        resources: prev.resources.filter((r) => r.id !== id),
      }));
    },
    [setState]
  );

  // === Tag 操作 ===
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
    state,
    isLoaded,
    totalXP,
    level,
    xpProgress,
    // Nuts
    addNuts,
    updateNuts,
    deleteNuts,
    startWork,
    completeNuts,
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
    // Portal
    addPortal,
    updatePortal,
    deletePortal,
    // Resource
    addResource,
    updateResource,
    deleteResource,
    // Tag
    addTag,
    deleteTag,
    // ガチャ
    doGacha,
  };
}
