declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackDonationConversion(amount: number, transactionId: string) {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "purchase", {
    transaction_id: transactionId,
    value: amount,
    currency: "INR",
  });

  if (process.env.NEXT_PUBLIC_GADS_ID) {
    window.gtag("event", "conversion", {
      send_to: `${process.env.NEXT_PUBLIC_GADS_ID}/donation`,
      value: amount,
      currency: "INR",
      transaction_id: transactionId,
    });
  }
}

export function trackVolunteerSignup() {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "volunteer_signup", { event_category: "engagement" });
}

export function trackSponsorshipStart(childId: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "begin_checkout", {
    items: [{ item_id: childId, item_name: "child_sponsorship", price: 500, currency: "INR" }],
  });
}
