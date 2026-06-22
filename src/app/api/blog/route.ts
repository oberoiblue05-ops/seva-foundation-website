import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch published blog posts from Firestore
  return NextResponse.json({ posts: [] });
}

export async function POST() {
  // TODO: Admin-only create/update blog post
  return NextResponse.json({ ok: true });
}
