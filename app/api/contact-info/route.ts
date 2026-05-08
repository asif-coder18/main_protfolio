import { NextRequest, NextResponse } from "next/server";
import { getDatabases, DATABASE_ID, COLLECTIONS, Query, normalise, parseJson } from "@/lib/appwrite";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

function deserialise(doc: Record<string, unknown>) {
  return {
    ...normalise(doc as Parameters<typeof normalise>[0]),
    socialLinks: parseJson(doc.socialLinks as string, []),
  };
}

export async function GET() {
  try {
    const db = getDatabases();
    const result = await db.listDocuments(DATABASE_ID, COLLECTIONS.CONTACT_INFO, [Query.limit(1)]);
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

    const { _id, createdAt, updatedAt, ...rest } = body;
    const payload = {
      ...rest,
      socialLinks: Array.isArray(rest.socialLinks)
        ? JSON.stringify(rest.socialLinks)
        : rest.socialLinks,
    };

    const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.CONTACT_INFO, [Query.limit(1)]);

    let doc;
    if (existing.total > 0) {
      doc = await db.updateDocument(DATABASE_ID, COLLECTIONS.CONTACT_INFO, existing.documents[0].$id, payload);
    } else {
      doc = await db.createDocument(DATABASE_ID, COLLECTIONS.CONTACT_INFO, "unique()", payload);
    }

    return NextResponse.json(deserialise(doc as Record<string, unknown>));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
