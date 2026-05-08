import { Client, Databases, Storage, ID, Query } from "node-appwrite";

// ── Config ────────────────────────────────────────────────────────────────────
export const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
export const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;
export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;

export const COLLECTIONS = {
  ABOUT: "about",
  ADMIN: "admin",
  CONTACT_INFO: "contact_info",
  EXPERIENCE: "experience",
  MESSAGES: "messages",
  PROJECTS: "projects",
  SKILL_CATEGORIES: "skill_categories",
  TECH_ICONS: "tech_icons",
} as const;

export const STORAGE_BUCKET_ID = "portfolio_uploads";

// ── Client singleton ──────────────────────────────────────────────────────────
let _databases: Databases | null = null;
let _storage: Storage | null = null;

function getClient() {
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);
  return client;
}

export function getDatabases(): Databases {
  if (!_databases) {
    _databases = new Databases(getClient());
  }
  return _databases;
}

export function getStorage(): Storage {
  if (!_storage) {
    _storage = new Storage(getClient());
  }
  return _storage;
}

export { ID, Query };

// ── Type helpers ──────────────────────────────────────────────────────────────

/** Appwrite documents always have $id, $createdAt, $updatedAt */
export type AppwriteDoc<T> = T & {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
};

/**
 * Normalise an Appwrite document to look like a MongoDB document.
 * Maps $id → _id and strips Appwrite system keys.
 */
export function normalise<T extends Record<string, unknown>>(
  doc: AppwriteDoc<T>
): T & { _id: string; createdAt: string; updatedAt: string } {
  const { $id, $createdAt, $updatedAt, ...rest } = doc as Record<string, unknown>;
  // Remove other Appwrite system keys
  const clean = Object.fromEntries(
    Object.entries(rest).filter(([k]) => !k.startsWith("$"))
  );
  return {
    ...(clean as T),
    _id: $id as string,
    createdAt: $createdAt as string,
    updatedAt: $updatedAt as string,
  };
}

/** Parse a JSON string field safely */
export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
