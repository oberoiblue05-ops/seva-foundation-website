import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      (await req.json()) as {
        razorpay_order_id:   string;
        razorpay_payment_id: string;
        razorpay_signature:  string;
      };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: "Signature mismatch — payment not verified" }, { status: 400 });
    }

    await getAdminDb().collection("donations").doc(razorpay_order_id).update({
      razorpayPaymentId: razorpay_payment_id,
      status:            "success",
      verifiedAt:        new Date().toISOString(),
    });

    return NextResponse.json({ success: true, donationId: razorpay_order_id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Verification error";
    console.error("[verify]", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
