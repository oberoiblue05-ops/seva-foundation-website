import { NextResponse } from "next/server";

const ORG_NAME    = "Seva Group Foundation";
const ORG_EMAIL   = "contact@sevagroupfdn.org";
const ORG_PHONE   = "+91 82870 61147";
const ORG_ADDRESS = "Street No.3, Block D, Saraswati Kunj, Chipyana Khurd, Noida Extension, UP 201308";
const ORG_WEBSITE = "https://sevagroupfdn.org";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210, H = 297;
    const M = 18; // margin

    // ── Helper: draw section header ──────────────────────────────────────────
    const sectionHeader = (text: string, y: number) => {
      doc.setFillColor("#1B5E37");
      doc.rect(M, y, W - M * 2, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor("#FFFFFF");
      doc.text(text.toUpperCase(), M + 3, y + 5);
      return y + 11;
    };

    const bodyText = (text: string, x: number, y: number, opts?: { maxWidth?: number; align?: "left" | "center" | "right" }) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor("#333333");
      doc.text(text, x, y, opts);
    };

    // ════════════════════════════════════════════════════════════════════
    // PAGE 1 — Foundation Overview
    // ════════════════════════════════════════════════════════════════════

    // Header band
    doc.setFillColor("#1B5E37");
    doc.rect(0, 0, W, 40, "F");

    // Gold accent stripe
    doc.setFillColor("#F5A623");
    doc.rect(0, 40, W, 3, "F");

    // Org name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor("#FFFFFF");
    doc.text(ORG_NAME, W / 2, 20, { align: "center" });

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor("#FFFFFF");
    doc.text("CSR Partnership Brochure", W / 2, 30, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#CCCCCC");
    doc.text(ORG_WEBSITE, W / 2, 37, { align: "center" });

    let y = 55;

    // About section
    y = sectionHeader("About Seva Group Foundation", y);
    bodyText(
      `${ORG_NAME} is a registered NGO based in Noida Extension, Uttar Pradesh, dedicated\n` +
      `to improving the lives of orphans, street children, widows, the elderly, and\n` +
      `underprivileged families across India. Since inception, we have directly served\n` +
      `840+ children, served 8,400+ meals per month, and conducted 50+ medical camps.`,
      M, y, { maxWidth: W - M * 2 }
    );
    y += 30;

    // Impact stats
    y = sectionHeader("Our Impact at a Glance", y);
    const stats = [
      ["840+", "Children Supported"],
      ["8,400+", "Meals / Month"],
      ["50+", "Medical Camps"],
      ["500+", "Trees Planted"],
      ["200+", "Active Volunteers"],
      ["15", "Cities Reached"],
    ];
    const colW = (W - M * 2) / 3;
    stats.forEach(([val, label], i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const sx = M + col * colW + colW / 2;
      const sy = y + row * 16;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor("#1B5E37");
      doc.text(val, sx, sy, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor("#666666");
      doc.text(label, sx, sy + 5, { align: "center" });
    });
    y += 36;

    // Programmes
    y = sectionHeader("Our Programmes", y);
    const progs = [
      ["Children Education", "Scholarships, digital literacy, tutoring"],
      ["Feeding Programme", "Daily meals, ration kits, community kitchen"],
      ["Medical Support", "Free camps, medicines, doctor consultations"],
      ["Old Age Home", "Shelter, care, and companionship for elders"],
      ["Widow Support", "Financial aid, skill development, legal help"],
      ["Tree Plantation", "Environmental initiative across Noida NCR"],
    ];
    progs.forEach(([name, desc], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const px = M + col * ((W - M * 2) / 2);
      const py = y + row * 14;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor("#1B5E37");
      doc.text(`• ${name}`, px, py);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor("#666666");
      doc.text(desc, px + 2, py + 5);
    });
    y += 46;

    // Fund allocation
    y = sectionHeader("Fund Allocation", y);
    const alloc = [
      { label: "Children Education", pct: 40, color: "#1B5E37" },
      { label: "Feeding Programme",  pct: 25, color: "#F5A623" },
      { label: "Medical Camps",      pct: 20, color: "#3B82F6" },
      { label: "Infrastructure",     pct: 15, color: "#8B5CF6" },
    ];
    alloc.forEach(({ label, pct, color }, i) => {
      const ay = y + i * 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor("#333333");
      doc.text(`${label}`, M, ay);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(color);
      doc.text(`${pct}%`, M + 65, ay);
      // bar background
      doc.setFillColor("#EEEEEE");
      doc.rect(M + 72, ay - 3.5, 60, 4, "F");
      // bar fill
      doc.setFillColor(color);
      doc.rect(M + 72, ay - 3.5, 60 * pct / 100, 4, "F");
    });
    y += 48;

    // Footer page 1
    doc.setDrawColor("#DDDDDD");
    doc.setLineWidth(0.3);
    doc.line(M, H - 12, W - M, H - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor("#AAAAAA");
    doc.text(`${ORG_NAME}  ·  ${ORG_ADDRESS}`, W / 2, H - 7, { align: "center" });
    doc.text("Page 1 of 2", W - M, H - 7, { align: "right" });

    // ════════════════════════════════════════════════════════════════════
    // PAGE 2 — Partnership Tiers + Compliance
    // ════════════════════════════════════════════════════════════════════

    doc.addPage();

    // Header
    doc.setFillColor("#1B5E37");
    doc.rect(0, 0, W, 28, "F");
    doc.setFillColor("#F5A623");
    doc.rect(0, 28, W, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor("#FFFFFF");
    doc.text("CSR Partnership Tiers", W / 2, 13, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#AADDCC");
    doc.text("Choose the tier that matches your CSR mandate", W / 2, 22, { align: "center" });

    y = 40;

    // Tier table header
    const cols = [M, M + 38, M + 78, M + 118];
    doc.setFillColor("#0F3D22");
    doc.rect(M, y, W - M * 2, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor("#FFFFFF");
    ["Benefit", "Silver (1L–5L)", "Gold (5L–25L)", "Platinum (25L+)"].forEach((h, i) => {
      doc.text(h, cols[i] + 2, y + 5.5);
    });
    y += 8;

    const tierRows = [
      ["Partnership Tier",          "✓", "✓", "✓"],
      ["CSR Compliance Cert",       "✓", "✓", "✓"],
      ["Site Visits / Year",        "2",  "4",  "Unlimited"],
      ["Impact Reports",            "Quarterly", "Monthly", "Monthly"],
      ["Logo Placement",            "Footer", "Homepage", "Hero Banner"],
      ["Social Media Mentions",     "2×/year", "6× campaign", "Monthly"],
      ["Event Naming Rights",       "–", "✓", "✓"],
      ["Employee Volunteering",     "–", "50 people", "Unlimited"],
      ["Building Naming Rights",    "–", "–", "✓"],
      ["Annual Report Co-branding", "–", "–", "✓"],
      ["Press Release Co-author",   "–", "–", "✓"],
      ["Board Advisory Seat",       "–", "–", "✓"],
    ];

    tierRows.forEach((row, i) => {
      const ry = y + i * 8;
      if (i % 2 === 0) {
        doc.setFillColor("#F5F7F5");
        doc.rect(M, ry, W - M * 2, 8, "F");
      }
      row.forEach((cell, j) => {
        doc.setFont("helvetica", j === 0 ? "normal" : "bold");
        doc.setFontSize(8);
        doc.setTextColor(cell === "–" ? "#BBBBBB" : j === 0 ? "#333333" : "#1B5E37");
        doc.text(cell, cols[j] + 2, ry + 5.5);
      });
    });
    y += tierRows.length * 8 + 8;

    // Compliance
    y = sectionHeader("Compliance & Certifications", y);
    const certs = [
      "Society / Trust Registration",
      "80G Tax Exemption — Donor contributions are tax deductible",
      "12A Registered — Income tax exemption for the foundation",
      "CSR-1 Registered — Eligible for CSR contributions under MCA",
      "Section 135 Companies Act 2013 — Fully compliant",
      "FCRA Application Pending — International donations in process",
    ];
    certs.forEach((cert, i) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor("#333333");
      doc.text(`✓  ${cert}`, M, y + i * 7.5);
    });
    y += certs.length * 7.5 + 8;

    // Highlight box
    doc.setFillColor("#EFF7F2");
    doc.setDrawColor("#1B5E37");
    doc.setLineWidth(0.5);
    doc.roundedRect(M, y, W - M * 2, 14, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor("#1B5E37");
    doc.text(
      "Donations to Seva Group Foundation qualify as CSR spend under Companies Act 2013, Section 135.",
      W / 2, y + 9, { align: "center", maxWidth: W - M * 2 - 6 }
    );
    y += 22;

    // Contact
    y = sectionHeader("Get In Touch", y);
    const contacts = [
      ["Email", ORG_EMAIL],
      ["Phone", ORG_PHONE],
      ["Website", ORG_WEBSITE],
      ["Address", ORG_ADDRESS],
    ];
    contacts.forEach(([label, val]) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor("#1B5E37");
      doc.text(`${label}:`, M, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#333333");
      doc.text(val, M + 22, y);
      y += 7;
    });

    // Footer page 2
    doc.setDrawColor("#DDDDDD");
    doc.setLineWidth(0.3);
    doc.line(M, H - 12, W - M, H - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor("#AAAAAA");
    doc.text(
      `${ORG_NAME}  ·  CSR Brochure  ·  Confidential`,
      W / 2, H - 7, { align: "center" }
    );
    doc.text("Page 2 of 2", W - M, H - 7, { align: "right" });

    // ── Return as downloadable PDF ────────────────────────────────────────────
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": 'attachment; filename="Seva-Foundation-CSR-Brochure.pdf"',
        "Content-Length":      String(pdfBuffer.length),
        "Cache-Control":       "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[CSR brochure]", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
