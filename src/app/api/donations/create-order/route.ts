import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { amount, purpose, campaignId, childId } = await req.json();

  if (!amount || amount < 1) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  // TODO: createOrder(amount, receipt, notes) from lib/razorpay.ts
  void purpose; void campaignId; void childId;

  return NextResponse.json({ orderId: null, amount, currency: "INR" });
}
