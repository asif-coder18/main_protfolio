import { NextRequest, NextResponse } from "next/server";
import { getDatabases, DATABASE_ID, COLLECTIONS, normalise, parseJson } from "@/lib/appwrite";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

function deserialise(doc: Record<string, unknown>) {
  return {
    ...normalise(doc as Parameters<typeof normalise>[0]),
    tags: parseJson<string[]>(doc.tags as string, []),
    keyFocus: parseJson<string[]>(doc.keyFocus as string, []),
  };
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDatabases();
    const doc = await db.getDocument(DATABASE_ID, COLLECTIONS.EXPERIENCE, id);
    return NextResponse.json(deserialise(doc as Record<string, unknown>));
  } catch (err: unknown) {
    const e = err as { code?: number };
    if (e?.code === 404) return NextResponse.json({ error: "Not found" }, { status: 404 });
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
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

    const doc = await db.updateDocument(DATABASE_ID, COLLECTIONS.EXPERIENCE, id, payload);
    return NextResponse.json(deserialise(doc as Record<string, unknown>));
  } catch (err: any) {
    const e = err as { code?: number; message?: string };
    if (e?.code === 404) return NextResponse.json({ error: "Not found" }, { status: 404 });
    console.error("Experience PUT Error:", e.message || err);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const db = getDatabases();
    await db.deleteDocument(DATABASE_ID, COLLECTIONS.EXPERIENCE, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
