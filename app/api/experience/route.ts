import { NextRequest, NextResponse } from "next/server";
import { getDatabases, DATABASE_ID, COLLECTIONS, Query, normalise, parseJson, ID } from "@/lib/appwrite";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

function deserialise(doc: Record<string, unknown>) {
  return {
    ...normalise(doc as Parameters<typeof normalise>[0]),
    tags: parseJson<string[]>(doc.tags as string, []),
    keyFocus: parseJson<string[]>(doc.keyFocus as string, []),
  };
}

export async function GET(req: NextRequest) {
  try {
    const db = getDatabases();
    const result = await db.listDocuments(DATABASE_ID, COLLECTIONS.EXPERIENCE, [
      Query.limit(100),
    ]);
    
    const docs = result.documents
      .map((d) => deserialise(d as Record<string, unknown>))
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    return NextResponse.json(docs);
  } catch (err: any) {
    console.error("Experience GET Error:", err.message || err);
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
      type: body.type || "work",
      title: body.title,
      company: body.company,
      location: body.location || "",
      period: body.period || "",
      description: body.description || "",
      tags: Array.isArray(body.tags) ? JSON.stringify(body.tags) : "[]",
      keyFocus: Array.isArray(body.keyFocus) ? JSON.stringify(body.keyFocus) : "[]",
      current: !!body.current,
      order: parseInt(body.order) || 0,
    };

    const doc = await db.createDocument(DATABASE_ID, COLLECTIONS.EXPERIENCE, ID.unique(), payload);
    return NextResponse.json(deserialise(doc as Record<string, unknown>), { status: 201 });
  } catch (err: any) {
    console.error("Experience POST Error:", err.message || err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
