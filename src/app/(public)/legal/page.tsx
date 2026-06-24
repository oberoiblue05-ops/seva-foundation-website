import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Download, CheckCircle, Clock, AlertCircle, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Legal & Compliance | Seva Group Foundation",
  description:
    "View Seva Group Foundation's legal documents including registration certificate, 80G tax exemption, FCRA status, and annual reports. Registered NGO, Noida UP.",
  openGraph: {
    title: "Legal & Compliance | Seva Group Foundation",
    description:
      "Access our registration certificate, 80G exemption, FCRA status, and annual reports.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function DownloadBtn({ label, available = false }: { label: string; available?: boolean }) {
  return (
    <button
      disabled={!available}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all
        ${available
          ? "bg-[#1B5E37] text-white hover:bg-[#0d3320] shadow-sm hover:shadow"
          : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
    >
      <Download size={15} />
      {available ? `Download ${label}` : "Coming Soon"}
    </button>
  );
}

function DocCard({
  icon,
  title,
  description,
  status,
  statusColor,
  btnLabel,
  btnAvailable,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: string;
  statusColor: string;
  btnLabel: string;
  btnAvailable?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1B5E37]/8 flex items-center justify-center shrink-0 text-[#1B5E37]">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg leading-tight">{title}</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-lg">{description}</p>
          </div>
        </div>
        <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}>
          {status}
        </span>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <DownloadBtn label={btnLabel} available={btnAvailable} />
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function LegalPage() {
  return (
    <main>
      {/* Hero */}
      <section
        className="relative py-20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #071a0e 0%, #0F3D22 55%, #1B5E37 100%)" }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-xs font-medium mb-6">
            <CheckCircle size={13} className="text-[#F5A623]" />
            Registered NGO · Noida, UP
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading leading-tight mb-4">
            Legal &amp; Compliance
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Seva Group Foundation operates with full transparency. All our legal documents,
            certifications, and annual reports are available here.
          </p>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-[#F9FBF9] border-b border-gray-100 py-6">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            {[
              { icon: "🏛️", text: "Registered Society" },
              { icon: "📋", text: "80G Tax Exemption" },
              { icon: "✅", text: "12A Registered" },
              { icon: "🌐", text: "FCRA Pending" },
              { icon: "📊", text: "Annual Reports Published" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-2 text-gray-600">
                <span>{b.icon}</span>
                <span className="font-medium">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="py-16 bg-[#F9FBF9]">
        <div className="mx-auto max-w-4xl px-4 space-y-5">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Legal Documents</h2>

          <DocCard
            icon={<FileText size={22} />}
            title="Registration Certificate"
            description="Certificate of registration as a charitable society under the Societies Registration Act, issued by the Registrar, Uttar Pradesh."
            status="Registered"
            statusColor="bg-green-100 text-green-700"
            btnLabel="Registration Certificate"
          />

          <DocCard
            icon={<FileText size={22} />}
            title="80G Tax Exemption Certificate"
            description="Donations to Seva Group Foundation are eligible for 50% tax deduction under Section 80G of the Income Tax Act, 1961. This certificate is required for donor tax claims."
            status="Certified"
            statusColor="bg-green-100 text-green-700"
            btnLabel="80G Certificate"
          />

          <DocCard
            icon={<FileText size={22} />}
            title="12A Registration"
            description="12A registration exempts the organisation from paying income tax on its surplus income, enabling us to use all funds for charitable activities."
            status="Registered"
            statusColor="bg-green-100 text-green-700"
            btnLabel="12A Certificate"
          />

          {/* FCRA Status Card */}
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <AlertCircle size={22} className="text-amber-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-semibold text-gray-800 text-lg">FCRA Status</h3>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                    <Clock size={11} />
                    Application Pending
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Foreign Contribution Regulation Act (FCRA) registration allows Indian NGOs to
                  receive donations from foreign sources. Our application is currently under review
                  by the Ministry of Home Affairs.
                </p>
                <p className="text-sm text-amber-600 mt-3 font-medium">
                  Note: Until FCRA is approved, we are unable to accept foreign donations.
                  All current donations are from Indian donors only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Annual Reports */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Annual Reports</h2>
          <p className="text-gray-500 mb-8">
            Our annual reports detail our activities, financials, and impact for each year.
          </p>

          <div className="space-y-3">
            {[
              { year: "2023–24", pages: "24 pages", highlights: "840 children helped, 8,400 meals served, 50 camps conducted" },
              { year: "2022–23", pages: "20 pages", highlights: "600 children helped, 6,000 meals served, 35 camps conducted" },
              { year: "2021–22", pages: "18 pages", highlights: "400 children helped, 4,000 meals served, 20 camps conducted" },
            ].map((r) => (
              <div
                key={r.year}
                className="flex items-center justify-between gap-4 bg-[#F9FBF9] border border-gray-100 rounded-2xl px-6 py-5 hover:border-[#1B5E37]/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1B5E37] flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Annual Report {r.year}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{r.highlights} · {r.pages}</p>
                  </div>
                </div>
                <button
                  disabled
                  className="inline-flex items-center gap-2 bg-gray-100 text-gray-400 cursor-not-allowed rounded-xl px-4 py-2 text-sm font-medium"
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-[#1B5E37]">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <Mail size={36} className="text-[#F5A623] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Need Specific Documents?</h2>
          <p className="text-white/70 mb-6">
            If you require specific compliance documents for CSR, grants, or due-diligence purposes,
            please reach out to our team.
          </p>
          <a
            href="mailto:contact@sevagroupfdn.org?subject=Document Request — Seva Group Foundation"
            className="inline-flex items-center gap-2 bg-[#F5A623] text-[#1B5E37] font-bold rounded-full px-8 py-3 hover:bg-[#F7BA57] transition-all hover:scale-105 shadow-lg"
          >
            <Mail size={16} />
            Email contact@sevagroupfdn.org
          </a>
          <p className="text-white/50 text-sm mt-4">We respond within 2 business days.</p>
        </div>
      </section>
    </main>
  );
}
