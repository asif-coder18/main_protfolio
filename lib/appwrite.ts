import { Client, Databases, Storage, ID, Query } from "node-appwrite";

// ── Config ────────────────────────────────────────────────────────────────────
export const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
export const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "69fc9801002376d91970";
const API_KEY = process.env.APPWRITE_API_KEY || "standard_b7338cde001c1775d05adf125eb4596abb119c9c7089c1726a8b354306f8c9a77da1408692182aa5d5df5a9063f6c75b0411a47ca6721c7dc62d0e736680c6de7937998922096bb32877c909c6be26deaa72c2c463df55611f45fd29bf2a73fe4b8c485c3b5ad3bbd6cec282afd6e7c84f534eb4b34bf142d2de8e1593bd92f1";
export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "69fc991e002fe5327e37";

export const COLLECTIONS = {
  ABOUT: "about",
  ADMIN: "admin",
  CONTACT_INFO: "contact_info",
  EXPERIENCE: "experience",
  MESSAGES: "messages",
  PROJECTS: "projects",
  PROJECT_SETTINGS: "project_settings",
  SECTION_SETTINGS: "section_settings",
  CUSTOM_SECTIONS: "custom_sections",
  SKILL_CATEGORIES: "skill_categories",
  SKILL_META: "skill_meta",
  TECH_ICONS: "tech_icons",
  LOADER_SETTINGS: "loader_settings",
  BRAND_SETTINGS: "brand_settings",
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
