import { ORG } from "@/constants";
import { formatDate } from "@/lib/utils";

// ─── Legacy function (kept for backward compatibility) ───────────────────────

export async function generateVolunteerCertificate(
  name: string,
  hours: number,
  period: string
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  const container = document.createElement("div");
  container.style.cssText =
    "width:1122px;height:794px;padding:64px;font-family:Georgia,serif;background:#fff;position:fixed;left:-9999px;top:0;box-sizing:border-box;";

  container.innerHTML = `
    <div style="border:4px double #1B5E37;height:100%;padding:40px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;">
      <img src="/seva-logo.png" alt="Seva Group Foundation" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:12px;" />
      <p style="color:#F5A623;font-size:14px;letter-spacing:4px;text-transform:uppercase;margin:0;">Certificate of Appreciation</p>
      <h1 style="color:#1B5E37;font-size:48px;margin:16px 0;">${ORG.name}</h1>
      <p style="font-size:18px;color:#555;margin:0;">This is to certify that</p>
      <h2 style="font-size:40px;color:#0F3D22;border-bottom:2px solid #F5A623;padding-bottom:8px;margin:16px 0;">${name}</h2>
      <p style="font-size:18px;color:#555;max-width:600px;line-height:1.6;">
        has selflessly volunteered <strong>${hours} hours</strong> of service to our community programs
        during <strong>${period}</strong>, making a meaningful difference in countless lives.
      </p>
      <p style="font-size:14px;color:#777;margin-top:32px;">Issued on ${formatDate(new Date())} | ${ORG.website}</p>
    </div>
  `;

  document.body.appendChild(container);
  const canvas = await html2canvas(container, { scale: 2 });
  document.body.removeChild(container);

  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });
  const imgData = canvas.toDataURL("image/png");
  pdf.addImage(imgData, "PNG", 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());

  return pdf.output("blob");
}

// ─── New volunteer cert (pure jsPDF, A4 landscape) ───────────────────────────

export interface VolunteerForCert {
  name:           string;
  volunteerType?: string;
  hoursLogged:    number;
  city?:          string;
  createdAt?:     string;
}

const GREEN = "#1B5E37";
const GOLD  = "#F5A623";
const DKGRN = "#0F3D22";

export async function generateVolunteerCert(volunteer: VolunteerForCert): Promise<void> {
  const { jsPDF } = await import("jspdf");

  // A4 landscape: 297mm × 210mm
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297, H = 210;

  // ── Background ──
  doc.setFillColor("#F9FBF9");
  doc.rect(0, 0, W, H, "F");

  // ── Outer double border ──
  doc.setDrawColor(GREEN);
  doc.setLineWidth(2.5);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setLineWidth(0.7);
  doc.rect(11, 11, W - 22, H - 22);

  // ── Corner ornament squares ──
  const corners: [number, number][] = [[8, 8], [W - 8, 8], [8, H - 8], [W - 8, H - 8]];
  corners.forEach(([x, y]) => {
    doc.setFillColor(GOLD);
    doc.rect(x - 3.5, y - 3.5, 7, 7, "F");
  });

  // ── Header / footer gold bands ──
  doc.setFillColor(GOLD);
  doc.rect(0, 0, W, 5, "F");
  doc.rect(0, H - 5, W, 5, "F");

  // ── Logo ──
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 120; canvas.height = 120;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      await new Promise<void>((res, rej) => {
        const img = new Image();
        img.onload = () => { ctx.drawImage(img, 0, 0, 120, 120); res(); };
        img.onerror = rej;
        img.src = "/seva-logo.png";
      });
      doc.addImage(canvas.toDataURL("image/png"), "PNG", W / 2 - 12, 18, 24, 24);
    }
  } catch { /* no logo — continue */ }

  // ── "CERTIFICATE OF VOLUNTEERING" ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(GOLD);
  doc.text("CERTIFICATE OF VOLUNTEERING", W / 2, 49, { align: "center", charSpace: 2 });

  // ── Org name ──
  doc.setFontSize(20);
  doc.setTextColor(GREEN);
  doc.text(ORG.name.toUpperCase(), W / 2, 59, { align: "center" });

  // ── Divider ──
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.5);
  doc.line(60, 63, W - 60, 63);

  // ── "This is to certify that" ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor("#555555");
  doc.text("This is to certify that", W / 2, 73, { align: "center" });

  // ── Volunteer name ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(DKGRN);
  doc.text(volunteer.name, W / 2, 87, { align: "center" });

  // ── Name underline ──
  const nameWidth = doc.getTextWidth(volunteer.name);
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.8);
  doc.line(W / 2 - nameWidth / 2, 89, W / 2 + nameWidth / 2, 89);

  // ── Body ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor("#555555");

  const typeLabel = volunteer.volunteerType
    ? volunteer.volunteerType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Community";

  doc.text(
    `has selflessly contributed ${volunteer.hoursLogged} hour${volunteer.hoursLogged !== 1 ? "s" : ""} of ${typeLabel} volunteering service`,
    W / 2, 100, { align: "center" }
  );
  doc.text(
    `to ${ORG.name}, making a meaningful difference in the lives of children and families in need.`,
    W / 2, 108, { align: "center" }
  );

  // ── Issue date ──
  doc.setFontSize(9);
  doc.setTextColor("#888888");
  doc.text(
    `Issued on ${formatDate(new Date())}  ·  ${ORG.website}`,
    W / 2, 120, { align: "center" }
  );

  // ── Signature lines ──
  const sigY = 142;
  const leftX = 65, rightX = W - 65;

  doc.setDrawColor("#BBBBBB");
  doc.setLineWidth(0.4);
  doc.line(leftX - 35, sigY, leftX + 35, sigY);
  doc.line(rightX - 35, sigY, rightX + 35, sigY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(GREEN);
  doc.text("Foundation Seal", leftX, sigY + 6, { align: "center" });
  doc.text("Authorised Signatory", rightX, sigY + 6, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor("#888888");
  doc.text(ORG.name, leftX, sigY + 11, { align: "center" });
  doc.text(ORG.name, rightX, sigY + 11, { align: "center" });

  // ── Footer ──
  doc.setFontSize(7);
  doc.setTextColor("#AAAAAA");
  doc.text(
    `${ORG.name}  ·  ${ORG.address}  ·  ${ORG.email}`,
    W / 2, H - 10, { align: "center" }
  );

  const filename = `volunteer-cert-${volunteer.name.replace(/\s+/g, "-").toLowerCase()}.pdf`;
  doc.save(filename);
}
