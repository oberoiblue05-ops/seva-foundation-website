import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const donationId = searchParams.get("donationId");
  const type = searchParams.get("type") ?? "receipt"; // "receipt" | "impact" | "volunteer"

  if (!donationId) return NextResponse.json({ error: "donationId required" }, { status: 400 });

  // TODO: Generate and stream PDF from generate-receipt.ts or generate-volunteer-cert.ts
  void type;

  return NextResponse.json({ url: null });
}
