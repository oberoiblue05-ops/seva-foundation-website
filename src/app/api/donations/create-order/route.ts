import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getAdminDb } from "@/lib/firebase-admin";

const razorpay = new Razorpay({
  key_id:     process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const {
      amount, donorName, email, phone,
      campaign, campaignId, pan, isPublic, isRecurring,
    } = (await req.json()) as {
      amount:      number;   // paise
      donorName:   string;
      email:       string;
      phone:       string;
      campaign?:   string;
      campaignId?: string;
      pan?:        string;
      isPublic?:   boolean;
      isRecurring?: boolean;
    };

    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Minimum donation is Rs. 1" }, { status: 400 });
    }
    if (!donorName?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Name, email and phone are required" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt:  `receipt_${Date.now()}`,
      notes: {
        donorName,
        email,
        phone,
        campaign: campaign ?? "General Donation",
      },
    });

    // getAdminDb() is called here (inside try) so any Firebase init error
    // is caught below and returned as JSON, not an HTML page.
    await getAdminDb().collection("donations").doc(order.id).set({
      name:              donorName.trim(),
      email:             email.trim(),
      phone:             phone.trim(),
      pan:               pan?.trim() || null,
      amount:            amount / 100,   // store in Rupees
      currency:          "INR",
      campaign:          campaign?.trim() || "General Donation",
      campaignId:        campaignId || null,
      razorpayOrderId:   order.id,
      razorpayPaymentId: null,
      status:            "pending",
      isRecurring:       isRecurring ?? false,
      isPublic:          isPublic ?? false,
      receiptGenerated:  false,
      timestamp:         new Date().toISOString(),
    });

    return NextResponse.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create order";
    console.error("[create-order]", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
