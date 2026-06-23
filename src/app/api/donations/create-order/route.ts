import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { getRazorpayClient } from "@/lib/razorpay";
import { generateReceiptNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      amount: number;       // paise
      donorName: string;
      email: string;
      phone: string;
      campaign?: string;
      campaignId?: string;
      pan?: string;
      isPublic?: boolean;
      isRecurring?: boolean;
    };

    const {
      amount, donorName, email, phone,
      campaign, campaignId, pan, isPublic, isRecurring,
    } = body;

    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Minimum donation is Rs. 1" }, { status: 400 });
    }
    if (!donorName?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Name, email and phone are required" }, { status: 400 });
    }

    const receipt = generateReceiptNumber();
    const rzp = getRazorpayClient();

    const order = await rzp.orders.create({
      amount,            // already in paise
      currency: "INR",
      receipt,
      notes: { donorName, email, phone, campaign: campaign ?? "General Donation" },
    });

    await adminDb.collection("donations").doc(order.id).set({
      name:              donorName.trim(),
      email:             email.trim(),
      phone:             phone.trim(),
      pan:               pan?.trim() || null,
      amount:            amount / 100,          // store in Rupees
      currency:          "INR",
      campaign:          campaign?.trim() || "General Donation",
      campaignId:        campaignId || null,
      razorpayOrderId:   order.id,
      razorpayPaymentId: null,
      status:            "pending",
      isRecurring:       isRecurring ?? false,
      isPublic:          isPublic ?? false,
      receiptNumber:     receipt,
      receiptGenerated:  false,
      timestamp:         FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      orderId:  order.id,
      amount,
      currency: "INR",
      keyId:    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[create-order]", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
