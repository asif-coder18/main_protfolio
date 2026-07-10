import { NextRequest, NextResponse } from "next/server";
import { getDatabases, DATABASE_ID, COLLECTIONS, Query, normalise, ID } from "@/lib/appwrite";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

export interface SectionConfig {
  id: string;        // "hero" | "about" | "skills" | "projects" | "experience" | "contact"
  label: string;     // display name
  order: number;     // 0-based render order
  visible: boolean;  // show/hide on frontend
}

// Default order — used if DB has nothing yet
const DEFAULTS: SectionConfig[] = [
  { id: "hero",       label: "Hero",       order: 0, visible: true },
  { id: "about",      label: "About",      order: 1, visible: true },
  { id: "skills",     label: "Skills",     order: 2, visible: true },
  { id: "projects",   label: "Projects",   order: 3, visible: true },
  { id: "experience", label: "Experience", order: 4, visible: true },
  { id: "contact",    label: "Contact",    order: 5, visible: true },
];

function deserialise(doc: Record<string, unknown>): SectionConfig {
  const n = normalise(doc as Parameters<typeof normalise>[0]);
  return {
    id:      String(n.id      ?? ""),
    label:   String(n.label   ?? ""),
    order:   Number(n.order   ?? 0),
    visible: n.visible !== false,
  };
}

export async function GET() {
  try {
    const db = getDatabases();
    const result = await db.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SECTION_SETTINGS,
      [Query.orderAsc("order"), Query.limit(20)]
    );

    if (result.total === 0) {
      return NextResponse.json(DEFAULTS);
    }

    return NextResponse.json(
      result.documents.map((d) => deserialise(d as Record<string, unknown>))
    );
  } catch (err) {
    console.error("section-settings GET:", err);
    // Always fall back to defaults so the frontend never breaks
    return NextResponse.json(DEFAULTS);
  }
}

export async function PUT(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const sections: SectionConfig[] = await req.json();
    const db = getDatabases();

    // Delete all existing rows then recreate (simple replace strategy)
    const existing = await db.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SECTION_SETTINGS,
      [Query.limit(50)]
    );
    await Promise.all(
      existing.documents.map((d) =>
        db.deleteDocument(DATABASE_ID, COLLECTIONS.SECTION_SETTINGS, d.$id)
      )
    );

    await Promise.all(
      sections.map((s) =>
        db.createDocument(DATABASE_ID, COLLECTIONS.SECTION_SETTINGS, ID.unique(), {
          id:      s.id,
          label:   s.label,
          order:   s.order,
          visible: s.visible,
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    const e = err as { message?: string };
    console.error("section-settings PUT:", e.message);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
