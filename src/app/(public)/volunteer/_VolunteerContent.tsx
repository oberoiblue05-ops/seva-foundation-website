"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  MapPin, Calendar, Laptop, ChevronRight, Award, FileText,
  Star, Users, Clock, Globe, CheckCircle, Heart,
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { trackVolunteerSignup } from "@/lib/track-conversion";

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const VOLUNTEER_TYPES = [
  { value: "on-site",    label: "On-Site Volunteer" },
  { value: "events",     label: "Events & Camp" },
  { value: "remote",     label: "Remote Skills" },
  { value: "all-three",  label: "All Three" },
];

const HOURS_OPTIONS = ["4–8", "8–16", "16–32", "32+"];

const BENEFITS = [
  { icon: Award,       text: "Certificate of Volunteering (downloadable PDF)" },
  { icon: FileText,    text: "Impact certificate showing total hours" },
  { icon: Star,        text: "Letter of Recommendation (for 50+ hours)" },
  { icon: Heart,       text: "Priority invitation to all Seva events" },
  { icon: CheckCircle, text: "Seva Volunteer ID card" },
  { icon: CheckCircle, text: "80G tax benefit for monetary contributions" },
];

const STORIES = [
  {
    name: "Priya Sharma",
    profession: "School Teacher, Noida",
    quote: "Teaching the children at Seva's centre every Saturday is the highlight of my week. Watching them go from struggling with basic maths to solving problems confidently is deeply fulfilling.",
    helped: "Education volunteer — 120 hours",
    initials: "PS",
  },
  {
    name: "Rahul Mehta",
    profession: "Software Engineer, Delhi",
    quote: "I wanted to use my tech skills for something meaningful. Seva let me build their digital literacy lab from scratch. Now 200 kids are learning to code because of it.",
    helped: "Remote skills — website & digital lab",
    initials: "RM",
  },
  {
    name: "Dr. Sunita Gupta",
    profession: "Ophthalmologist, Noida",
    quote: "Running the free eye camp was one of the most rewarding days of my career. We examined 300 patients in a single day. That kind of scale and impact is hard to find anywhere else.",
    helped: "Medical camp volunteer — 3 camps",
    initials: "SG",
  },
];

const INPUT =
  "w-full rounded-xl border border-gray-200 bg-[#F9FBF9] px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/35 focus:border-[#1B5E37] focus:outline-none focus:ring-2 focus:ring-[#1B5E37]/20 transition-colors";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  name:            string;
  email:           string;
  phone:           string;
  city:            string;
  volunteerType:   string;
  skills:          string;
  availableDays:   string[];
  hoursPerMonth:   string;
  motivation:      string;
  emergencyName:   string;
  emergencyPhone:  string;
  ageConfirmed:    boolean;
  termsAccepted:   boolean;
}

const BLANK: FormState = {
  name: "", email: "", phone: "", city: "", volunteerType: "",
  skills: "", availableDays: [], hoursPerMonth: "", motivation: "",
  emergencyName: "", emergencyPhone: "", ageConfirmed: false, termsAccepted: false,
};

