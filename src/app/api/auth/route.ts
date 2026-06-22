import { NextResponse } from "next/server";

export async function POST() {
  // Verify Firebase ID token and set custom claims
  return NextResponse.json({ ok: true });
}
