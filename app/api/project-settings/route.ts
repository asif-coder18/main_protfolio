import { NextRequest, NextResponse } from "next/server";
import { getDatabases, DATABASE_ID, COLLECTIONS, Query, normalise, parseJson, ID } from "@/lib/appwrite";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

const DEFAULTS = {
  badgeText: "Projects",
  headingText: "Things I've Built",
  highlightedWord: "Built",
  description:
    "A selection of projects that showcase my skills and passion for building great products.",
  categories: [] as string[],
};

function deserialise(doc: Record<string, unknown>) {
  return {
    ...normalise(doc as Parameters<typeof normalise>[0]),
    categories: parseJson<string[]>(doc.categories as string, []),
  };
}

export async function GET() {
  try {
    const db = getDatabases();
    const result = await db.listDocuments(DATABASE_ID, COLLECTIONS.PROJECT_SETTINGS, [
      Query.limit(1),
    ]);

    if (result.documents.length === 0) {
      return NextResponse.json(DEFAULTS);
    }

    return NextResponse.json(deserialise(result.documents[0] as Record<string, unknown>));
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("Project Settings GET Error:", e.message || err);
    return NextResponse.json(DEFAULTS);
  }
}

export async function PUT(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const db = getDatabases();

    const payload = {
      badgeText: (body.badgeText || DEFAULTS.badgeText).slice(0, 100),
      headingText: (body.headingText || DEFAULTS.headingText).slice(0, 255),
      highlightedWord: (body.highlightedWord || DEFAULTS.highlightedWord).slice(0, 100),
      description: (body.description || DEFAULTS.description).slice(0, 1000),
      categories: Array.isArray(body.categories)
        ? JSON.stringify(body.categories)
        : "[]",
    };

    // Upsert: update existing doc or create new one
    const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.PROJECT_SETTINGS, [
      Query.limit(1),
    ]);

    let doc;
    if (existing.documents.length > 0) {
      doc = await db.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PROJECT_SETTINGS,
        existing.documents[0].$id,
        payload
      );
    } else {
      doc = await db.createDocument(
        DATABASE_ID,
        COLLECTIONS.PROJECT_SETTINGS,
        ID.unique(),
        payload
      );
    }

    return NextResponse.json(deserialise(doc as Record<string, unknown>));
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("Project Settings PUT Error:", e.message || err);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
