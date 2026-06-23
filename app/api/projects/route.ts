import { NextRequest, NextResponse } from "next/server";
import { getDatabases, DATABASE_ID, COLLECTIONS, Query, normalise, parseJson, ID } from "@/lib/appwrite";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

function deserialise(doc: Record<string, unknown>) {
  return {
    ...normalise(doc as Parameters<typeof normalise>[0]),
    tags: parseJson<string[]>(doc.tags as string, []),
  };
}

export async function GET(req: NextRequest) {
  try {
    const db = getDatabases();
    const result = await db.listDocuments(DATABASE_ID, COLLECTIONS.PROJECTS, [
      Query.limit(100),
    ]);

    const docs = result.documents
      .map((d) => deserialise(d as Record<string, unknown>))
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    return NextResponse.json(docs);
  } catch (err: any) {
    console.error("Projects GET Error:", err.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const db = getDatabases();

    const payload = {
      title: body.title,
      description: body.description || "",
      icon: (body.icon || "").slice(0, 10),
      imageUrl: body.imageUrl || "",
      gradient: body.gradient || "",
      tags: Array.isArray(body.tags) ? JSON.stringify(body.tags) : "[]",
      live: body.live || "",
      github: body.github || "",
      featured: !!body.featured,
      stars: parseInt(body.stars) || 0,
      order: parseInt(body.order) || 0,
    };

    const doc = await db.createDocument(DATABASE_ID, COLLECTIONS.PROJECTS, ID.unique(), payload);
    return NextResponse.json(deserialise(doc as Record<string, unknown>), { status: 201 });
  } catch (err: any) {
    console.error("Project POST Error:", err.message || err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
