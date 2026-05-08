import { NextRequest, NextResponse } from "next/server";
import { getDatabases, DATABASE_ID, COLLECTIONS, Query, normalise, ID } from "@/lib/appwrite";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

// Public POST — contact form submission
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const db = getDatabases();
    const doc = await db.createDocument(DATABASE_ID, COLLECTIONS.MESSAGES, ID.unique(), {
      name,
      email,
      subject: subject ?? "",
      message,
      read: false,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Protected GET — admin views all messages
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const db = getDatabases();
    const result = await db.listDocuments(DATABASE_ID, COLLECTIONS.MESSAGES, [
      Query.orderDesc("$createdAt"),
      Query.limit(200),
    ]);

    return NextResponse.json(
      result.documents.map((d) => normalise(d as Parameters<typeof normalise>[0]))
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
