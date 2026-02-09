"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import type {
  Persona,
  PersonaCreate,
  PersonaUpdate,
  PersonaListResponse,
} from "@/types/persona";

const POLL_INTERVAL = 30_000;

export function usePersonas(guildId: string | null, token: string | undefined) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activePersonaId, setActivePersonaId] = useState("");
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPersonas = useCallback(async () => {
    if (!guildId || !token) return;
    try {
      const data = await api.get<PersonaListResponse>(
        `/api/bot/guilds/${guildId}/personas`,
        token
      );
      setPersonas(data.personas);
      setActivePersonaId(data.activePersonaId);
    } catch (e) {
      console.error("Failed to fetch personas:", e);
    } finally {
      setLoading(false);
    }
  }, [guildId, token]);

  // Initial fetch + polling
  useEffect(() => {
    setLoading(true);
    fetchPersonas();

    pollRef.current = setInterval(fetchPersonas, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchPersonas]);

  const createPersona = useCallback(
    async (data: PersonaCreate): Promise<Persona | null> => {
      if (!guildId || !token) return null;
      try {
        const created = await api.post<Persona>(
          `/api/bot/guilds/${guildId}/personas`,
          data,
          token
        );
        setPersonas((prev) => [...prev, created]);
        return created;
      } catch (e) {
        console.error("Failed to create persona:", e);
        return null;
      }
    },
    [guildId, token]
  );

  const updatePersona = useCallback(
    async (personaId: string, data: PersonaUpdate): Promise<boolean> => {
      if (!guildId || !token) return false;
      try {
        const updated = await api.put<Persona>(
          `/api/bot/guilds/${guildId}/personas/${personaId}`,
          data,
          token
        );
        setPersonas((prev) =>
          prev.map((p) => (p.id === personaId ? updated : p))
        );
        return true;
      } catch (e) {
        console.error("Failed to update persona:", e);
        return false;
      }
    },
    [guildId, token]
  );

  const deletePersona = useCallback(
    async (personaId: string): Promise<boolean> => {
      if (!guildId || !token) return false;
      try {
        await api.delete(`/api/bot/guilds/${guildId}/personas/${personaId}`, token);
        setPersonas((prev) => prev.filter((p) => p.id !== personaId));
        if (activePersonaId === personaId) {
          setActivePersonaId("preset_default");
        }
        return true;
      } catch (e) {
        console.error("Failed to delete persona:", e);
        return false;
      }
    },
    [guildId, token, activePersonaId]
  );

  const setActivePersona = useCallback(
    async (personaId: string): Promise<boolean> => {
      if (!guildId || !token) return false;
      try {
        await api.put(
          `/api/bot/guilds/${guildId}/personas/active`,
          { personaId },
          token
        );
        setActivePersonaId(personaId);
        return true;
      } catch (e) {
        console.error("Failed to set active persona:", e);
        return false;
      }
    },
    [guildId, token]
  );

  return {
    personas,
    activePersonaId,
    loading,
    createPersona,
    updatePersona,
    deletePersona,
    setActivePersona,
    refresh: fetchPersonas,
  };
}
