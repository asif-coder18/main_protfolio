import { NextRequest, NextResponse } from "next/server";
import {
  getDatabases,
  DATABASE_ID,
  COLLECTIONS,
  Query,
  normalise,
  ID,
} from "@/lib/appwrite";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

export interface BrandSettings {
  _id?: string;
  brandName: string;
  logoType: "image" | "icon";
  logoImage: string;
  icon: string;
  logoSize: number;
  brandColor: string;
  logoText: string;
}

function deserialise(doc: Record<string, unknown>): BrandSettings {
  return normalise(doc as Parameters<typeof normalise>[0]) as unknown as BrandSettings;
}

export async function GET() {
  try {
    const db = getDatabases();
    const result = await db.listDocuments(DATABASE_ID, COLLECTIONS.BRAND_SETTINGS, [Query.limit(1)]);
    
    if (result.total === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        brandName: "Abir.dev",
        logoType: "icon",
        logoImage: "",
        icon: "lucide:code-2",
        logoSize: 32,
        brandColor: "#8b5cf6",
        logoText: "Abir.dev"
      });
    }
    
    return NextResponse.json(deserialise(result.documents[0] as Record<string, unknown>));
  } catch (err) {
    console.error("Branding GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const db = getDatabases();

    const payload = {
      brandName: body.brandName || "Abir.dev",
      logoType: body.logoType || "icon",
      logoImage: body.logoImage || "",
      icon: body.icon || "lucide:code-2",
      logoSize: Number(body.logoSize) || 32,
      brandColor: body.brandColor || "#8b5cf6",
      logoText: body.logoText || body.brandName || "Abir.dev",
    };

    const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.BRAND_SETTINGS, [Query.limit(1)]);

    let doc;
    if (existing.total > 0) {
      doc = await db.updateDocument(DATABASE_ID, COLLECTIONS.BRAND_SETTINGS, existing.documents[0].$id, payload);
    } else {
      doc = await db.createDocument(DATABASE_ID, COLLECTIONS.BRAND_SETTINGS, ID.unique(), payload);
    }

    return NextResponse.json(deserialise(doc as Record<string, unknown>));
  } catch (err) {
    console.error("Branding PUT error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