// ─── WhatsApp SVG ────────────────────────────────────────────────────────────

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function VolunteerContent() {
  const formRef  = useRef<HTMLDivElement>(null);
  const typesRef = useRef<HTMLDivElement>(null);

  const [form,     setForm]     = useState<FormState>(BLANK);
  const [errors,   setErrors]   = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [savedName,  setSavedName]  = useState("");

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: (e.target as HTMLInputElement).type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value }));

  const toggleDay = (day: string) =>
    setForm((p) => ({
      ...p,
      availableDays: p.availableDays.includes(day)
        ? p.availableDays.filter((d) => d !== day)
        : [...p.availableDays, day],
    }));

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim())                                         e.name           = "Full name is required";
    if (!form.email.trim())                                        e.email          = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))      e.email          = "Enter a valid email";
    if (!form.phone.trim())                                        e.phone          = "Phone is required";
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, "")))     e.phone          = "Enter a valid 10-digit number";
    if (!form.city.trim())                                         e.city           = "City / Area is required";
    if (!form.volunteerType)                                       e.volunteerType  = "Please select a volunteer type";
    if (!form.hoursPerMonth)                                       e.hoursPerMonth  = "Please select hours per month";
    if (!form.motivation.trim())                                   e.motivation     = "Please tell us your motivation";
    else if (form.motivation.trim().length < 50)                   e.motivation     = "Please write at least 50 characters";
    if (!form.emergencyName.trim())                                e.emergencyName  = "Emergency contact name is required";
    if (!form.emergencyPhone.trim())                               e.emergencyPhone = "Emergency contact phone is required";
    if (!form.ageConfirmed)                                        e.ageConfirmed   = "You must be 18 or older to volunteer";
    if (!form.termsAccepted)                                       e.termsAccepted  = "Please accept the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "volunteers"), {
        name:           form.name.trim(),
        email:          form.email.trim(),
        phone:          form.phone.trim(),
        city:           form.city.trim(),
        volunteerType:  form.volunteerType,
        skills:         form.skills.trim(),
        availableDays:  form.availableDays,
        hoursPerMonth:  form.hoursPerMonth,
        motivation:     form.motivation.trim(),
        emergencyName:  form.emergencyName.trim(),
        emergencyPhone: form.emergencyPhone.trim(),
        status:         "pending",
        hoursLogged:    0,
        appliedAt:      serverTimestamp(),
        createdAt:      new Date().toISOString(),
      });
      trackVolunteerSignup(form.volunteerType);
      setSavedName(form.name.trim());
      setSubmitted(true);
      setForm(BLANK);
    } catch {
      setErrors({ name: "Submission failed. Please try again." });
    }
    setSubmitting(false);
  };

  const waShareText = encodeURIComponent(
    `Hi! I just registered as a volunteer with Seva Group Foundation. Join me in making a difference → https://sevagroupfdn.org/volunteer`
  );

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative py-24 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #071a0e 0%, #0F3D22 55%, #1B5E37 100%)" }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 60%, #F5A623 0%, transparent 50%), radial-gradient(circle at 80% 20%, #fff 0%, transparent 40%)" }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <nav className="mb-6 flex items-center justify-center gap-2 text-sm text-white/50">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={13} />
            <span className="text-white/80">Volunteer</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-[#F5A623]/20 border border-[#F5A623]/30 rounded-full px-4 py-1.5 text-[#F5A623] text-xs font-semibold mb-6">
            <Users size={13} />
            200+ Active Volunteers
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading leading-tight mb-5">
            Be the Change.<br />Volunteer with Seva.
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
            Join 200+ volunteers making a real difference in Noida Extension. Every hour you give transforms a life.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => scrollTo(formRef)}
              className="bg-[#F5A623] text-[#1B5E37] font-bold px-8 py-3.5 rounded-full hover:bg-[#F7BA57] transition-all hover:scale-105 shadow-lg"
            >
              Register as Volunteer
            </button>
            <button
              onClick={() => scrollTo(typesRef)}
              className="border border-white/30 text-white font-medium px-8 py-3.5 rounded-full hover:bg-white/10 transition-all"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ── Impact stats ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Users,  value: "200+",   label: "Active Volunteers" },
              { icon: Clock,  value: "5,000+", label: "Hours Given" },
              { icon: Globe,  value: "15",     label: "Cities" },
              { icon: Heart,  value: "3",      label: "Volunteer Types" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-[#1B5E37]/8 flex items-center justify-center mb-1">
                  <Icon size={18} className="text-[#1B5E37]" />
                </div>
                <p className="text-2xl font-bold text-[#1B5E37] font-heading">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Volunteer type cards ──────────────────────────────────────── */}
      <section ref={typesRef} className="bg-[#F9FBF9] py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F3D22] font-heading mb-3">How You Can Help</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Choose a volunteer type that fits your schedule, skills, and location.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 — On-Site */}
            <div className="glass-light rounded-2xl p-7 relative">
              <span className="absolute top-4 right-4 bg-[#F5A623] text-[#1B5E37] text-xs font-bold px-3 py-1 rounded-full">
                Most Needed
              </span>
              <div className="w-12 h-12 rounded-xl bg-[#1B5E37]/8 flex items-center justify-center mb-5">
                <MapPin size={22} className="text-[#1B5E37]" />
              </div>
              <h3 className="font-bold text-[#0F3D22] text-lg mb-2 font-heading">On-Site Volunteer</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Visit our facility in Noida Extension. Help with meals, teaching, and direct community service.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#1B5E37] font-semibold">
                <Clock size={13} />
                Minimum 4 hours / month
              </div>
            </div>

            {/* Card 2 — Events */}
            <div className="glass-light rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-[#1B5E37]/8 flex items-center justify-center mb-5">
                <Calendar size={22} className="text-[#1B5E37]" />
              </div>
              <h3 className="font-bold text-[#0F3D22] text-lg mb-2 font-heading">Events &amp; Camp Volunteer</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Help organise medical camps, food drives, tree plantations, and festival events across NCR.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#1B5E37] font-semibold">
                <Clock size={13} />
                Flexible — event-based
              </div>
            </div>

            {/* Card 3 — Remote */}
            <div className="glass-light rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-[#1B5E37]/8 flex items-center justify-center mb-5">
                <Laptop size={22} className="text-[#1B5E37]" />
              </div>
              <h3 className="font-bold text-[#0F3D22] text-lg mb-2 font-heading">Remote Skills Volunteer</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Contribute design, coding, content, social media, legal, or accounting skills from anywhere in the world.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#1B5E37] font-semibold">
                <Globe size={13} />
                Work from anywhere, any time
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Volunteer stories ─────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F3D22] font-heading mb-3">Volunteer Stories</h2>
            <p className="text-gray-500">Real people, real impact.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STORIES.map((s) => (
              <div key={s.name} className="glass-light rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#1B5E37] flex items-center justify-center text-white font-bold text-base shrink-0">
                    {s.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F3D22] text-sm">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.profession}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed flex-1 italic">&ldquo;{s.quote}&rdquo;</p>
                <div className="flex items-center gap-1.5 text-xs text-[#1B5E37] font-semibold">
                  <CheckCircle size={13} />
                  {s.helped}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────────────── */}
      <section className="bg-[#F9FBF9] py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#0F3D22] font-heading mb-3">
                What You Get
              </h2>
              <p className="text-gray-500 mb-8">
                We believe in recognising every hour of service. Here&apos;s what Seva volunteers receive:
              </p>
              <div className="space-y-4">
                {BENEFITS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1B5E37]/8 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={15} className="text-[#1B5E37]" />
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#1B5E37] rounded-2xl p-8 text-white">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
                  <Award size={30} className="text-[#F5A623]" />
                </div>
                <h3 className="font-bold text-xl font-heading mb-2">Ready to start?</h3>
                <p className="text-white/70 text-sm">
                  Registration takes 3 minutes. We&apos;ll contact you within 48 hours.
                </p>
              </div>
              <div className="space-y-3 text-sm">
                {["Fill the form below", "Our team reviews your application", "We contact you within 48 hours", "Start making a difference!"].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#F5A623] text-[#1B5E37] flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-white/80">{step}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => scrollTo(formRef)}
                className="mt-8 w-full bg-[#F5A623] text-[#1B5E37] font-bold py-3 rounded-full hover:bg-[#F7BA57] transition-all hover:scale-105"
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Registration form ─────────────────────────────────────────── */}
      <section ref={formRef} className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#0F3D22] font-heading mb-3">Register as a Volunteer</h2>
            <p className="text-gray-500">Takes 3 minutes · We reply within 48 hours</p>
          </div>

          {submitted ? (
            /* Success card */
            <div className="text-center bg-[#F9FBF9] rounded-2xl border border-[#1B5E37]/20 p-10">
              <div className="w-20 h-20 rounded-full bg-[#1B5E37] flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={36} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0F3D22] font-heading mb-3">
                Thank you, {savedName}!
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your application has been received. Our volunteer coordinator will contact you within 48 hours to discuss next steps.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`https://wa.me/?text=${waShareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3 rounded-full hover:bg-[#20BD5C] transition-all"
                >
                  <WhatsAppIcon size={16} />
                  Share on WhatsApp
                </a>
                <button
                  onClick={() => setSubmitted(false)}
                  className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 font-medium px-6 py-3 rounded-full hover:bg-gray-50 transition-all"
                >
                  Register Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-6">

              {/* Personal details */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Personal Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                    <input type="text" placeholder="Your full name" value={form.name} onChange={set("name")} className={INPUT} />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label>
                    <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} className={INPUT} />
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
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">City / Area *</label>
                    <input type="text" placeholder="e.g. Noida, Delhi, Ghaziabad" value={form.city} onChange={set("city")} className={INPUT} />
                    {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                  </div>
                </div>
              </div>

              {/* Volunteer preferences */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Volunteer Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Volunteer Type *</label>
                    <select value={form.volunteerType} onChange={set("volunteerType")} className={INPUT}>
                      <option value="">Select type…</option>
                      {VOLUNTEER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    {errors.volunteerType && <p className="mt-1 text-xs text-red-500">{errors.volunteerType}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Skills / Profession</label>
                    <textarea
                      rows={2}
                      placeholder="Tell us your skills e.g. doctor, teacher, designer, coder…"
                      value={form.skills}
                      onChange={set("skills")}
                      className={`${INPUT} resize-none`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Available Days</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            form.availableDays.includes(day)
                              ? "bg-[#1B5E37] text-white border-[#1B5E37]"
                              : "bg-white text-gray-600 border-gray-200 hover:border-[#1B5E37]/40"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Hours per Month *</label>
                    <div className="flex flex-wrap gap-2">
                      {HOURS_OPTIONS.map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, hoursPerMonth: h }))}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            form.hoursPerMonth === h
                              ? "bg-[#1B5E37] text-white border-[#1B5E37]"
                              : "bg-white text-gray-600 border-gray-200 hover:border-[#1B5E37]/40"
                          }`}
                        >
                          {h} hrs
                        </button>
                      ))}
                    </div>
                    {errors.hoursPerMonth && <p className="mt-1 text-xs text-red-500">{errors.hoursPerMonth}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Why do you want to volunteer? * <span className="text-gray-400 font-normal">(min 50 chars)</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Share your motivation and what you hope to contribute…"
                      value={form.motivation}
                      onChange={set("motivation")}
                      className={`${INPUT} resize-none`}
                    />
                    <div className="flex justify-between mt-1">
                      {errors.motivation
                        ? <p className="text-xs text-red-500">{errors.motivation}</p>
                        : <span />}
                      <p className="text-xs text-gray-400 ml-auto">{form.motivation.length} chars</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency contact */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Emergency Contact</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contact Name *</label>
                    <input type="text" placeholder="Emergency contact name" value={form.emergencyName} onChange={set("emergencyName")} className={INPUT} />
                    {errors.emergencyName && <p className="mt-1 text-xs text-red-500">{errors.emergencyName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contact Phone *</label>
                    <div className="flex">
                      <span className="flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-sm text-gray-500 font-medium">+91</span>
                      <input type="tel" placeholder="10-digit number" value={form.emergencyPhone} onChange={set("emergencyPhone")} maxLength={10} className={`${INPUT} rounded-l-none`} />
                    </div>
                    {errors.emergencyPhone && <p className="mt-1 text-xs text-red-500">{errors.emergencyPhone}</p>}
                  </div>
                </div>
              </div>

              {/* Confirmations */}
              <div className="space-y-3 border-t border-gray-100 pt-5">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.ageConfirmed}
                    onChange={set("ageConfirmed")}
                    className="mt-0.5 w-4 h-4 accent-[#1B5E37] shrink-0"
                  />
                  <span className="text-sm text-gray-700">I am 18 years or older *</span>
                </label>
                {errors.ageConfirmed && <p className="text-xs text-red-500 ml-7">{errors.ageConfirmed}</p>}

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.termsAccepted}
                    onChange={set("termsAccepted")}
                    className="mt-0.5 w-4 h-4 accent-[#1B5E37] shrink-0"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to Seva Group Foundation&apos;s volunteer guidelines and consent to being contacted regarding my application. *
                  </span>
                </label>
                {errors.termsAccepted && <p className="text-xs text-red-500 ml-7">{errors.termsAccepted}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1B5E37] text-white font-bold py-4 rounded-full text-base hover:bg-[#0d3320] transition-all hover:scale-[1.01] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting…
                  </span>
                ) : "Submit Volunteer Application"}
              </button>

              <p className="text-center text-xs text-gray-400">
                We will contact you within 48 hours · Your data is kept confidential
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
