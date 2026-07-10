import { NextRequest, NextResponse } from "next/server";
import { getDatabases, DATABASE_ID, COLLECTIONS, Query, normalise, parseJson, ID } from "@/lib/appwrite";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

// ── Block types ───────────────────────────────────────────────────────────────
export type BlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "button"
  | "card"
  | "social"
  | "divider"
  | "grid";

export interface Block {
  id: string;
  type: BlockType;
  // heading
  text?: string;
  level?: "h1" | "h2" | "h3";
  align?: "left" | "center" | "right";
  // image
  src?: string;
  alt?: string;
  // button
  label?: string;
  href?: string;
  variant?: "primary" | "outline";
  // card
  title?: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  // social
  platform?: string;
  username?: string;
  url?: string;
  // divider
  style?: "solid" | "dashed" | "dotted";
  // grid
  columns?: 2 | 3;
  cards?: Block[];
}

export interface CustomSection {
  _id?: string;
  sectionId: string;   // unique slug  e.g. "certifications"
  label: string;       // display name e.g. "Certifications"
  order: number;
  visible: boolean;
  bgColor: string;     // Tailwind bg class or hex
  blocks: Block[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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
    sectionId: body.sectionId || "section-" + Date.now(),
    label:     body.label     || "Untitled Section",
    order:     Number(body.order) || 99,
    visible:   body.visible !== false,
    bgColor:   body.bgColor   || "",
    blocks:    JSON.stringify(Array.isArray(body.blocks) ? body.blocks : []),
  };
}

// ── Routes ────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const db = getDatabases();
    const result = await db.listDocuments(
      DATABASE_ID, COLLECTIONS.CUSTOM_SECTIONS,
      [Query.orderAsc("order"), Query.limit(50)]
    );
    return NextResponse.json(
      result.documents.map((d) => deserialise(d as Record<string, unknown>))
    );
  } catch (err) {
    console.error("custom-sections GET:", err);
    return NextResponse.json([], { status: 200 }); // always return array
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const db = getDatabases();
    const doc = await db.createDocument(
      DATABASE_ID, COLLECTIONS.CUSTOM_SECTIONS, ID.unique(), buildPayload(body)
    );
    return NextResponse.json(deserialise(doc as Record<string, unknown>), { status: 201 });
  } catch (err) {
    const e = err as { message?: string };
    console.error("custom-sections POST:", e.message);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
