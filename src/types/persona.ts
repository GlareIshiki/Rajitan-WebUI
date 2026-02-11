export interface PersonalityTraits {
  friendliness: number;
  humor: number;
  energy: number;
  formality: number;
  helpfulness: number;
}

export interface Persona {
  id: string;
  guildId: string;
  name: string;
  displayName: string;
  description: string;
  systemPrompt: string;
  personalityTraits: PersonalityTraits;
  isPreset: boolean;
  isPublic: boolean;
  avatarUrl: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonaCreate {
  name: string;
  displayName?: string;
  description?: string;
  systemPrompt?: string;
  personalityTraits?: Partial<PersonalityTraits>;
  isPublic?: boolean;
}

export interface PersonaUpdate {
  name?: string;
  displayName?: string;
  description?: string;
  systemPrompt?: string;
  personalityTraits?: Partial<PersonalityTraits>;
  isPublic?: boolean;
}

export interface PersonaListResponse {
  personas: Persona[];
  activePersonaId: string;
}

export const DEFAULT_TRAITS: PersonalityTraits = {
  friendliness: 0.8,
  humor: 0.7,
  energy: 0.6,
  formality: 0.3,
  helpfulness: 0.9,
};

export const TRAIT_LABELS: Record<keyof PersonalityTraits, string> = {
  friendliness: "フレンドリーさ",
  humor: "ユーモア",
  energy: "エネルギー",
  formality: "フォーマリティ",
  helpfulness: "丁寧さ",
};
