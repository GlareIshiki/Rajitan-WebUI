/**
 * Rajitan API client for communicating with the Discord bot's FastAPI backend.
 * Handles snake_case <-> camelCase conversion automatically.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_RAJITAN_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// === Case conversion utilities ===

const SNAKE_TO_CAMEL_SPECIAL: Record<string, string> = {
  total_xp: "totalXP",
};

const CAMEL_TO_SNAKE_SPECIAL: Record<string, string> = {
  totalXP: "total_xp",
};

function snakeToCamelKey(key: string): string {
  if (SNAKE_TO_CAMEL_SPECIAL[key]) return SNAKE_TO_CAMEL_SPECIAL[key];
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnakeKey(key: string): string {
  if (CAMEL_TO_SNAKE_SPECIAL[key]) return CAMEL_TO_SNAKE_SPECIAL[key];
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function deepSnakeToCamel(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(deepSnakeToCamel);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        snakeToCamelKey(k),
        deepSnakeToCamel(v),
      ]),
    );
  }
  return obj;
}

function deepCamelToSnake(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(deepCamelToSnake);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        camelToSnakeKey(k),
        deepCamelToSnake(v),
      ]),
    );
  }
  return obj;
}

/**
 * Fetch wrapper with auth token, error handling, and case conversion.
 * - Request bodies are converted from camelCase to snake_case
 * - Response bodies are converted from snake_case to camelCase
 */
export async function fetchAPI<T = unknown>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string;
  } = {},
): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(deepCamelToSnake(body)) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new ApiError(res.status, text);
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json();
  return deepSnakeToCamel(json) as T;
}

/**
 * Upload a file via multipart/form-data.
 * Response JSON is converted from snake_case to camelCase.
 */
export async function uploadFileAPI<T = unknown>(
  path: string,
  file: File,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new ApiError(res.status, text);
  }

  const json = await res.json();
  return deepSnakeToCamel(json) as T;
}

/** Convenience methods */
export const api = {
  get: <T>(path: string, token?: string) =>
    fetchAPI<T>(path, { token }),

  post: <T>(path: string, body: unknown, token?: string) =>
    fetchAPI<T>(path, { method: "POST", body, token }),

  put: <T>(path: string, body: unknown, token?: string) =>
    fetchAPI<T>(path, { method: "PUT", body, token }),

  delete: <T>(path: string, token?: string) =>
    fetchAPI<T>(path, { method: "DELETE", token }),

  uploadFile: <T>(path: string, file: File, token?: string) =>
    uploadFileAPI<T>(path, file, token),
};
