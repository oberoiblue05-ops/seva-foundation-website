import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      (await req.json()) as {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
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

    await adminDb.collection("donations").doc(razorpay_order_id).update({
      razorpayPaymentId: razorpay_payment_id,
      status:            "success",
      verifiedAt:        FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, donationId: razorpay_order_id });
  } catch (err) {
    console.error("[verify]", err);
    return NextResponse.json({ error: "Verification error" }, { status: 500 });
  }
}
