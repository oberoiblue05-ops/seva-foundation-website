import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay credentials are not set in environment variables.");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export default razorpay;

export async function createOrder(amount: number, receipt: string, notes?: Record<string, string>) {
  return razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt,
    notes,
  });
}
