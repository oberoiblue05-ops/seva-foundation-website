import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch active campaigns from Firestore
  return NextResponse.json({ campaigns: [] });
}

export async function POST() {
  // TODO: Admin-only create campaign
  return NextResponse.json({ ok: true });
}
