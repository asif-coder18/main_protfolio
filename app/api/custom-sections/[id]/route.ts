import { NextRequest, NextResponse } from "next/server";
import { getDatabases, DATABASE_ID, COLLECTIONS, normalise, parseJson } from "@/lib/appwrite";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import type { CustomSection, Block } from "../route";

function deserialise(doc: Record<string, unknown>): CustomSection {
  const n = normalise(doc as Parameters<typeof normalise>[0]);
  return {
    _id:       n._id,
    sectionId: String(n.sectionId ?? ""),
    label:     String(n.label     ?? "Untitled"),
    order:     Number(n.order     ?? 99),
    visible:   n.visible !== false,
    bgColor:   String(n.bgColor   ?? ""),
    blocks:    parseJson<Block[]>(n.blocks as string, []),
  };
}

function buildPayload(body: Partial<CustomSection>) {
  return {
    sectionId: body.sectionId || "section",
    label:     body.label     || "Untitled Section",
    order:     Number(body.order) || 99,
    visible:   body.visible !== false,
    bgColor:   body.bgColor   || "",
    blocks:    JSON.stringify(Array.isArray(body.blocks) ? body.blocks : []),
  };
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDatabases();
    const doc = await db.getDocument(DATABASE_ID, COLLECTIONS.CUSTOM_SECTIONS, id);
    return NextResponse.json(deserialise(doc as Record<string, unknown>));
  } catch (err: unknown) {
    const e = err as { code?: number };
    if (e?.code === 404) return NextResponse.json({ error: "Not found" }, { status: 404 });
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
    const doc = await db.updateDocument(
      DATABASE_ID, COLLECTIONS.CUSTOM_SECTIONS, id, buildPayload(body)
    );
    return NextResponse.json(deserialise(doc as Record<string, unknown>));
  } catch (err) {
    const e = err as { message?: string };
    console.error("custom-sections PUT:", e.message);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const db = getDatabases();
    await db.deleteDocument(DATABASE_ID, COLLECTIONS.CUSTOM_SECTIONS, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
