"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock, ChevronRight } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─── Constants ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  "General Enquiry",
  "I want to Donate",
  "I want to Volunteer",
  "Corporate CSR",
  "Media / Press",
  "Report a Child in Need",
] as const;

interface FormState {
  category: string;
  name:     string;
  email:    string;
  phone:    string;
  message:  string;
}

const INITIAL: FormState = { category: "", name: "", email: "", phone: "", message: "" };

const INPUT =
  "w-full rounded-xl border border-gray-200 bg-[#F9FBF9] px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/35 focus:border-[#1B5E37] focus:outline-none focus:ring-2 focus:ring-[#1B5E37]/20 transition-colors";

// ─── WhatsApp icon (inline SVG — lucide has no brand icons) ────────────────

function WhatsAppIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [form, setForm]     = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [saving, setSaving] = useState(false);

  const set =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.category)                                         e.category = "Please select a category";
    if (!form.name.trim())                                      e.name     = "Name is required";
    if (!form.email.trim())                                     e.email    = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))   e.email    = "Enter a valid email";
    if (!form.phone.trim())                                     e.phone    = "Phone is required";
    if (form.message.trim().length < 20)                        e.message  = "Message must be at least 20 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveToFirestore = async () => {
    try {
      await addDoc(collection(db, "contactMessages"), {
        ...form,
        via: "whatsapp",
        createdAt: serverTimestamp(),
      });
    } catch {
      // silently fail — WhatsApp still opens
    }
  };

  const handleWhatsApp = async () => {
    if (!validate()) return;
    setSaving(true);
    await saveToFirestore();
    setSaving(false);
    const text = [
      `*Seva Group Foundation — Contact Form*`,
      ``,
      `*Category:* ${form.category}`,
      `*Name:* ${form.name}`,
      `*Email:* ${form.email}`,
      `*Phone:* +91 ${form.phone}`,
      ``,
      `*Message:*`,
      form.message,
    ].join("\n");
    window.open(`https://wa.me/918287061147?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleEmail = () => {
    if (!validate()) return;
    const subject = `[${form.category}] Message from ${form.name}`;
    const body = [
      `Category: ${form.category}`,
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: +91${form.phone}`,
      ``,
      `Message:`,
      form.message,
    ].join("\n");
    window.location.href = `mailto:contact@sevagroupfdn.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <main>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#1B5E37] to-[#0F3D22] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="mb-5 flex items-center gap-2 text-sm text-white/60" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">Contact</span>
          </nav>
          <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">Get In Touch</h1>
          <p className="mt-3 text-lg text-white/70">
            WhatsApp is the fastest way to reach us — we respond within the hour.
          </p>
        </div>
      </section>

      {/* ── Quick contact buttons ────────────────────────────────── */}
      <section className="bg-[#F9FBF9] py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">

            <a
              href="https://wa.me/918287061147?text=Hello%2C+I+would+like+to+know+more+about+Seva+Group+Foundation"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl bg-[#25D366] p-5 text-white shadow-lg shadow-[#25D366]/20 transition-all hover:scale-[1.02]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <WhatsAppIcon size={24} />
              </div>
              <div>
                <p className="font-bold">Chat on WhatsApp</p>
                <p className="text-sm text-white/80">+91 82870 61147</p>
              </div>
            </a>

            <a
              href="mailto:contact@sevagroupfdn.org"
              className="flex items-center gap-4 rounded-2xl bg-[#1B5E37] p-5 text-white shadow-lg shadow-[#1B5E37]/20 transition-all hover:scale-[1.02]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <Mail size={24} />
              </div>
              <div>
                <p className="font-bold">Send an Email</p>
                <p className="text-sm text-white/80">contact@sevagroupfdn.org</p>
              </div>
            </a>

            <a
              href="tel:+918287061147"
              className="flex items-center gap-4 rounded-2xl border-2 border-[#1B5E37] bg-white p-5 text-[#1B5E37] shadow-sm transition-all hover:scale-[1.02] hover:bg-[#F9FBF9]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1B5E37]/10">
                <Phone size={24} />
              </div>
              <div>
                <p className="font-bold">Call Us</p>
                <p className="text-sm text-[#1A1A1A]/55">+91 82870 61147 | Mon–Sat 10AM–6PM</p>
              </div>
            </a>

          </div>
        </div>
      </section>

      {/* ── Two-column layout ────────────────────────────────────── */}
      <section className="bg-[#F9FBF9] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">

            {/* LEFT — Contact Form */}
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="mb-6 font-heading text-2xl font-bold text-[#0F3D22]">Send Us a Message</h2>

              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>

                {/* Category */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1A1A1A]">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select value={form.category} onChange={set("category")} className={INPUT}>
                    <option value="">Select a category…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                </div>

                {/* Name + Email */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1A1A1A]">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Ramesh Kumar"
                      className={INPUT}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1A1A1A]">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@example.com"
                      className={INPUT}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                </div>

                {/* Phone with +91 prefix */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1A1A1A]">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="flex items-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 px-3 text-sm font-medium text-[#1A1A1A]/50">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="98765 43210"
                      maxLength={10}
                      className="w-full rounded-l-none rounded-r-xl border border-gray-200 bg-[#F9FBF9] px-4 py-3 text-sm focus:border-[#1B5E37] focus:outline-none focus:ring-2 focus:ring-[#1B5E37]/20 transition-colors"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                </div>

                {/* Message */}
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-sm font-semibold text-[#1A1A1A]">
                    <span>Message <span className="text-red-500">*</span></span>
                    <span className={`text-xs font-normal transition-colors ${form.message.length >= 20 ? "text-[#1B5E37]" : "text-[#1A1A1A]/35"}`}>
                      {form.message.length} / 20+ chars
                    </span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={set("message")}
                    rows={5}
                    placeholder="Tell us about your enquiry, how you&apos;d like to help, or any question you have…"
                    className={`${INPUT} resize-none`}
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                </div>

                {/* Submit buttons */}
                <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-[#25D366]/20 transition-all hover:bg-[#20BD5C] disabled:opacity-60"
                  >
                    <WhatsAppIcon size={18} />
                    {saving ? "Saving…" : "Send via WhatsApp"}
                  </button>
                  <button
                    type="button"
                    onClick={handleEmail}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#1B5E37] px-5 py-3.5 text-sm font-bold text-[#1B5E37] transition-all hover:bg-[#1B5E37] hover:text-white"
                  >
                    <Mail size={16} />
                    Send via Email
                  </button>
                </div>

              </form>
            </div>

            {/* RIGHT — Contact Info */}
            <div className="flex flex-col gap-6">

              <div className="glass-light rounded-2xl p-7">
                <h2 className="mb-6 font-heading text-xl font-bold text-[#0F3D22]">Contact Information</h2>

                <div className="space-y-5">

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B5E37]/10">
                      <MapPin size={20} className="text-[#1B5E37]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F3D22]">Address</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-[#1A1A1A]/65">
                        Street No.3, Block D, Saraswati Kunj,<br />
                        Chipyana Khurd, Noida Extension,<br />
                        UP 201308
                      </p>
                      <a
                        href="https://maps.google.com/?q=Seva+Group+Foundation+Noida+Extension"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2.5 inline-block rounded-full bg-[#F5A623] px-4 py-1.5 text-xs font-bold text-[#0F3D22] transition-opacity hover:opacity-90"
                      >
                        Get Directions →
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B5E37]/10">
                      <Phone size={20} className="text-[#1B5E37]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F3D22]">Phone</p>
                      <a href="tel:+918287061147" className="mt-0.5 text-sm text-[#1B5E37] underline-offset-2 hover:underline">
                        +91 82870 61147
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B5E37]/10">
                      <Mail size={20} className="text-[#1B5E37]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F3D22]">Email</p>
                      <a href="mailto:contact@sevagroupfdn.org" className="mt-0.5 text-sm text-[#1B5E37] underline-offset-2 hover:underline">
                        contact@sevagroupfdn.org
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B5E37]/10">
                      <Clock size={20} className="text-[#1B5E37]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F3D22]">Office Hours</p>
                      <p className="mt-0.5 text-sm text-[#1A1A1A]/65">
                        Monday to Saturday, 10:00 AM – 6:00 PM IST
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              <div className="glass-light rounded-2xl p-6">
                <p className="mb-4 text-sm font-semibold text-[#0F3D22]">Also Find Us On</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { name: "WhatsApp",  href: "https://wa.me/918287061147", bg: "bg-[#25D366]"      },
                    { name: "Facebook",  href: "#",                           bg: "bg-[#1877F2]"      },
                    { name: "Instagram", href: "#",                           bg: "bg-gradient-to-br from-[#833AB4] to-[#FD1D1D]" },
                    { name: "YouTube",   href: "#",                           bg: "bg-[#FF0000]"      },
                  ].map(({ name, href, bg }) => (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={name}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-80 ${bg}`}
                    >
                      {name[0]}
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Google Maps embed ────────────────────────────────────── */}
      <section className="bg-[#F9FBF9] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-2xl shadow-lg">
            <iframe
              src="https://maps.google.com/maps?q=Chipyana+Khurd+Noida+Extension+Uttar+Pradesh+201308+India&output=embed"
              width="100%"
              height="380"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Seva Group Foundation — Noida Extension Location"
            />
          </div>
        </div>
      </section>

      {/* ── Volunteer shortcut ───────────────────────────────────── */}
      <section className="bg-[#1B5E37] py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#F5A623]">Get Involved</p>
          <h2 className="mt-3 font-heading text-2xl font-bold text-white">Want to Volunteer?</h2>
          <p className="mt-2 text-white/60">
            Register directly and join our 200+ active volunteers across Noida &amp; NCR.
          </p>
          <Link
            href="/volunteer"
            className="mt-7 inline-block rounded-full bg-[#F5A623] px-8 py-3.5 text-sm font-bold text-[#0F3D22] shadow-lg transition-all hover:scale-105 hover:bg-[#F7BA57]"
          >
            Register as Volunteer →
          </Link>
        </div>
      </section>

    </main>
  );
}
