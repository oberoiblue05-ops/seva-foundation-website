"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ChevronRight, Download, CheckCircle, Shield, FileText,
  TrendingUp, Users, Award, Building2, Megaphone,
  Star, Zap, Crown,
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { trackCSRInquiry } from "@/lib/track-conversion";

// ─── Constants ───────────────────────────────────────────────────────────────

const WA_NUMBER = "918287061147";

const BUDGETS = [
  "Under Rs.1L", "Rs.1L–5L", "Rs.5L–25L", "Rs.25L–1Cr", "Above Rs.1Cr", "Not decided",
];

const PROGRAMMES = [
  "Education", "Feeding", "Medical Camps", "Tree Plantation",
  "Widow Support", "Elderly Care", "Employee Volunteering", "Custom",
];

const TIERS_PREF = ["Silver", "Gold", "Platinum", "Open to Suggestion"];

const TIMELINES = ["Immediate", "Next Quarter", "Next Financial Year", "Exploring"];

const FUND_BARS = [
  { label: "Children Education", pct: 40, color: "#1B5E37" },
  { label: "Feeding Programme",  pct: 25, color: "#F5A623" },
  { label: "Medical Camps",      pct: 20, color: "#3B82F6" },
  { label: "Infrastructure",     pct: 15, color: "#8B5CF6" },
];

const COMPLIANCE = [
  { icon: Shield,   text: "Society / Trust Registration" },
  { icon: FileText, text: "80G Tax Exemption" },
  { icon: Award,    text: "12A Registered" },
  { icon: CheckCircle, text: "CSR-1 Registered" },
  { icon: Building2, text: "Section 135 Companies Act 2013" },
  { icon: TrendingUp, text: "Impact Reports Provided" },
];

const INPUT =
  "w-full rounded-xl border border-gray-200 bg-[#F9FBF9] px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/35 focus:border-[#1B5E37] focus:outline-none focus:ring-2 focus:ring-[#1B5E37]/20 transition-colors";

interface FormState {
  company:     string;
  contact:     string;
  designation: string;
  email:       string;
  phone:       string;
  website:     string;
  budget:      string;
  programmes:  string[];
  tier:        string;
  timeline:    string;
  message:     string;
}

const BLANK: FormState = {
  company: "", contact: "", designation: "", email: "", phone: "",
  website: "", budget: "", programmes: [], tier: "", timeline: "", message: "",
};

// ─── Tier card data ───────────────────────────────────────────────────────────

