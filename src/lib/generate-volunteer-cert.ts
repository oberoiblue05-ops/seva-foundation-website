import { ORG } from "@/constants";
import { formatDate } from "@/lib/utils";

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
