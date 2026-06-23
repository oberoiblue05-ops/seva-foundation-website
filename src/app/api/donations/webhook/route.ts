import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody  = await req.text();
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
      payload: { payment?: { entity: { id: string; order_id: string } } };
    };

    const payment = event.payload?.payment?.entity;
    if (payment?.order_id) {
      const { id: paymentId, order_id: orderId } = payment;

      if (event.event === "payment.captured") {
        await getAdminDb().collection("donations").doc(orderId).update({
          razorpayPaymentId: paymentId,
          status:            "success",
          capturedAt:        new Date().toISOString(),
        });
      } else if (event.event === "payment.failed") {
        await getAdminDb().collection("donations").doc(orderId).update({
          razorpayPaymentId: paymentId,
          status:            "failed",
          failedAt:          new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("[webhook]", error);
    // Always 200 so Razorpay doesn't retry
    return NextResponse.json({ received: true });
  }
}
