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

export async function GET() {
  try {
    const db = getDatabases();
    const result = await db.listDocuments(DATABASE_ID, COLLECTIONS.EXPERIENCE, [
      Query.orderAsc("order"),
      Query.limit(100),
    ]);
    return NextResponse.json(result.documents.map((d) => deserialise(d as Record<string, unknown>)));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const db = getDatabases();

    const { _id, createdAt, updatedAt, ...rest } = body;
    const payload = {
      ...rest,
      tags: Array.isArray(rest.tags) ? JSON.stringify(rest.tags) : rest.tags ?? "[]",
      keyFocus: Array.isArray(rest.keyFocus) ? JSON.stringify(rest.keyFocus) : rest.keyFocus ?? "[]",
    };

    const doc = await db.createDocument(DATABASE_ID, COLLECTIONS.EXPERIENCE, ID.unique(), payload);
    return NextResponse.json(deserialise(doc as Record<string, unknown>), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
