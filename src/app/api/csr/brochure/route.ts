import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Stream CSR brochure PDF from Cloudinary or generate on-the-fly
  return NextResponse.json({ url: null });
}
