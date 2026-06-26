declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// ── Donation ──────────────────────────────────────────────────────────────────

export function trackDonation(amount: number, campaign: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "donate", {
    event_category: "conversion",
    event_label:    campaign,
    value:          amount,
    currency:       "INR",
  });
  if (process.env.NEXT_PUBLIC_GADS_ID) {
    window.gtag("event", "conversion", {
      send_to:        `${process.env.NEXT_PUBLIC_GADS_ID}/donation`,
      value:          amount,
      currency:       "INR",
      transaction_id: `${Date.now()}`,
    });
  }
}

export function trackDonationConversion(amount: number, transactionId: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "purchase", {
    transaction_id: transactionId,
    value:          amount,
    currency:       "INR",
  });
  if (process.env.NEXT_PUBLIC_GADS_ID) {
    window.gtag("event", "conversion", {
      send_to:        `${process.env.NEXT_PUBLIC_GADS_ID}/donation`,
      value:          amount,
      currency:       "INR",
      transaction_id: transactionId,
    });
  }
}

// ── Volunteer ─────────────────────────────────────────────────────────────────

export function trackVolunteerSignup(type = "general") {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "volunteer_signup", {
    event_category: "engagement",
    event_label:    type,
  });
  if (process.env.NEXT_PUBLIC_GADS_ID) {
    window.gtag("event", "conversion", {
      send_to: `${process.env.NEXT_PUBLIC_GADS_ID}/volunteer`,
    });
  }
}

// ── CSR ───────────────────────────────────────────────────────────────────────

export function trackCSRInquiry(company = "", budget = "") {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "csr_inquiry", {
    event_category: "engagement",
    event_label:    company,
    value:          budget,
  });
  if (process.env.NEXT_PUBLIC_GADS_ID) {
    window.gtag("event", "conversion", {
      send_to: `${process.env.NEXT_PUBLIC_GADS_ID}/csr_inquiry`,
    });
  }
}

// ── Sponsor ───────────────────────────────────────────────────────────────────

export function trackSponsorChild(childName: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "sponsor_child", {
    event_category: "conversion",
    event_label:    childName,
    value:          500,
    currency:       "INR",
  });
}

export function trackSponsorshipStart(childId: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "begin_checkout", {
    items: [{ item_id: childId, item_name: "child_sponsorship", price: 500, currency: "INR" }],
  });
}
