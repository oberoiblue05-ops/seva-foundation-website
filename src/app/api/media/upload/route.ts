import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP and GIF allowed" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 10 MB limit" }, { status: 400 });
    }

    const buffer  = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder:        "seva-foundation",
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    const meta = {
      url:        result.secure_url,
      publicId:   result.public_id,
      width:      result.width,
      height:     result.height,
      filename:   file.name,
      size:       file.size,
      uploadedAt: new Date().toISOString(),
    };

    const docRef = await getAdminDb().collection("media").add(meta);

    return NextResponse.json({ id: docRef.id, ...meta });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    console.error("[media/upload]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
