import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) ?? "general";

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  // TODO: Upload to Cloudinary via lib/cloudinary.ts uploadToCloudinary()
  void folder;

  return NextResponse.json({ url: null, publicId: null });
}
