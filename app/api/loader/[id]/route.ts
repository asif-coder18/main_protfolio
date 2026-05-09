import { NextRequest, NextResponse } from "next/server";
import {
  getDatabases,
  DATABASE_ID,
  COLLECTIONS,
  Query,
  normalise,
} from "@/lib/appwrite";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import type { LoaderSettings } from "../route";

function deserialise(doc: Record<string, unknown>): LoaderSettings {
  return normalise(doc as Parameters<typeof normalise>[0]) as unknown as LoaderSettings;
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

// GET /api/loader/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDatabases();
    const doc = await db.getDocument(DATABASE_ID, COLLECTIONS.LOADER_SETTINGS, id);
    return NextResponse.json(deserialise(doc as Record<string, unknown>));
  } catch (err: unknown) {
    const e = err as { code?: number };
    if (e?.code === 404) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT /api/loader/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await req.json();
    const db = getDatabases();

    // If activating this one, deactivate all others
    if (body.isActive) {
      const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.LOADER_SETTINGS, [
        Query.equal("isActive", true),
        Query.limit(50),
      ]);
      await Promise.all(
        existing.documents
          .filter((d) => d.$id !== id)
          .map((d) =>
            db.updateDocument(DATABASE_ID, COLLECTIONS.LOADER_SETTINGS, d.$id, { isActive: false })
          )
      );
    }

    const payload = buildPayload(body);
    const doc = await db.updateDocument(DATABASE_ID, COLLECTIONS.LOADER_SETTINGS, id, payload);
    return NextResponse.json(deserialise(doc as Record<string, unknown>));
  } catch (err) {
    const e = err as { message?: string; code?: number };
    console.error("Loader PUT error:", e.message || err);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

// DELETE /api/loader/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const db = getDatabases();
    await db.deleteDocument(DATABASE_ID, COLLECTIONS.LOADER_SETTINGS, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Loader DELETE error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
