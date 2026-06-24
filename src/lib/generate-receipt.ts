import { ORG } from "@/constants";
import type { Donation } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DonationForReceipt {
  id:                  string;
  name:                string;
  email:               string;
  phone:               string;
  pan?:                string | null;
  amount:              number;   // in Rupees
  campaign?:           string;
  purpose?:            string;
  razorpayOrderId:     string;
  razorpayPaymentId?:  string | null;
  status?:             string;
  timestamp?:          string;
  createdAt?:          Date | string;
}

export interface SponsorshipForCert {
  id:          string;
  sponsorName: string;
  childName?:  string;
  amount:      number;
  startDate:   string | Date;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const GREEN  = [27,  94,  55]  as const;
const GOLD   = [245, 166, 35]  as const;
const WHITE  = [255, 255, 255] as const;
const DARK   = [15,  61,  34]  as const;
const GRAY   = [100, 100, 100] as const;

const W = 210; // A4 width mm
const M = 15;  // margin mm

function fmtDate(d: Date | string | undefined): string {
  if (!d) return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function fmtRs(n: number): string {
  return "Rs. " + n.toLocaleString("en-IN");
}

// Convert amount (integer Rs) to Indian words
function toWords(n: number): string {
  if (n === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function convert(x: number): string {
    if (x === 0) return "";
    if (x < 20) return ones[x];
    if (x < 100) return tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : "");
    return ones[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + convert(x % 100) : "");
  }
  let result = "";
  if (n >= 10000000) { result += convert(Math.floor(n / 10000000)) + " Crore "; n %= 10000000; }
  if (n >= 100000)   { result += convert(Math.floor(n / 100000))   + " Lakh ";  n %= 100000;   }
  if (n >= 1000)     { result += convert(Math.floor(n / 1000))     + " Thousand "; n %= 1000;  }
  if (n > 0)         { result += convert(n); }
  return result.trim() + " Rupees Only";
}

// ─── Core jsPDF receipt builder ───────────────────────────────────────────────

async function buildReceiptBlob(d: DonationForReceipt): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const campaign = d.campaign ?? d.purpose ?? "General Donation";
  const date     = fmtDate(d.createdAt ?? d.timestamp);
  const receiptNo = `RECEIPT-${(d.razorpayOrderId ?? d.id).slice(-10).toUpperCase()}`;

  // ── Green header ──────────────────────────────────────────
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 48, "F");

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("SEVA GROUP FOUNDATION", W / 2, 14, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(ORG.address, W / 2, 22, { align: "center" });
  doc.text(`${ORG.email}  |  ${ORG.phone}  |  ${ORG.website}`, W / 2, 29, { align: "center" });
  doc.text("Registered Charitable Trust  |  80G Exempt  |  12A Approved", W / 2, 36, { align: "center" });

  // ── Gold divider ──────────────────────────────────────────
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.2);
  doc.line(M, 44, W - M, 44);

  // ── Title ─────────────────────────────────────────────────
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("DONATION RECEIPT", W / 2, 58, { align: "center" });

  // ── Receipt meta row ─────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("Receipt No:", M, 70);
  doc.text("Date:", 120, 70);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text(receiptNo, M + 28, 70);
  doc.text(date, 133, 70);

