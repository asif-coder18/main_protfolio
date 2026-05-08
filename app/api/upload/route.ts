import { NextRequest, NextResponse } from "next/server";
import { getStorage, STORAGE_BUCKET_ID, ENDPOINT, PROJECT_ID, ID } from "@/lib/appwrite";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { InputFile } from "node-appwrite/file";

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const inputFile = InputFile.fromBuffer(buffer, file.name);

    const storage = getStorage();
    const uploaded = await storage.createFile(STORAGE_BUCKET_ID, ID.unique(), inputFile);

    // Build the public URL for the file
    const url = `${ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${uploaded.$id}/view?project=${PROJECT_ID}`;

    return NextResponse.json({ url, fileId: uploaded.$id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
