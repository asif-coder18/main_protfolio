import { NextRequest, NextResponse } from "next/server";
import { getDatabases, DATABASE_ID, COLLECTIONS, Query, normalise, parseJson, ID } from "@/lib/appwrite";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

function deserialiseCategory(doc: Record<string, unknown>) {
  return {
    ...normalise(doc as Parameters<typeof normalise>[0]),
    skills: parseJson(doc.skills as string, []),
  };
}

function deserialiseTechIcon(doc: Record<string, unknown>) {
  return normalise(doc as Parameters<typeof normalise>[0]);
}

export async function GET() {
  try {
    const db = getDatabases();
    const [catResult, iconResult] = await Promise.all([
      db.listDocuments(DATABASE_ID, COLLECTIONS.SKILL_CATEGORIES, [Query.orderAsc("order"), Query.limit(50)]),
      db.listDocuments(DATABASE_ID, COLLECTIONS.TECH_ICONS, [Query.orderAsc("order"), Query.limit(50)]),
    ]);

    return NextResponse.json({
      categories: catResult.documents.map((d) => deserialiseCategory(d as Record<string, unknown>)),
      techIcons: iconResult.documents.map((d) => deserialiseTechIcon(d as Record<string, unknown>)),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const { categories, techIcons } = await req.json();
    const db = getDatabases();

    // Replace all categories
    if (Array.isArray(categories)) {
      const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.SKILL_CATEGORIES, [Query.limit(100)]);
      await Promise.all(existing.documents.map((d) => db.deleteDocument(DATABASE_ID, COLLECTIONS.SKILL_CATEGORIES, d.$id)));
      await Promise.all(
        categories.map((cat: Record<string, unknown>) => {
          const { _id, createdAt, updatedAt, ...rest } = cat;
          return db.createDocument(DATABASE_ID, COLLECTIONS.SKILL_CATEGORIES, ID.unique(), {
            ...rest,
            skills: Array.isArray(rest.skills) ? JSON.stringify(rest.skills) : rest.skills ?? "[]",
          });
        })
      );
    }

    // Replace all tech icons
    if (Array.isArray(techIcons)) {
      const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.TECH_ICONS, [Query.limit(100)]);
      await Promise.all(existing.documents.map((d) => db.deleteDocument(DATABASE_ID, COLLECTIONS.TECH_ICONS, d.$id)));
      await Promise.all(
        techIcons.map((icon: Record<string, unknown>) => {
          const { _id, createdAt, updatedAt, ...rest } = icon;
          return db.createDocument(DATABASE_ID, COLLECTIONS.TECH_ICONS, ID.unique(), rest);
        })
      );
    }

    // Return updated data
    const [catResult, iconResult] = await Promise.all([
      db.listDocuments(DATABASE_ID, COLLECTIONS.SKILL_CATEGORIES, [Query.orderAsc("order"), Query.limit(50)]),
      db.listDocuments(DATABASE_ID, COLLECTIONS.TECH_ICONS, [Query.orderAsc("order"), Query.limit(50)]),
    ]);

    return NextResponse.json({
      categories: catResult.documents.map((d) => deserialiseCategory(d as Record<string, unknown>)),
      techIcons: iconResult.documents.map((d) => deserialiseTechIcon(d as Record<string, unknown>)),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