  // ── Separator ─────────────────────────────────────────────
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.4);
  doc.line(M, 75, W - M, 75);

  // ── Donor Details ─────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("DONOR DETAILS", M, 83);

  const donorRows: [string, string][] = [
    ["Name",  d.name  || "—"],
    ["Email", d.email || "—"],
    ["Phone", d.phone ? `+91 ${d.phone}` : "—"],
    ["PAN",   d.pan   || "Not provided"],
  ];

  let y = 90;
  doc.setFontSize(9.5);
  for (const [label, value] of donorRows) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(label, M, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(value, M + 35, y);
    y += 8;
  }

  // ── Separator ─────────────────────────────────────────────
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.4);
  doc.line(M, y + 2, W - M, y + 2);
  y += 10;

  // ── Donation Details ──────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("DONATION DETAILS", M, y);
  y += 8;

  const donRows: [string, string][] = [
    ["Campaign / Purpose", campaign],
    ["Amount (Figures)",   fmtRs(d.amount)],
    ["Amount (Words)",     toWords(Math.round(d.amount))],
    ["Payment ID",         d.razorpayPaymentId || d.razorpayOrderId || "—"],
    ["Mode",               "Razorpay / UPI / Card"],
  ];

  doc.setFontSize(9.5);
  for (const [label, value] of donRows) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(label, M, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    // wrap long values
    const lines = doc.splitTextToSize(value, 100) as string[];
    doc.text(lines, M + 55, y);
    y += lines.length > 1 ? lines.length * 6 + 2 : 8;
  }

  // ── Green amount box ──────────────────────────────────────
  y += 4;
  doc.setFillColor(...GREEN);
  doc.rect(M, y, W - 2 * M, 16, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`AMOUNT DONATED: ${fmtRs(d.amount)}`, W / 2, y + 10, { align: "center" });
  y += 24;

  // ── 80G Declaration ───────────────────────────────────────
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const declaration =
    "This donation is eligible for tax deduction under Section 80G of the Income Tax Act, 1961. " +
    `${ORG.name} is a registered charitable trust (80G Reg. No: AAATS1234R / 12A Reg. No: AAATS1234R — verify with foundation). ` +
    "Please retain this receipt for your Income Tax records. The deduction is 50% of the donated amount subject to 10% of Gross Total Income.";
  const declLines = doc.splitTextToSize(declaration, W - 2 * M) as string[];
  doc.text(declLines, M, y);
  y += declLines.length * 4.5 + 10;

  // ── Signature ─────────────────────────────────────────────
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(W - M - 60, y, W - M, y);
  y += 5;
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Authorized Signatory", W - M - 30, y, { align: "center" });
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text(ORG.name, W - M - 30, y, { align: "center" });

  // ── Footer ────────────────────────────────────────────────
  doc.setFillColor(...GREEN);
  doc.rect(0, 285, W, 12, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Generated on ${fmtDate(new Date())}  |  ${ORG.website}  |  ${ORG.email}`, W / 2, 292, { align: "center" });

  return doc.output("blob");
}

// ─── Public: download receipt ─────────────────────────────────────────────────

export async function generateReceipt(donation: DonationForReceipt): Promise<void> {
  const blob = await buildReceiptBlob(donation);
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `receipt-${(donation.razorpayOrderId ?? donation.id).slice(-10).toUpperCase()}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Backward-compat for DonationModal ───────────────────────────────────────

export async function generateDonationReceipt(donation: Donation): Promise<Blob> {
  return buildReceiptBlob({
    id:                donation.id,
    name:              donation.name,
    email:             donation.email,
    phone:             donation.phone,
    amount:            donation.amount,
    purpose:           donation.purpose,
    razorpayOrderId:   donation.razorpayOrderId,
    razorpayPaymentId: donation.razorpayPaymentId,
    createdAt:         donation.createdAt,
  });
}

// ─── Sponsorship Certificate ─────────────────────────────────────────────────

export async function generateSponsorCert(s: SponsorshipForCert): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const certNo   = `SPONS-${s.id.slice(-8).toUpperCase()}`;
  const startFmt = fmtDate(s.startDate);
  const child    = s.childName ?? "a sponsored child";

  // Green header
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 55, "F");

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("CHILD SPONSORSHIP CERTIFICATE", W / 2, 16, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(ORG.name, W / 2, 26, { align: "center" });
  doc.setFontSize(7.5);
  doc.text(ORG.address, W / 2, 34, { align: "center" });
  doc.text(`${ORG.email}  |  ${ORG.phone}`, W / 2, 41, { align: "center" });

  // Gold border lines
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.5);
  doc.line(M, 50, W - M, 50);

  // Certificate No
  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Certificate No: ${certNo}`, W / 2, 62, { align: "center" });

  // Main text
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("This is to certify that", W / 2, 82, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...GREEN);
  doc.text(s.sponsorName, W / 2, 96, { align: "center" });

  // Gold underline
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(40, 99, W - 40, 99);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text("has made a compassionate commitment to sponsor", W / 2, 113, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...GREEN);
  doc.text(child, W / 2, 126, { align: "center" });

  // Details box
  doc.setFillColor(249, 251, 249);
  doc.rect(M, 138, W - 2 * M, 50, "F");
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.rect(M, 138, W - 2 * M, 50, "S");

  const boxRows: [string, string][] = [
    ["Monthly Contribution", fmtRs(s.amount)],
    ["Sponsorship Start Date", startFmt],
    ["Payment Mode", "Razorpay / UPI"],
    ["Status", "Active"],
  ];

  let by = 148;
  for (const [label, value] of boxRows) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(label, M + 8, by);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(value, M + 75, by);
    by += 10;
  }

  // Impact note
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  const impact = `Your Rs.${s.amount}/month provides ${child} with nutritious meals, school fees, and medical care.`;
  const impactLines = doc.splitTextToSize(impact, W - 2 * M) as string[];
  doc.text(impactLines, W / 2, 202, { align: "center" });

  // Quote
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GREEN);
  doc.text('"Every child deserves a future."', W / 2, 222, { align: "center" });

  // Signature
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(W - M - 65, 260, W - M, 260);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Authorized Signatory", W - M - 32, 265, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text(ORG.name, W - M - 32, 271, { align: "center" });

  // Footer
  doc.setFillColor(...GREEN);
  doc.rect(0, 285, W, 12, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Generated on ${fmtDate(new Date())}  |  ${ORG.website}`, W / 2, 292, { align: "center" });

  const blob = doc.output("blob");
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `sponsorship-cert-${s.id.slice(-8)}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
