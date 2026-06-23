import Razorpay from "razorpay";

let _client: InstanceType<typeof Razorpay> | null = null;

export function getRazorpayClient(): InstanceType<typeof Razorpay> {
  if (_client) return _client;
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials missing. Set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }
  _client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return _client;
}
