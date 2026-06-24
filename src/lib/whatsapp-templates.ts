import { WHATSAPP_NUMBER } from "@/constants";
import { formatCurrency } from "@/lib/utils";

function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WhatsApp = {
  general(): string {
    return buildWhatsAppUrl("Hello Seva Group Foundation! I'd like to know more about your work.");
  },

  donationThankYou(name: string, amount: number, receiptId: string): string {
    const msg = `Hello! I just donated ${formatCurrency(amount)} to Seva Group Foundation (Receipt: ${receiptId}). Thank you for your incredible work, ${name}!`;
    return buildWhatsAppUrl(msg);
  },

  volunteerInquiry(name: string): string {
    const msg = `Hi! My name is ${name} and I'd like to volunteer with Seva Group Foundation. Please share the next steps.`;
    return buildWhatsAppUrl(msg);
  },

  sponsorChild(childName: string, sponsorName: string): string {
    const msg = `Hi! I, ${sponsorName}, would like to sponsor ${childName} at Rs.500/month. Please guide me through the process.`;
    return buildWhatsAppUrl(msg);
  },

  groceryPledge(name: string, items: string[]): string {
    const msg = `Hello! I'm ${name} and I'd like to pledge the following grocery items for the upcoming drive: ${items.join(", ")}. Please confirm the details.`;
    return buildWhatsAppUrl(msg);
  },

  csrInquiry(company: string, contact: string): string {
    const msg = `Hello! I represent ${company}. My name is ${contact} and I'd like to explore CSR partnership opportunities with Seva Group Foundation.`;
    return buildWhatsAppUrl(msg);
  },

  shareDonationSuccess(name: string, amount: number, meals: number, children: number): string {
    const msg =
      `I just made a difference! 🌟\n\n` +
      `I donated ${formatCurrency(amount)} to Seva Group Foundation.\n\n` +
      `This will provide ${meals} meals and support ${children} ${children === 1 ? "child" : "children"}.\n\n` +
      `Join me in making a difference: https://sevagroupfdn.org/donations\n\n` +
      `— ${name}`;
    return buildWhatsAppUrl(msg);
  },
};
