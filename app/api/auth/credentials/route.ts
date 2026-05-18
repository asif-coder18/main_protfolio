import { NextRequest, NextResponse } from "next/server";
import { getDatabases, DATABASE_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import bcrypt from "bcryptjs";

// PUT /api/auth/credentials — change username and/or password
export async function PUT(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const { currentPassword, newUsername, newPassword } = await req.json();

    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required." }, { status: 400 });
    }
    if (!newUsername && !newPassword) {
      return NextResponse.json({ error: "Provide a new username or password." }, { status: 400 });
    }
    if (newPassword && newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
    }

    const db = getDatabases();

    // Fetch current admin doc
    const result = await db.listDocuments(DATABASE_ID, COLLECTIONS.ADMIN, [
      Query.equal("username", user.username),
      Query.limit(1),
    ]);

    const adminDoc = result.documents[0] as unknown as {
      $id: string;
      username: string;
      passwordHash: string;
    } | undefined;

    if (!adminDoc) {
      return NextResponse.json({ error: "Admin account not found." }, { status: 404 });
    }

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, adminDoc.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    // Check new username isn't already taken (if changing)
    if (newUsername && newUsername !== adminDoc.username) {
      const taken = await db.listDocuments(DATABASE_ID, COLLECTIONS.ADMIN, [
        Query.equal("username", newUsername),
        Query.limit(1),
      ]);
      if (taken.total > 0) {
        return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
      }
    }

    // Build update payload
    const update: Record<string, string> = {};
    if (newUsername && newUsername !== adminDoc.username) {
      update.username = newUsername;
    }
    if (newPassword) {
      update.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No changes detected." }, { status: 400 });
    }

    await db.updateDocument(DATABASE_ID, COLLECTIONS.ADMIN, adminDoc.$id, update);

    return NextResponse.json({ success: true, message: "Credentials updated. Please log in again." });
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("Credentials update error:", e.message);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
