import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getAdminDb } from "@/lib/firebase-admin";

export async function DELETE(req: NextRequest) {
  try {
    const { publicId, docId } = (await req.json()) as { publicId: string; docId: string };
    if (!publicId || !docId) {
      return NextResponse.json({ error: "publicId and docId required" }, { status: 400 });
    }
    await cloudinary.uploader.destroy(publicId);
    await getAdminDb().collection("media").doc(docId).delete();
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
