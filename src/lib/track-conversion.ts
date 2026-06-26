declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// ── Donation ──────────────────────────────────────────────────────────────────

export function trackDonation(amount: number, campaign: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  if (process.env.NEXT_PUBLIC_GADS_ID) {
    window.gtag("event", "conversion", {
      send_to:        `${process.env.NEXT_PUBLIC_GADS_ID}/donation`,
      value:          amount,
      currency:       "INR",
      transaction_id: Date.now().toString(),
    });
  }
  window.gtag("event", "donate", { amount, campaign, currency: "INR" });
}

export function trackDonationConversion(amount: number, transactionId: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  if (process.env.NEXT_PUBLIC_GADS_ID) {
    window.gtag("event", "conversion", {
      send_to:        `${process.env.NEXT_PUBLIC_GADS_ID}/donation`,
      value:          amount,
      currency:       "INR",
      transaction_id: transactionId,
    });
  }
  window.gtag("event", "purchase", { transaction_id: transactionId, value: amount, currency: "INR" });
}

// ── Volunteer ─────────────────────────────────────────────────────────────────

export function trackVolunteerSignup(type = "general") {
  if (typeof window === "undefined" || !window.gtag) return;
  if (process.env.NEXT_PUBLIC_GADS_ID) {
    window.gtag("event", "conversion", {
      send_to: `${process.env.NEXT_PUBLIC_GADS_ID}/volunteer`,
    });
  }
  window.gtag("event", "volunteer_signup", { volunteer_type: type });
}

// ── CSR ───────────────────────────────────────────────────────────────────────

export function trackCSRInquiry(company = "", budget = "") {
  if (typeof window === "undefined" || !window.gtag) return;
  if (process.env.NEXT_PUBLIC_GADS_ID) {
    window.gtag("event", "conversion", {
      send_to: `${process.env.NEXT_PUBLIC_GADS_ID}/csr_inquiry`,
    });
  }
  window.gtag("event", "csr_inquiry", { company, budget });
}

// ── Sponsor ───────────────────────────────────────────────────────────────────

export function trackSponsorChild(childName: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "sponsor_child", { child_name: childName, value: 500, currency: "INR" });
}

export function trackSponsorshipStart(childId: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "begin_checkout", {
    items: [{ item_id: childId, item_name: "child_sponsorship", price: 500, currency: "INR" }],
  });
}

// ── Page view ─────────────────────────────────────────────────────────────────

export function trackPageView(page: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "page_view", { page_path: page });
}
