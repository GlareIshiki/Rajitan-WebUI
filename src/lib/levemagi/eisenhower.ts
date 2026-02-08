import type { PhaseId } from "./milestones";

export type EisenhowerQuadrant = "do_now" | "schedule" | "delegate" | "eliminate";

export interface EisenhowerClassification {
  quadrant: EisenhowerQuadrant;
  label: string;
  emoji: string;
  color: string;
}

function isUrgent(phaseId: PhaseId): boolean {
  return ["red", "deadline", "fire"].includes(phaseId);
}

function isImportant(priority: "high" | "medium" | "low"): boolean {
  return priority === "high";
}

export function classifyEisenhower(
  priority: "high" | "medium" | "low",
  phaseId: PhaseId
): EisenhowerClassification {
  const urgent = isUrgent(phaseId);
  const important = isImportant(priority);

  if (important && urgent)
    return { quadrant: "do_now", label: "今すぐやる", emoji: "🔥", color: "red" };
  if (important && !urgent)
    return { quadrant: "schedule", label: "余裕をもってやる", emoji: "🌿", color: "green" };
  if (!important && urgent)
    return { quadrant: "delegate", label: "任せる", emoji: "⚡", color: "yellow" };
  return { quadrant: "eliminate", label: "やらなくてよい", emoji: "🗑", color: "gray" };
}