const TIERS = [
  {
    name: "Silver",
    range: "Rs.1L – 5L / year",
    accent: "#94A3B8",
    bg: "bg-white",
    borderClass: "border-[#94A3B8]",
    icon: Star,
    featured: false,
    badge: null,
    perks: [
      "Logo placement in footer",
      "Quarterly impact report",
      "CSR compliance certificate",
      "2 site visits per year",
      "2× social media mention",
    ],
  },
  {
    name: "Gold",
    range: "Rs.5L – 25L / year",
    accent: "#F5A623",
    bg: "bg-[#FFFBF0]",
    borderClass: "border-[#F5A623]",
    icon: Zap,
    featured: true,
    badge: "Most Popular",
    perks: [
      "All Silver benefits",
      "Logo on homepage banner",
      "Monthly impact report",
      "Event naming rights",
      "Employee volunteering day (50 people)",
      "Company name on all banners",
      "6× social media campaign",
    ],
  },
  {
    name: "Platinum",
    range: "Rs.25L+ / year",
    accent: "#1B5E37",
    bg: "bg-white",
    borderClass: "border-[#1B5E37]",
    icon: Crown,
    featured: false,
    badge: null,
    perks: [
      "All Gold benefits",
      "Hero banner feature",
      "Annual report co-branding",
      "Building / programme naming rights",
      "Unlimited employee volunteering days",
      "Press release co-authoring",
      "Board advisory seat",
      "Monthly social media campaign",
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CSRContent() {
  const formRef = useRef<HTMLDivElement>(null);

  const [form,       setForm]       = useState<FormState>(BLANK);
  const [errors,     setErrors]     = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [brochureDL, setBrochureDL] = useState(false);

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  const toggleProg = (prog: string) =>
    setForm((p) => ({
      ...p,
      programmes: p.programmes.includes(prog)
        ? p.programmes.filter((x) => x !== prog)
        : [...p.programmes, prog],
    }));

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.company.trim())     e.company     = "Company name is required";
    if (!form.contact.trim())     e.contact     = "Contact person is required";
    if (!form.designation.trim()) e.designation = "Designation is required";
    if (!form.email.trim())       e.email       = "Work email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim())       e.phone       = "Phone is required";
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter a valid 10-digit number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "csrInquiries"), {
        ...form,
        status:      "new",
        submittedAt: new Date().toISOString(),
        createdAt:   serverTimestamp(),
      });
      trackCSRInquiry();

      const waText = encodeURIComponent(
        `Hello Seva Group Foundation! I am ${form.contact} from ${form.company} (${form.designation}). ` +
        `We are interested in a CSR partnership (${form.tier || "tier TBD"}, budget: ${form.budget || "TBD"}). ` +
        `Please get in touch at ${form.email} or +91 ${form.phone}.`
      );
      window.open(`https://wa.me/${WA_NUMBER}?text=${waText}`, "_blank");
      setSubmitted(true);
      setForm(BLANK);
    } catch {
      setErrors({ company: "Submission failed. Please try again." });
    }
    setSubmitting(false);
  };

  const handleBrochure = async () => {
    setBrochureDL(true);
    try {
      const res = await fetch("/api/csr/brochure");
      if (!res.ok) throw new Error("API error");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Seva-Foundation-CSR-Brochure.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open WhatsApp to request brochure
      window.open(
        `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hello! I would like to receive the Seva Group Foundation CSR Brochure.")}`,
        "_blank"
      );
    }
    setBrochureDL(false);
  };

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative py-24 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #060d15 0%, #0c1f2e 50%, #112d40 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 60%, #1B5E37 0%, transparent 45%), radial-gradient(circle at 80% 20%, #F5A623 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <nav className="mb-6 flex items-center justify-center gap-2 text-sm text-white/40">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={13} />
            <span className="text-white/70">CSR Partnership</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-[#F5A623]/15 border border-[#F5A623]/25 rounded-full px-4 py-1.5 text-[#F5A623] text-xs font-semibold mb-6">
            <Building2 size={13} />
            Corporate Social Responsibility
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading leading-tight mb-5">
            Partner With Us.<br />Transform Lives.
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
            Fulfil your CSR mandate while creating lasting social impact in India.
            Transparent, compliant, and deeply meaningful.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="bg-[#F5A623] text-[#0c1f2e] font-bold px-8 py-3.5 rounded-full hover:bg-[#F7BA57] transition-all hover:scale-105 shadow-lg"
            >
              Submit CSR Proposal
            </button>
            <button
              onClick={handleBrochure}
              disabled={brochureDL}
              className="flex items-center gap-2 border border-white/25 text-white font-medium px-8 py-3.5 rounded-full hover:bg-white/8 transition-all disabled:opacity-60"
            >
              {brochureDL
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Download size={16} />}
              Download CSR Brochure
            </button>
          </div>
        </div>
      </section>

      {/* ── Why Seva ─────────────────────────────────────────────────── */}
      <section className="bg-[#F9FBF9] py-10 border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: TrendingUp, label: "100% Transparent", sub: "Fund Utilisation" },
              { icon: Shield,     label: "80G + FCRA Compliant", sub: "Tax & Regulatory Ready" },
              { icon: FileText,   label: "Impact Reports", sub: "Provided Every Quarter" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-[#1B5E37]/8 flex items-center justify-center">
                  <Icon size={20} className="text-[#1B5E37]" />
                </div>
                <p className="font-bold text-[#0F3D22] text-base">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partnership Tiers ─────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F3D22] font-heading mb-3">Partnership Tiers</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Choose the tier that matches your CSR budget and impact ambitions.
              All tiers come with full compliance documentation.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {TIERS.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.name}
                  className={`relative rounded-2xl border-2 ${tier.borderClass} ${tier.bg} p-7 transition-all ${
                    tier.featured ? "scale-105 shadow-xl" : "shadow-sm"
                  }`}
                >
                  {tier.badge && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap"
                      style={{ backgroundColor: tier.accent }}
                    >
                      {tier.badge}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${tier.accent}18` }}
                    >
                      <Icon size={20} style={{ color: tier.accent }} />
                    </div>
                    <div>
                      <p className="font-bold text-[#0F3D22] text-lg font-heading">{tier.name}</p>
                      <p className="text-xs text-gray-500">{tier.range}</p>
                    </div>
                  </div>

                  <div
                    className="h-0.5 my-5 rounded-full"
                    style={{ backgroundColor: `${tier.accent}40` }}
                  />

                  <ul className="space-y-2.5 mb-7">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2.5">
                        <CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: tier.accent }} />
                        <span className="text-sm text-gray-700">{perk}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => {
                      setForm((p) => ({ ...p, tier: tier.name }));
                      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="w-full py-3 rounded-full text-sm font-bold transition-all hover:scale-105"
                    style={{
                      backgroundColor: tier.featured ? tier.accent : "transparent",
                      border: `2px solid ${tier.accent}`,
                      color: tier.featured ? (tier.name === "Gold" ? "#0c1f2e" : "white") : tier.accent,
                    }}
                  >
                    Choose {tier.name}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Fund Allocation ───────────────────────────────────────────── */}
      <section className="bg-[#F9FBF9] py-14">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#0F3D22] font-heading mb-3">
                Where Your Money Goes
              </h2>
              <p className="text-gray-500 mb-8">
                Every rupee is tracked, reported, and deployed where it creates maximum impact.
                CSR partners receive detailed allocation breakdowns.
              </p>
              <div className="space-y-5">
                {FUND_BARS.map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      <span className="text-sm font-bold" style={{ color }}>{pct}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#1B5E37] rounded-2xl p-8 text-white">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
                  <Users size={28} className="text-[#F5A623]" />
                </div>
                <p className="font-bold text-xl font-heading mb-2">Impact at Scale</p>
                <p className="text-white/70 text-sm">What your partnership funds annually</p>
              </div>
              <div className="space-y-3">
                {[
                  ["840+", "Children directly supported"],
                  ["8,400+", "Meals served per month"],
                  ["50+", "Medical camps conducted"],
                  ["500+", "Trees planted"],
                ].map(([val, desc]) => (
                  <div key={desc} className="flex items-center gap-3">
                    <span className="w-16 text-[#F5A623] font-bold text-sm shrink-0">{val}</span>
                    <span className="text-white/75 text-sm">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CSR Compliance ────────────────────────────────────────────── */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#0F3D22] font-heading mb-3">CSR Compliance</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              All necessary certifications are in place. Your donation qualifies as CSR spend under the Companies Act 2013.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {COMPLIANCE.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-[#F9FBF9] rounded-xl p-4">
                <div className="w-9 h-9 rounded-lg bg-[#1B5E37]/8 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-[#1B5E37]" />
                </div>
                <span className="text-sm text-gray-700 font-medium">{text}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-5 py-2.5 text-green-700 text-sm font-semibold">
              <CheckCircle size={15} />
              Donations qualify as CSR spend under Companies Act 2013, Section 135
            </div>
          </div>
        </div>
      </section>

      {/* ── Past corporate partners ───────────────────────────────────── */}
      <section className="bg-[#F9FBF9] py-12">
        <div className="mx-auto max-w-5xl px-4">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-7">
            Trusted by Corporate Partners
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg bg-gray-100" />
                  <span className="text-xs text-gray-300">Corporate Partner {i}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CSR Proposal Form ─────────────────────────────────────────── */}
      <section ref={formRef} className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#0F3D22] font-heading mb-3">Submit CSR Proposal</h2>
            <p className="text-gray-500">Our CSR team will contact you within 24 hours</p>
          </div>

          {submitted ? (
            <div className="text-center bg-[#F9FBF9] rounded-2xl border border-[#1B5E37]/20 p-10">
              <div className="w-20 h-20 rounded-full bg-[#1B5E37] flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={36} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0F3D22] font-heading mb-3">Proposal Received!</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Our CSR team will contact you within 24 hours. A WhatsApp message has been opened for you — please send it to confirm receipt.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 font-medium px-6 py-3 rounded-full hover:bg-gray-50 transition-all"
              >
                Submit Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-6">

              {/* Company Details */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Company Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Company Name *</label>
                    <input type="text" placeholder="Your company name" value={form.company} onChange={set("company")} className={INPUT} />
                    {errors.company && <p className="mt-1 text-xs text-red-500">{errors.company}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Company Website</label>
                    <input type="url" placeholder="https://yourcompany.com" value={form.website} onChange={set("website")} className={INPUT} />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Contact Person</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                    <input type="text" placeholder="Contact person name" value={form.contact} onChange={set("contact")} className={INPUT} />
                    {errors.contact && <p className="mt-1 text-xs text-red-500">{errors.contact}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Designation *</label>
                    <input type="text" placeholder="e.g. CSR Head, CFO" value={form.designation} onChange={set("designation")} className={INPUT} />
                    {errors.designation && <p className="mt-1 text-xs text-red-500">{errors.designation}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Work Email *</label>
                    <input type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} className={INPUT} />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone *</label>
                    <div className="flex">
                      <span className="flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-sm text-gray-500 font-medium">+91</span>
                      <input type="tel" placeholder="10-digit number" value={form.phone} onChange={set("phone")} maxLength={10} className={`${INPUT} rounded-l-none`} />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Partnership Preferences */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Partnership Preferences</h3>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">CSR Budget</label>
                      <select value={form.budget} onChange={set("budget")} className={INPUT}>
                        <option value="">Select budget range…</option>
                        {BUDGETS.map((b) => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Preferred Tier</label>
                      <select value={form.tier} onChange={set("tier")} className={INPUT}>
                        <option value="">Select tier…</option>
                        {TIERS_PREF.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Preferred Programme(s)</label>
                    <div className="flex flex-wrap gap-2">
                      {PROGRAMMES.map((prog) => (
                        <button
                          key={prog}
                          type="button"
                          onClick={() => toggleProg(prog)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                            form.programmes.includes(prog)
                              ? "bg-[#1B5E37] text-white border-[#1B5E37] font-medium"
                              : "bg-white text-gray-600 border-gray-200 hover:border-[#1B5E37]/40"
                          }`}
                        >
                          {prog}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Timeline</label>
                    <div className="flex flex-wrap gap-2">
                      {TIMELINES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, timeline: t }))}
                          className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                            form.timeline === t
                              ? "bg-[#1B5E37] text-white border-[#1B5E37] font-medium"
                              : "bg-white text-gray-600 border-gray-200 hover:border-[#1B5E37]/40"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message / Special Requirements</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us about your CSR goals, preferred activities, or any special requirements…"
                      value={form.message}
                      onChange={set("message")}
                      className={`${INPUT} resize-none`}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1B5E37] text-white font-bold py-4 rounded-full text-base hover:bg-[#0d3320] transition-all hover:scale-[1.01] hover:shadow-lg disabled:opacity-60"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting…
                  </span>
                ) : "Submit CSR Proposal"}
              </button>

              <p className="text-center text-xs text-gray-400">
                Our CSR team will contact you within 24 hours · All information is confidential
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────── */}
      <section
        className="py-12"
        style={{ background: "linear-gradient(135deg, #060d15 0%, #0c1f2e 100%)" }}
      >
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Megaphone size={36} className="text-[#F5A623] mx-auto mb-4" />
          <h3 className="text-white font-bold text-xl font-heading mb-3">
            Ready to make a difference?
          </h3>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
            Call us directly to discuss your CSR requirements or download our brochure for detailed information.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+918287061147"
              className="inline-flex items-center gap-2 bg-[#F5A623] text-[#0c1f2e] font-bold px-6 py-3 rounded-full hover:bg-[#F7BA57] transition-all"
            >
              Call +91 82870 61147
            </a>
            <button
              onClick={handleBrochure}
              className="inline-flex items-center gap-2 border border-white/25 text-white font-medium px-6 py-3 rounded-full hover:bg-white/8 transition-all"
            >
              <Download size={15} />
              Download Brochure
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
