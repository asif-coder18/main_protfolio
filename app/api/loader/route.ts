import { NextRequest, NextResponse } from "next/server";
import {
  getDatabases,
  DATABASE_ID,
  COLLECTIONS,
  Query,
  normalise,
  ID,
} from "@/lib/appwrite";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

export interface LoaderSettings {
  _id?: string;
  name: string;
  title: string;
  subtitle: string;
  subtitleColor: string;
  subtitleSize: string;
  subtitleWeight: string;
  imageUrl: string;
  loaderType: string;
  progressColor: string;
  bgGradient: string;
  backgroundStyle: string;
  imageShape: string;
  imageSize: number;
  duration: number;
  showProgressBar: boolean;
  showPercentage: boolean;
  allowSkip: boolean;
  customCss: string;
  template: string;
  isActive: boolean;
  order: number;
}

function deserialise(doc: Record<string, unknown>): LoaderSettings {
  return normalise(doc as Parameters<typeof normalise>[0]) as unknown as LoaderSettings;
}

// GET /api/loader — returns all loaders; ?active=true returns only the active one
export async function GET(req: NextRequest) {
  try {
    const db = getDatabases();
    const activeOnly = req.nextUrl.searchParams.get("active") === "true";

    const queries = activeOnly
      ? [Query.equal("isActive", true), Query.limit(1)]
      : [Query.orderAsc("order"), Query.limit(50)];

    const result = await db.listDocuments(DATABASE_ID, COLLECTIONS.LOADER_SETTINGS, queries);
    const docs = result.documents.map((d) => deserialise(d as Record<string, unknown>));

    if (activeOnly) {
      return NextResponse.json(docs[0] ?? null);
    }
    return NextResponse.json(docs);
  } catch (err) {
    console.error("Loader GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/loader — create a new loader config
export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const db = getDatabases();

    // If this one is active, deactivate all others first
    if (body.isActive) {
      const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.LOADER_SETTINGS, [
        Query.equal("isActive", true),
        Query.limit(50),
      ]);
      await Promise.all(
        existing.documents.map((d) =>
          db.updateDocument(DATABASE_ID, COLLECTIONS.LOADER_SETTINGS, d.$id, { isActive: false })
        )
      );
    }

    const payload = buildPayload(body);
    const doc = await db.createDocument(DATABASE_ID, COLLECTIONS.LOADER_SETTINGS, ID.unique(), payload);
    return NextResponse.json(deserialise(doc as Record<string, unknown>), { status: 201 });
  } catch (err) {
    const e = err as { message?: string; code?: number };
    console.error("Loader POST error:", e.message || err);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

function buildPayload(body: Partial<LoaderSettings>) {
  return {
    name: body.name || "Untitled Loader",
    title: body.title || "",
    subtitle: body.subtitle || "",
    subtitleColor: body.subtitleColor || "#9ca3af",
    subtitleSize: body.subtitleSize || "sm",
    subtitleWeight: body.subtitleWeight || "normal",
    imageUrl: body.imageUrl || "/profile.jpg",
    loaderType: body.loaderType || "progress-bar",
    progressColor: body.progressColor || "#8b5cf6",
    bgGradient: body.bgGradient || "",
    backgroundStyle: body.backgroundStyle || "none",
    imageShape: body.imageShape || "rounded-2xl",
    imageSize: Number(body.imageSize) || 120,
    duration: Math.max(100, Number(body.duration) || 2000),
    showProgressBar: body.showProgressBar !== false,
    showPercentage: !!body.showPercentage,
    allowSkip: !!body.allowSkip,
    customCss: body.customCss || "",
    template: body.template || "default",
    isActive: !!body.isActive,
    order: Number(body.order) || 0,
  };
}
