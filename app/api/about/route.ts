import { NextRequest, NextResponse } from "next/server";
import { getDatabases, DATABASE_ID, COLLECTIONS, Query, normalise, parseJson } from "@/lib/appwrite";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

function deserialise(doc: Record<string, unknown>) {
  const extra = parseJson<Record<string, unknown>>(doc.extraData as string, {});
  return {
    ...normalise(doc as Parameters<typeof normalise>[0]),
    bio: parseJson<string[]>(doc.bio as string, []),
    stats: parseJson(extra.stats as string | undefined, []),
    highlights: parseJson(extra.highlights as string | undefined, []),
    githubUrl: (extra.githubUrl as string) ?? "",
    linkedinUrl: (extra.linkedinUrl as string) ?? "",
    statusBadge: (extra.statusBadge as string) ?? "Open to opportunities",
  };
}

export async function GET() {
  try {
    const db = getDatabases();
    const result = await db.listDocuments(DATABASE_ID, COLLECTIONS.ABOUT, [Query.limit(1)]);
    if (result.total === 0) return NextResponse.json({});
    return NextResponse.json(deserialise(result.documents[0] as Record<string, unknown>));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const db = getDatabases();

    // Separate fields that go into extraData
    const { githubUrl, linkedinUrl, statusBadge, stats, highlights, _id, createdAt, updatedAt, ...rest } = body;

    const extraData = JSON.stringify({ githubUrl, linkedinUrl, statusBadge, stats, highlights });
    const payload = {
      ...rest,
      bio: Array.isArray(rest.bio) ? JSON.stringify(rest.bio) : rest.bio,
      extraData,
    };

    // Remove undefined / null system keys
    const clean = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined)
    );

    const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.ABOUT, [Query.limit(1)]);

    let doc;
    if (existing.total > 0) {
      doc = await db.updateDocument(DATABASE_ID, COLLECTIONS.ABOUT, existing.documents[0].$id, clean);
    } else {
      doc = await db.createDocument(DATABASE_ID, COLLECTIONS.ABOUT, "unique()", clean);
    }

    return NextResponse.json(deserialise(doc as Record<string, unknown>));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
