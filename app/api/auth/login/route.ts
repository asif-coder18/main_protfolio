import { NextRequest, NextResponse } from "next/server";
import { getDatabases, DATABASE_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import { signToken, setAuthCookie } from "@/lib/auth";
import {
  AdminCredentialDocument,
  hashAdminPassword,
  verifyAdminPassword,
} from "@/lib/admin-credentials";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const db = getDatabases();

    // Look up admin by username
    const result = await db.listDocuments(DATABASE_ID, COLLECTIONS.ADMIN, [
      Query.equal("username", username),
      Query.limit(1),
    ]);

    let adminDoc = result.documents[0] as unknown as AdminCredentialDocument | undefined;

    // Auto-create admin on first run if no admins exist
    if (!adminDoc) {
      const count = await db.listDocuments(DATABASE_ID, COLLECTIONS.ADMIN, [Query.limit(1)]);
      if (
        count.total === 0 &&
        username === (process.env.ADMIN_USERNAME || "admin")
      ) {
        const hash = await hashAdminPassword(password);
        const created = await db.createDocument(DATABASE_ID, COLLECTIONS.ADMIN, "unique()", {
          username,
          passwordHash: hash,
        });
        adminDoc = created as unknown as AdminCredentialDocument;
      } else {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    }

    const verification = await verifyAdminPassword(password, adminDoc);
    if (!verification.valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (verification.needsMigration) {
      await db.updateDocument(DATABASE_ID, COLLECTIONS.ADMIN, adminDoc.$id, {
        passwordHash: await hashAdminPassword(password),
      });
    }

    const token = await signToken({ id: adminDoc.$id, username: adminDoc.username });
    await setAuthCookie(token);

    return NextResponse.json({ success: true, username: adminDoc.username });
  } catch (err: any) {
    console.error("Login Error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
