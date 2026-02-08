"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
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
  const { data: session, status: sessionStatus } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;

  const [state, setState] = useState<LeveMagiState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  // Helper: fire API call in background (no-op if no token)
  const apiCall = useCallback(
    (fn: (t: string) => Promise<unknown>) => {
      const t = tokenRef.current;
      if (!t) return;
      fn(t).catch((err) => console.error("LeveMagi API error:", err));
    },
    []
  );

  // === Initial load ===
  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (!token) {
      // No auth - fallback to localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setState(migrateState(JSON.parse(stored)));
        }
      } catch (err) {
        console.error("Failed to load from localStorage:", err);
      }
      setIsLoaded(true);
      return;
    }

    // Load from API
    api
      .get<LeveMagiState>("/api/levemagi/state", token)
      .then((data) => {
        setState(data);
        setIsLoaded(true);

        // Auto-migrate localStorage data if API state is empty
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const localData = migrateState(JSON.parse(stored));
            if (localData.nuts.length > 0 && data.nuts.length === 0) {
              api
                .post<LeveMagiState>("/api/levemagi/import", localData, token)
                .then((imported) => {
                  setState(imported);
                  localStorage.removeItem(STORAGE_KEY);
                })
                .catch(console.error);
            } else {
              localStorage.removeItem(STORAGE_KEY);
            }
          }
        } catch {
          // ignore localStorage errors
        }
      })
      .catch((err) => {
        console.error("Failed to load from API, fallback to localStorage:", err);
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            setState(migrateState(JSON.parse(stored)));
          }
        } catch {
          // ignore
        }
        setIsLoaded(true);
      });
  }, [token, sessionStatus]);

  // === Polling (30s interval, pause when tab is hidden) ===
  useEffect(() => {
    if (!token || !isLoaded) return;

    const POLL_INTERVAL = 30_000;
    let timerId: ReturnType<typeof setInterval> | null = null;

    const fetchState = () => {
      api
        .get<LeveMagiState>("/api/levemagi/state", tokenRef.current!)
        .then((data) => setState(data))
        .catch((err) => console.error("LeveMagi poll error:", err));
    };

    const startPolling = () => {
      if (timerId) return;
      timerId = setInterval(fetchState, POLL_INTERVAL);
    };

    const stopPolling = () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchState();
        startPolling();
      } else {
        stopPolling();
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token, isLoaded]);

  // === Derived data ===
  const totalXP = useMemo(() => calculateTotalXP(state.leaves), [state.leaves]);
  const level = useMemo(() => calculateLevel(totalXP), [totalXP]);
  const xpProgress = useMemo(() => getXPToNextLevel(totalXP), [totalXP]);

  // === Nuts operations ===
  const addNuts = useCallback(
    (data: Omit<Nuts, "id" | "createdAt">) => {
      const id = generateId();
      const newNuts: Nuts = {
        ...data,
        id,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, nuts: [...prev.nuts, newNuts] }));
      apiCall((t) => api.post("/api/levemagi/nuts", { id, ...data }, t));
      return newNuts;
    },
    [apiCall]
  );

  const updateNuts = useCallback(
    (id: string, data: Partial<Omit<Nuts, "id" | "createdAt">>) => {
      setState((prev) => ({
        ...prev,
        nuts: prev.nuts.map((n) => (n.id === id ? { ...n, ...data } : n)),
      }));
      apiCall((t) => api.put(`/api/levemagi/nuts/${id}`, data, t));
    },
    [apiCall]
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
      apiCall((t) => api.delete(`/api/levemagi/nuts/${id}`, t));
    },
    [apiCall]
  );

  // Close open worklogs helper
  const closeOpenWorklogs = (
    worklogs: Worklog[],
    nutsId: string,
    now: string,
    nutsStatus: NutsStatus,
    phaseLabel: string,
    currentLevel: number
  ): Worklog[] => {
    return worklogs.map((w) =>
      w.nutsId === nutsId && !w.completedAt
        ? {
            ...w,
            completedAt: now,
            statusSnapshot: nutsStatus,
            phaseSnapshot: phaseLabel,
            levelSnapshot: currentLevel,
          }
        : w
    );
  };

  // Start work (status change + Worklog generation)
  const startWork = useCallback(
    (nutsId: string, newStatus?: NutsStatus) => {
      setState((prev) => {
        const nuts = prev.nuts.find((n) => n.id === nutsId);
        if (!nuts) return prev;

        const phase = detectPhase(nuts.startDate, nuts.deadline, nuts.status);
        const now = new Date();
        const nowISO = now.toISOString();
        const currentLevel = calculateLevel(calculateTotalXP(prev.leaves));

        const updatedWorklogs = closeOpenWorklogs(
          prev.worklogs,
          nutsId,
          nowISO,
          nuts.status,
          phase.label,
          currentLevel
        );

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
                  status: newStatus || ("本作業中" as NutsStatus),
                  startDate: n.startDate || nowISO,
                }
              : n
          ),
          worklogs: [...updatedWorklogs, worklog],
        };
      });
      apiCall((t) => api.post(`/api/levemagi/nuts/${nutsId}/start-work`, {}, t));
    },
    [apiCall]
  );

  // Complete a Nuts
  const completeNuts = useCallback(
    (nutsId: string) => {
      setState((prev) => {
        const nuts = prev.nuts.find((n) => n.id === nutsId);
        if (!nuts) return prev;

        const nowISO = new Date().toISOString();
        const phase = detectPhase(nuts.startDate, nuts.deadline, nuts.status);
        const currentLevel = calculateLevel(calculateTotalXP(prev.leaves));

        const updatedWorklogs = closeOpenWorklogs(
          prev.worklogs,
          nutsId,
          nowISO,
          "完了" as NutsStatus,
          phase.label,
          currentLevel
        );

        return {
          ...prev,
          nuts: prev.nuts.map((n) =>
            n.id === nutsId ? { ...n, status: "完了" as NutsStatus } : n
          ),
          worklogs: updatedWorklogs,
        };
      });
      apiCall((t) => api.post(`/api/levemagi/nuts/${nutsId}/complete`, {}, t));
    },
    [apiCall]
  );

  // === Trunk operations ===
  const addTrunk = useCallback(
    (data: Omit<Trunk, "id" | "createdAt">) => {
      const id = generateId();
      const newTrunk: Trunk = {
        ...data,
        id,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, trunks: [...prev.trunks, newTrunk] }));
      apiCall((t) => api.post("/api/levemagi/trunks", { id, ...data }, t));
      return newTrunk;
    },
    [apiCall]
  );

  const updateTrunk = useCallback(
    (id: string, data: Partial<Omit<Trunk, "id" | "createdAt">>) => {
      setState((prev) => ({
        ...prev,
        trunks: prev.trunks.map((t) => (t.id === id ? { ...t, ...data } : t)),
      }));
      apiCall((t) => api.put(`/api/levemagi/trunks/${id}`, data, t));
    },
    [apiCall]
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
      apiCall((t) => api.delete(`/api/levemagi/trunks/${id}`, t));
    },
    [apiCall]
  );

  // === Leaf operations ===
  const addLeaf = useCallback(
    (data: Omit<Leaf, "id" | "createdAt">) => {
      const id = generateId();
      const newLeaf: Leaf = {
        ...data,
        id,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, leaves: [...prev.leaves, newLeaf] }));
      apiCall((t) => api.post("/api/levemagi/leaves", { id, ...data }, t));
      return newLeaf;
    },
    [apiCall]
  );

  const startLeaf = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        leaves: prev.leaves.map((l) =>
          l.id === id ? { ...l, startedAt: new Date().toISOString() } : l
        ),
      }));
      apiCall((t) => api.post(`/api/levemagi/leaves/${id}/start`, {}, t));
    },
    [apiCall]
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
          const seedId = generateId();
          const seed: Root = {
            id: seedId,
            nutsId: leaf.nutsId,
            title: `${leaf.title}から学んだこと`,
            type: "seed",
            tags: [],
            what: "",
            content: "",
            createdAt: new Date().toISOString(),
          };
          newRoots = [...prev.roots, seed];
          // Persist seed to API
          apiCall((t) =>
            api.post("/api/levemagi/roots", {
              id: seedId,
              nutsId: leaf.nutsId,
              title: seed.title,
              type: "seed",
              tags: [],
              what: "",
              content: "",
            }, t)
          );
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

      apiCall((t) =>
        api.post(`/api/levemagi/leaves/${id}/complete`, { actualHours }, t)
      );

      return xpSubtotal;
    },
    [apiCall, state.leaves, level]
  );

  const deleteLeaf = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        leaves: prev.leaves.filter((l) => l.id !== id),
      }));
      apiCall((t) => api.delete(`/api/levemagi/leaves/${id}`, t));
    },
    [apiCall]
  );

  // === Root operations ===
  const addRoot = useCallback(
    (data: Omit<Root, "id" | "createdAt">) => {
      const id = generateId();
      const newRoot: Root = {
        ...data,
        id,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, roots: [...prev.roots, newRoot] }));
      apiCall((t) => api.post("/api/levemagi/roots", { id, ...data }, t));
      return newRoot;
    },
    [apiCall]
  );

  const updateRoot = useCallback(
    (id: string, data: Partial<Omit<Root, "id" | "createdAt">>) => {
      setState((prev) => ({
        ...prev,
        roots: prev.roots.map((r) => (r.id === id ? { ...r, ...data } : r)),
      }));
      apiCall((t) => api.put(`/api/levemagi/roots/${id}`, data, t));
    },
    [apiCall]
  );

  const deleteRoot = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        roots: prev.roots.filter((r) => r.id !== id),
      }));
      apiCall((t) => api.delete(`/api/levemagi/roots/${id}`, t));
    },
    [apiCall]
  );

  // === Portal operations ===
  const addPortal = useCallback(
    (data: Omit<Portal, "id" | "createdAt">) => {
      const id = generateId();
      const newPortal: Portal = {
        ...data,
        id,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, portals: [...prev.portals, newPortal] }));
      apiCall((t) => api.post("/api/levemagi/portals", { id, ...data }, t));
      return newPortal;
    },
    [apiCall]
  );

  const updatePortal = useCallback(
    (id: string, data: Partial<Omit<Portal, "id" | "createdAt">>) => {
      setState((prev) => ({
        ...prev,
        portals: prev.portals.map((p) =>
          p.id === id ? { ...p, ...data } : p
        ),
      }));
      apiCall((t) => api.put(`/api/levemagi/portals/${id}`, data, t));
    },
    [apiCall]
  );

  const deletePortal = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        portals: prev.portals.filter((p) => p.id !== id),
      }));
      apiCall((t) => api.delete(`/api/levemagi/portals/${id}`, t));
    },
    [apiCall]
  );

  // === Resource operations ===
  const addResource = useCallback(
    (data: Omit<Resource, "id" | "createdAt">) => {
      const id = generateId();
      const newResource: Resource = {
        ...data,
        id,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        resources: [...prev.resources, newResource],
      }));
      apiCall((t) => api.post("/api/levemagi/resources", { id, ...data }, t));
      return newResource;
    },
    [apiCall]
  );

  const updateResource = useCallback(
    (id: string, data: Partial<Omit<Resource, "id" | "createdAt">>) => {
      setState((prev) => ({
        ...prev,
        resources: prev.resources.map((r) =>
          r.id === id ? { ...r, ...data } : r
        ),
      }));
      apiCall((t) => api.put(`/api/levemagi/resources/${id}`, data, t));
    },
    [apiCall]
  );

  const deleteResource = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        resources: prev.resources.filter((r) => r.id !== id),
      }));
      apiCall((t) => api.delete(`/api/levemagi/resources/${id}`, t));
    },
    [apiCall]
  );

  // === Tag operations ===
  const addTag = useCallback(
    (name: string) => {
      const id = generateId();
      const newTag: Tag = {
        id,
        name,
        isFavorite: false,
      };
      setState((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
      apiCall((t) =>
        api.post("/api/levemagi/tags", { id, name, isFavorite: false }, t)
      );
      return newTag;
    },
    [apiCall]
  );

  const deleteTag = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        tags: prev.tags.filter((t) => t.id !== id),
      }));
      apiCall((t) => api.delete(`/api/levemagi/tags/${id}`, t));
    },
    [apiCall]
  );

  // === Gacha ===
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
    apiCall((t) => api.post("/api/levemagi/user/gacha", {}, t));
    return item;
  }, [apiCall, state.userData.gachaTickets]);

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
    // Gacha
    doGacha,
  };
}
