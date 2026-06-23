import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex");

    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody) as {
      event: string;
      payload: {
        payment?: { entity: { id: string; order_id: string } };
      };
    };

    const payment = event.payload?.payment?.entity;
    if (!payment?.order_id) {
      return NextResponse.json({ received: true });
    }

    const { id: paymentId, order_id: orderId } = payment;

    if (event.event === "payment.captured") {
      await adminDb.collection("donations").doc(orderId).update({
        razorpayPaymentId: paymentId,
        status:            "success",
        capturedAt:        FieldValue.serverTimestamp(),
      });
    } else if (event.event === "payment.failed") {
      await adminDb.collection("donations").doc(orderId).update({
        razorpayPaymentId: paymentId,
        status:            "failed",
        failedAt:          FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook]", err);
    // Always return 200 to Razorpay so they don't retry
    return NextResponse.json({ received: true });
  }
}
