import { NextRequest, NextResponse } from "next/server";
import { getDatabases, DATABASE_ID, COLLECTIONS, Query, normalise, parseJson, ID } from "@/lib/appwrite";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

export interface SkillMeta {
  badge: string;
  heading: string;
  highlight: string;
  description: string;
}

const DEFAULT_META: SkillMeta = {
  badge: "Skills",
  heading: "My Tech Stack",
  highlight: "Tech Stack",
  description: "Technologies I work with to build modern, performant web applications.",
};

function deserialiseCategory(doc: Record<string, unknown>) {
  return {
    ...normalise(doc as Parameters<typeof normalise>[0]),
    skills: parseJson(doc.skills as string, []),
  };
}

function deserialiseTechIcon(doc: Record<string, unknown>) {
  const normalised = normalise(doc as Parameters<typeof normalise>[0]);
  return {
    ...normalised,
    icon: normalised.icon || normalised.symbol || "",
  };
}

export async function GET() {
  try {
    const db = getDatabases();
    const [catResult, iconResult, metaResult] = await Promise.all([
      db.listDocuments(DATABASE_ID, COLLECTIONS.SKILL_CATEGORIES, [Query.orderAsc("order"), Query.limit(50)]),
      db.listDocuments(DATABASE_ID, COLLECTIONS.TECH_ICONS, [Query.orderAsc("order"), Query.limit(50)]),
      db.listDocuments(DATABASE_ID, COLLECTIONS.SKILL_META, [Query.limit(1)]).catch(() => ({ documents: [] })),
    ]);

    const rawMeta = metaResult.documents[0] as Record<string, unknown> | undefined;
    const skillMeta: SkillMeta = rawMeta
      ? { ...DEFAULT_META, ...normalise(rawMeta as Parameters<typeof normalise>[0]) }
      : DEFAULT_META;

    return NextResponse.json({
      categories: catResult.documents.map((d) => deserialiseCategory(d as Record<string, unknown>)),
      techIcons: iconResult.documents.map((d) => deserialiseTechIcon(d as Record<string, unknown>)),
      skillMeta,
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
    const { categories, techIcons, skillMeta } = await req.json();
    const db = getDatabases();

    // Save skill meta (upsert — single document)
    if (skillMeta) {
      const metaPayload = {
        badge: skillMeta.badge || DEFAULT_META.badge,
        heading: skillMeta.heading || DEFAULT_META.heading,
        highlight: skillMeta.highlight || DEFAULT_META.highlight,
        description: skillMeta.description || DEFAULT_META.description,
      };
      const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.SKILL_META, [Query.limit(1)]).catch(() => ({ documents: [] }));
      if (existing.documents.length > 0) {
        await db.updateDocument(DATABASE_ID, COLLECTIONS.SKILL_META, existing.documents[0].$id, metaPayload);
      } else {
        await db.createDocument(DATABASE_ID, COLLECTIONS.SKILL_META, ID.unique(), metaPayload);
      }
    }

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
        techIcons.map((iconData: any) => {
          const { _id, createdAt, updatedAt, icon, symbol, ...rest } = iconData;
          return db.createDocument(DATABASE_ID, COLLECTIONS.TECH_ICONS, ID.unique(), {
            ...rest,
            symbol: icon || symbol || "",
          });
        })
      );
    }

    // Return updated data
    const [catResult, iconResult, metaResult] = await Promise.all([
      db.listDocuments(DATABASE_ID, COLLECTIONS.SKILL_CATEGORIES, [Query.orderAsc("order"), Query.limit(50)]),
      db.listDocuments(DATABASE_ID, COLLECTIONS.TECH_ICONS, [Query.orderAsc("order"), Query.limit(50)]),
      db.listDocuments(DATABASE_ID, COLLECTIONS.SKILL_META, [Query.limit(1)]).catch(() => ({ documents: [] })),
    ]);

    const rawMeta = metaResult.documents[0] as Record<string, unknown> | undefined;
    const returnedMeta: SkillMeta = rawMeta
      ? { ...DEFAULT_META, ...normalise(rawMeta as Parameters<typeof normalise>[0]) }
      : DEFAULT_META;

    return NextResponse.json({
      categories: catResult.documents.map((d) => deserialiseCategory(d as Record<string, unknown>)),
      techIcons: iconResult.documents.map((d) => deserialiseTechIcon(d as Record<string, unknown>)),
      skillMeta: returnedMeta,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
