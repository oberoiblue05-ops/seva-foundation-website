"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, ChevronRight, Send, Users } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─── Constants ───────────────────────────────────────────────────────────────

const WA_NUMBER = "918287061147";
const WA_BASE   = `https://wa.me/${WA_NUMBER}`;
const PHONE_DISPLAY = "+91 82870 61147";
const EMAIL     = "contact@sevagroupfdn.org";
const MAPS_URL  = "https://maps.google.com/?q=Seva+Group+Foundation+Noida+Extension";

const CATEGORIES = [
  "General Enquiry",
  "I want to Donate",
  "I want to Volunteer",
  "Corporate CSR",
  "Media / Press",
  "Report a Child in Need",
];

const HOW_FOUND = ["Google", "Instagram", "Facebook", "Friend / Family", "WhatsApp", "Other"];

interface FormState {
  category: string;
  name:     string;
  email:    string;
  phone:    string;
  message:  string;
  howFound: string;
}

const BLANK: FormState = { category: "", name: "", email: "", phone: "", message: "", howFound: "" };

const INPUT =
  "w-full rounded-xl border border-gray-200 bg-[#F9FBF9] px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/35 focus:border-[#1B5E37] focus:outline-none focus:ring-2 focus:ring-[#1B5E37]/20 transition-colors";

// ─── Inline SVGs ─────────────────────────────────────────────────────────────

function WhatsAppIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ContactContent() {
  const [form,    setForm]    = useState<FormState>(BLANK);
  const [errors,  setErrors]  = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState<"whatsapp" | "email" | null>(null);

  const set =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
      setErrors((p) => ({ ...p, [key]: undefined }));
    };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.category)                                        e.category = "Please select a category";
    if (!form.name.trim())                                     e.name     = "Full name is required";
    if (!form.email.trim())                                    e.email    = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email    = "Enter a valid email";
    if (!form.phone.trim())                                    e.phone    = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) e.phone    = "Enter a valid 10-digit number";
    if (!form.message.trim())                                  e.message  = "Message is required";
    else if (form.message.trim().length < 20)                  e.message  = "Message must be at least 20 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveToFirestore = async () => {
    try {
      await addDoc(collection(db, "contactMessages"), {
        ...form,
        submittedAt: serverTimestamp(),
      });
    } catch {
      // non-blocking — don't fail the user flow if Firestore is unavailable
    }
  };

  const handleWhatsApp = async () => {
    if (!validate()) return;
    setSaving(true);
    await saveToFirestore();
    const text = [
      `*New Contact Message — Seva Group Foundation*`,
      `*Category:* ${form.category}`,
      `*Name:* ${form.name}`,
      `*Email:* ${form.email}`,
      `*Phone:* +91 ${form.phone}`,
      `*Message:* ${form.message}`,
      form.howFound ? `*Found us via:* ${form.howFound}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    window.open(`${WA_BASE}?text=${encodeURIComponent(text)}`, "_blank");
    setSaving(false);
    setSuccess("whatsapp");
    setForm(BLANK);
  };

  const handleEmail = () => {
    if (!validate()) return;
    const subject = encodeURIComponent(`[${form.category}] Message from ${form.name}`);
    const body = encodeURIComponent(
      `Category: ${form.category}\nName: ${form.name}\nEmail: ${form.email}\nPhone: +91 ${form.phone}\n\nMessage:\n${form.message}${form.howFound ? `\n\nFound us via: ${form.howFound}` : ""}`
    );
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    saveToFirestore();
    setSuccess("email");
    setForm(BLANK);
  };

  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        className="relative py-20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #071a0e 0%, #0F3D22 55%, #1B5E37 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #F5A623 0%, transparent 50%), radial-gradient(circle at 80% 20%, #fff 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <nav className="mb-6 flex items-center justify-center gap-2 text-sm text-white/50">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={13} />
            <span className="text-white/80">Contact</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mb-4">
            Get In Touch
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            WhatsApp is the fastest way to reach us —{" "}
            <span className="text-[#F5A623] font-semibold">usually 1 hour response</span>
          </p>
        </div>
      </section>

      {/* ── Quick contact strip ───────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* WhatsApp — most prominent */}
            <a
              href={`${WA_BASE}?text=${encodeURIComponent("Hello, I would like to know more about Seva Group Foundation")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl p-5 text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-100"
              style={{ backgroundColor: "#25D366" }}
            >
              <span className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <WhatsAppIcon size={24} />
              </span>
              <div>
                <p className="font-bold text-base leading-tight">Chat on WhatsApp</p>
                <p className="text-white/80 text-xs mt-0.5">{PHONE_DISPLAY} — Usually replies in 1 hour</p>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-4 rounded-2xl p-5 text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-100"
              style={{ backgroundColor: "#1B5E37" }}
            >
              <span className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Mail size={24} />
              </span>
              <div>
                <p className="font-bold text-base leading-tight">Send an Email</p>
                <p className="text-white/80 text-xs mt-0.5">{EMAIL}</p>
              </div>
            </a>

            {/* Call */}
            <a
              href="tel:+918287061147"
              className="flex items-center gap-4 rounded-2xl p-5 border-2 border-[#1B5E37] text-[#1B5E37] transition-all hover:scale-[1.02] hover:bg-[#1B5E37]/5 active:scale-100"
            >
              <span className="w-12 h-12 rounded-full bg-[#1B5E37]/10 flex items-center justify-center shrink-0">
                <Phone size={24} />
              </span>
              <div>
                <p className="font-bold text-base leading-tight">Call Us</p>
                <p className="text-[#1B5E37]/70 text-xs mt-0.5">{PHONE_DISPLAY} | Mon–Sat 10AM–6PM</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ── Two-column: form + info ───────────────────────────────────── */}
      <section className="bg-[#F9FBF9] py-14">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid lg:grid-cols-2 gap-10">

            {/* ── Left: Contact form ──────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
              <h2 className="text-xl font-bold text-[#0F3D22] mb-1 font-heading">Send Us a Message</h2>
              <p className="text-sm text-gray-500 mb-7">
                Fill the form below — then send via WhatsApp or Email, whichever you prefer.
              </p>

              {success && (
                <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium">
                  {success === "whatsapp"
                    ? "✓ Message opened in WhatsApp and saved. We'll reply within 1 hour."
                    : "✓ Email client opened. We've also saved your message."}
                </div>
              )}

              <div className="space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    How can we help? *
                  </label>
                  <select value={form.category} onChange={set("category")} className={INPUT}>
                    <option value="">Select a category…</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={set("name")}
                    className={INPUT}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Email + Phone row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Email *
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={set("email")}
                      className={INPUT}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Phone *
                    </label>
                    <div className="flex">
                      <span className="flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-sm text-gray-500 font-medium">
                        +91
                      </span>
                      <input
                        type="tel"
                        placeholder="10-digit number"
                        value={form.phone}
                        onChange={set("phone")}
                        maxLength={10}
                        className={`${INPUT} rounded-l-none`}
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Tell us how we can help you… (min 20 characters)"
                    value={form.message}
                    onChange={set("message")}
                    className={`${INPUT} resize-none`}
                  />
                  <div className="flex items-center justify-between mt-1">
                    {errors.message
                      ? <p className="text-xs text-red-500">{errors.message}</p>
                      : <span />}
                    <p className="text-xs text-gray-400 ml-auto">{form.message.length} chars</p>
                  </div>
                </div>

                {/* How did you find us */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    How did you find us?
                  </label>
                  <select value={form.howFound} onChange={set("howFound")} className={INPUT}>
                    <option value="">Select…</option>
                    {HOW_FOUND.map((h) => <option key={h}>{h}</option>)}
                  </select>
                </div>

                {/* Submit buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleWhatsApp}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 px-6 text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-lg active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#25D366" }}
                  >
                    <WhatsAppIcon size={16} />
                    {saving ? "Saving…" : "Send via WhatsApp"}
                  </button>
                  <button
                    onClick={handleEmail}
                    className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 px-6 text-sm font-bold text-white bg-[#1B5E37] transition-all hover:bg-[#0d3320] hover:scale-105 hover:shadow-lg active:scale-100"
                  >
                    <Send size={15} />
                    Send via Email
                  </button>
                </div>
              </div>
            </div>

            {/* ── Right: Contact info ──────────────────────────────── */}
            <div className="space-y-6">
              {/* Info card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 space-y-6">
                <h2 className="text-xl font-bold text-[#0F3D22] font-heading">Our Contact Details</h2>

                {/* Address */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1B5E37]/8 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-[#1B5E37]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Address</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Street No.3, Block D, Saraswati Kunj,<br />
                      Chipyana Khurd, Noida Extension,<br />
                      UP 201308
                    </p>
                    <a
                      href={MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 bg-[#F5A623] text-[#1B5E37] text-xs font-bold px-4 py-1.5 rounded-full hover:bg-[#F7BA57] transition-colors"
                    >
                      <MapPin size={12} />
                      Get Directions
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1B5E37]/8 flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-[#1B5E37]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Phone</p>
                    <a
                      href="tel:+918287061147"
                      className="text-sm font-semibold text-[#1B5E37] hover:underline"
                    >
                      {PHONE_DISPLAY}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1B5E37]/8 flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-[#1B5E37]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Email</p>
                    <a
                      href={`mailto:${EMAIL}`}
                      className="text-sm font-semibold text-[#1B5E37] hover:underline break-all"
                    >
                      {EMAIL}
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1B5E37]/8 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-[#1B5E37]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Office Hours</p>
                    <p className="text-sm text-gray-700 font-semibold">Monday to Saturday</p>
                    <p className="text-sm text-gray-600">10:00 AM – 6:00 PM IST</p>
                    <p className="text-xs text-gray-400 mt-1">Closed on national holidays</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA card */}
              <div
                className="rounded-2xl p-6 text-white"
                style={{ backgroundColor: "#25D366" }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <WhatsAppIcon size={26} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base leading-snug mb-1">Fastest response on WhatsApp</p>
                    <p className="text-white/80 text-sm mb-4">
                      Send us a message directly — our team is active on WhatsApp during office hours and responds within 1 hour.
                    </p>
                    <a
                      href={`${WA_BASE}?text=${encodeURIComponent("Hello, I would like to know more about Seva Group Foundation")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-white text-[#25D366] text-sm font-bold px-5 py-2.5 rounded-full hover:bg-green-50 transition-colors"
                    >
                      <WhatsAppIcon size={15} />
                      Open WhatsApp Chat
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Google Maps embed ─────────────────────────────────────────── */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-2xl font-bold text-[#0F3D22] font-heading mb-6">Find Us</h2>
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <iframe
              title="Seva Group Foundation location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.8!2d77.4!3d28.62!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNoida+Extension+UP!5e0!3m2!1sen!2sin!4v1"
              width="100%"
              height="380"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="mt-4 flex justify-center">
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#F5A623] text-[#1B5E37] font-bold text-sm px-6 py-2.5 rounded-full hover:bg-[#F7BA57] transition-all hover:scale-105"
            >
              <MapPin size={15} />
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* ── Volunteer shortcut card ───────────────────────────────────── */}
      <section className="bg-[#1B5E37] py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                <Users size={28} className="text-[#F5A623]" />
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight">Want to volunteer?</p>
                <p className="text-white/70 text-sm mt-0.5">Register directly — no contact form needed</p>
              </div>
            </div>
            <Link
              href="/volunteer"
              className="shrink-0 inline-flex items-center gap-2 bg-[#F5A623] text-[#1B5E37] font-bold text-sm px-8 py-3 rounded-full hover:bg-[#F7BA57] transition-all hover:scale-105 shadow-lg"
            >
              Register as Volunteer
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
