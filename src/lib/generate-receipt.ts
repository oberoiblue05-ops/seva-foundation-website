import type { Donation } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORG } from "@/constants";

export async function generateDonationReceipt(donation: Donation): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  const container = document.createElement("div");
  container.style.cssText =
    "width:794px;padding:48px;font-family:Arial,sans-serif;background:#fff;color:#1A1A1A;position:fixed;left:-9999px;top:0;";

  container.innerHTML = `
    <div style="border:2px solid #1B5E37;padding:32px;border-radius:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <div>
          <h1 style="color:#1B5E37;font-size:24px;margin:0;">${ORG.name}</h1>
          <p style="font-size:12px;color:#555;margin:4px 0 0;">${ORG.address}</p>
          <p style="font-size:12px;color:#555;">${ORG.email} | ${ORG.phone}</p>
        </div>
        <div style="text-align:right;">
          <p style="font-size:12px;color:#555;">80G Donation Receipt</p>
          <p style="font-size:14px;font-weight:bold;">#${donation.razorpayOrderId.slice(-8).toUpperCase()}</p>
        </div>
      </div>
      <hr style="border-color:#1B5E37;margin:16px 0;" />
      <table style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#555;">Donor Name</td><td style="font-weight:bold;">${donation.name}</td></tr>
        <tr><td style="padding:8px 0;color:#555;">Email</td><td>${donation.email}</td></tr>
        <tr><td style="padding:8px 0;color:#555;">Phone</td><td>${donation.phone}</td></tr>
        <tr><td style="padding:8px 0;color:#555;">Purpose</td><td>${donation.purpose}</td></tr>
        <tr><td style="padding:8px 0;color:#555;">Date</td><td>${formatDate(donation.createdAt)}</td></tr>
        <tr><td style="padding:8px 0;color:#555;">Payment ID</td><td>${donation.razorpayPaymentId ?? "—"}</td></tr>
        <tr style="background:#F9FBF9;">
          <td style="padding:12px;font-size:18px;font-weight:bold;color:#1B5E37;">Amount Donated</td>
          <td style="padding:12px;font-size:18px;font-weight:bold;color:#1B5E37;">${formatCurrency(donation.amount)}</td>
        </tr>
      </table>
      <p style="font-size:11px;color:#777;margin-top:24px;">
        This donation is eligible for tax deduction under Section 80G of the Income Tax Act, 1961.
        ${ORG.name} is a registered charitable trust. Please retain this receipt for your records.
      </p>
    </div>
  `;

  document.body.appendChild(container);

  const canvas = await html2canvas(container, { scale: 2 });
  document.body.removeChild(container);

  const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
  const imgData = canvas.toDataURL("image/png");
  pdf.addImage(imgData, "PNG", 0, 0, pdf.internal.pageSize.getWidth(), 0);

  return pdf.output("blob");
}
