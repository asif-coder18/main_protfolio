import { NextRequest, NextResponse } from "next/server";
import { getDatabases, DATABASE_ID, COLLECTIONS, normalise } from "@/lib/appwrite";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await req.json();
    const db = getDatabases();

    // Only allow patching safe fields
    const allowed: Record<string, unknown> = {};
    if (typeof body.read === "boolean") allowed.read = body.read;

    const doc = await db.updateDocument(DATABASE_ID, COLLECTIONS.MESSAGES, id, allowed);
    return NextResponse.json(normalise(doc as Parameters<typeof normalise>[0]));
  } catch (err: unknown) {
    const e = err as { code?: number };
    if (e?.code === 404) return NextResponse.json({ error: "Not found" }, { status: 404 });
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const db = getDatabases();
    await db.deleteDocument(DATABASE_ID, COLLECTIONS.MESSAGES, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
