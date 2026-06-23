"use client";

import Link from "next/link";
import {
  Home, Users, Heart, BookOpen, Utensils, Stethoscope,
  TreePine, UserCheck, Gift, HeartHandshake, Shield,
  Activity, Lock, HandHeart, Share2,
} from "lucide-react";
import { WHATSAPP_LINK } from "@/constants";

// ─── Icon map ──────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Home, Users, Heart, BookOpen, Utensils, Stethoscope,
  TreePine, UserCheck, Gift, HeartHandshake, Shield,
  Ribbon: Activity,
  Lock,
};

// ─── Per-service rich content ───────────────────────────────────────────────

const SERVICE_DETAILS: Record<string, {
  what: { heading: string; body: string[] };
  stats: { value: string; label: string }[];
  photos: number[];
}> = {
  orphanage:            { what: { heading: "A Home Beyond Four Walls", body: ["Our orphanage programme gives fully orphaned children a safe, loving home environment. Children receive three nutritious meals a day, school enrolment, tutoring support, and access to healthcare.", "We ensure each child has a caregiver they trust, celebrates festivals, and experiences the warmth of community — not just shelter."] }, stats: [{ value: "120+", label: "Children in Care" }, { value: "98%", label: "School Attendance" }, { value: "100%", label: "Health Coverage" }], photos: [101, 202, 303] },
  "old-age":            { what: { heading: "Dignity in Every Decade", body: ["Our old-age home provides dignified shelter, balanced meals, and round-the-clock companionship for elderly individuals abandoned by family or left without support.", "Regular health check-ups, recreation activities, and festival celebrations ensure our residents live with joy, not just survival."] }, stats: [{ value: "60+", label: "Residents Housed" }, { value: "2", label: "Doctors on Call" }, { value: "100%", label: "Meals Provided Daily" }], photos: [104, 205, 306] },
  "street-children":    { what: { heading: "From Streets to Schools", body: ["We identify and rescue children living on Noida's streets through night patrols and community referrals. Once safe, children enter our rehabilitation programme — health checks, trauma counselling, and gradual schooling.", "Our reintegration team works to reconnect children with family where safe, or places them in our residential care programme."] }, stats: [{ value: "200+", label: "Children Rescued" }, { value: "85%", label: "Enrolled in School" }, { value: "70%", label: "Family Reintegration" }], photos: [107, 208, 309] },
  education:            { what: { heading: "Learning as Liberation", body: ["We fund school fees, uniforms, books, and stationery for children who would otherwise drop out. Our tutoring centres run six days a week with trained volunteer educators.", "A digital literacy lab — donated by our CSR partners — gives children access to computers and coding fundamentals."] }, stats: [{ value: "350+", label: "Scholarships Given" }, { value: "6", label: "Tutoring Centres" }, { value: "92%", label: "Exam Pass Rate" }], photos: [110, 211, 312] },
  "food-relief":        { what: { heading: "No Child Sleeps Hungry", body: ["Our community kitchen distributes 500+ meals daily at key locations across Noida Extension. Monthly ration kits reach 200 families including rice, dal, oil, and hygiene supplies.", "During festivals and emergencies, we scale up distribution — reaching 2,000+ people in a single drive."] }, stats: [{ value: "8,400+", label: "Meals Served/Year" }, { value: "200", label: "Families Monthly" }, { value: "12", label: "Distribution Points" }], photos: [113, 214, 315] },
  "medical-support":    { what: { heading: "Healthcare as a Right", body: ["We run quarterly free medical camps with general physicians, eye specialists, and dental doctors serving 300–500 patients per camp. Emergency medicine and ambulance support is available for urgent cases.", "Our partnership with local hospitals ensures referrals are honoured and treatment costs are covered for the most vulnerable."] }, stats: [{ value: "50+", label: "Camps Held" }, { value: "5,000+", label: "Patients Served" }, { value: "12", label: "Partner Hospitals" }], photos: [116, 217, 318] },
  "tree-plantation":    { what: { heading: "Planting for Posterity", body: ["Through our Green Noida initiative we organise community tree plantation drives in public parks, school grounds, and roadsides. Each sapling is tracked for survival over three years.", "We educate children about climate change and environmental stewardship — making them active participants, not just bystanders."] }, stats: [{ value: "500+", label: "Trees Planted" }, { value: "80%", label: "3-Year Survival" }, { value: "20+", label: "Drive Events" }], photos: [119, 220, 321] },
  widows:               { what: { heading: "Rebuilding Lives with Dignity", body: ["Widows in our programme receive monthly financial aid, vocational skill training (tailoring, handicrafts, tiffin services), and legal guidance on inheritance and property rights.", "A dedicated counsellor provides emotional support and group therapy sessions, helping women rediscover confidence and community."] }, stats: [{ value: "80+", label: "Widows Supported" }, { value: "45", label: "Income-Generating" }, { value: "100%", label: "Legal Aid Access" }], photos: [122, 223, 324] },
  donation:             { what: { heading: "Every Rupee Counted", body: ["General donations fund our operational backbone — from kitchen fuel to transport costs to staff salaries. We publish quarterly financial reports so every donor can see exactly where their money went.", "A minimum of 85% of every donation reaches programme beneficiaries directly — our admin overhead is among the lowest in the sector."] }, stats: [{ value: "85%", label: "Direct Programme Use" }, { value: "₹0", label: "Admin Overhead Cap" }, { value: "4", label: "Quarterly Reports" }], photos: [125, 226, 327] },
  "semi-orphans":       { what: { heading: "Supporting the Whole Family", body: ["Losing one parent creates immediate financial and emotional strain. We step in with daily meals for the child, school fee support, and weekly counselling for both the surviving parent and the child.", "Our case managers visit families monthly to track progress and adjust the support package as needs change."] }, stats: [{ value: "150+", label: "Families Helped" }, { value: "100%", label: "School Retention" }, { value: "12", label: "Monthly Visits" }], photos: [128, 229, 330] },
  "accidental-orphans": { what: { heading: "Stability After Sudden Loss", body: ["When a child is suddenly orphaned due to an accident, our rapid response team provides emergency shelter within 72 hours, trauma counselling, and legal guardianship support.", "Long-term, these children join our residential programme with full education and healthcare coverage until they are independent adults."] }, stats: [{ value: "72 hrs", label: "Response Time" }, { value: "40+", label: "Children in Care" }, { value: "100%", label: "Education Covered" }], photos: [131, 232, 333] },
  "cancer-family-support": { what: { heading: "When Illness Strikes a Family", body: ["A cancer diagnosis often bankrupts families, pulling children out of school. We intervene immediately with school fee coverage, meal support, and counselling for children carrying an adult burden.", "Our network of oncology social workers coordinates directly with hospital family welfare desks to identify and enrol families before they fall through the cracks."] }, stats: [{ value: "60+", label: "Families Enrolled" }, { value: "95%", label: "School Retention" }, { value: "8", label: "Hospital Partners" }], photos: [134, 235, 336] },
  "prisoner-family-children": { what: { heading: "Breaking the Stigma Cycle", body: ["Children of incarcerated parents face social isolation, school drop-out, and generational poverty. We enrol children confidentially, protecting their identity from peers.", "A dedicated social worker mentors each child weekly, while our team works with schools to ensure teachers are sensitised and supportive."] }, stats: [{ value: "35+", label: "Children Enrolled" }, { value: "100%", label: "Confidential Enrolment" }, { value: "6", label: "Partner Schools" }], photos: [137, 238, 339] },
};

// ─── Types ─────────────────────────────────────────────────────────────────

interface Service {
  readonly slug:        string;
  readonly title:       string;
  readonly description: string;
  readonly icon:        string;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function ServicePageContent({ service }: { service: Service }) {
  const Icon    = ICON_MAP[service.icon] ?? Heart;
  const details = SERVICE_DETAILS[service.slug] ?? SERVICE_DETAILS.donation;
  const shareUrl = typeof window !== "undefined"
    ? window.location.href
    : `https://sevagroupfdn.org/services/${service.slug}`;

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B5E37] to-[#0F3D22] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="mb-5 flex items-center gap-2 flex-wrap text-sm text-white/60">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-white transition-colors">Services</Link>
            <span>/</span>
            <span className="text-white">{service.title}</span>
          </nav>
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Icon size={32} className="text-white" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {service.title}
              </h1>
              <p className="mt-2 max-w-xl text-white/70">{service.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="bg-[#F9FBF9] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#1B5E37]">
                What We Do
              </p>
              <h2 className="mb-6 font-heading text-2xl font-bold text-[#0F3D22] sm:text-3xl">
                {details.what.heading}
              </h2>
              <div className="space-y-4 leading-relaxed text-[#1A1A1A]/70">
                {details.what.body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Impact stat cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {details.stats.map(({ value, label }) => (
                <div key={label} className="glass-light rounded-2xl p-6 text-center">
                  <p className="font-heading text-3xl font-bold text-[#F5A623]">{value}</p>
                  <p className="mt-1 text-sm font-medium text-[#0F3D22]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Photo preview grid */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-8 font-heading text-xl font-bold text-[#0F3D22]">
            Programme Gallery
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {details.photos.map((seed) => (
              <div
                key={seed}
                className="relative overflow-hidden rounded-2xl"
                style={{ aspectRatio: "4/3" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://picsum.photos/seed/${seed}/600/450`}
                  alt={`${service.title} programme`}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <p className="mt-4 text-right">
            <Link href="/gallery" className="text-sm text-[#1B5E37] underline-offset-2 hover:underline">
              View full gallery →
            </Link>
          </p>
        </div>
      </section>

      {/* How You Can Help */}
      <section className="bg-[#1B5E37] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
              How You Can Help
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                Icon: Gift,
                title: "Donate Money",
                desc: "Fund this programme directly. Even Rs. 100 provides a meal.",
                href: "/donations",
                cta: "Donate Now",
                ctaClass: "bg-[#F5A623] text-[#0F3D22]",
              },
              {
                Icon: HandHeart,
                title: "Volunteer Time",
                desc: "Join our on-ground team for camps, tutoring, or outreach drives.",
                href: "/volunteer",
                cta: "Sign Up",
                ctaClass: "bg-white text-[#1B5E37]",
              },
              {
                Icon: Share2,
                title: "Share & Spread",
                desc: "Share this page on WhatsApp and social media to raise awareness.",
                href: `https://wa.me/?text=${encodeURIComponent(`Support ${service.title} by Seva Group Foundation: ${shareUrl}`)}`,
                cta: "Share on WhatsApp",
                ctaClass: "bg-[#25D366] text-white",
                external: true,
              },
            ].map(({ Icon: I, title, desc, href, cta, ctaClass, external }) => (
              <div key={title} className="flex flex-col rounded-2xl bg-white/10 p-7 backdrop-blur-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                  <I size={22} className="text-white" />
                </div>
                <h3 className="mb-2 font-heading font-bold text-white">{title}</h3>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-white/65">{desc}</p>
                {external ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block rounded-full py-2.5 text-center text-sm font-bold transition-opacity hover:opacity-90 ${ctaClass}`}
                  >
                    {cta}
                  </a>
                ) : (
                  <Link
                    href={href}
                    className={`block rounded-full py-2.5 text-center text-sm font-bold transition-opacity hover:opacity-90 ${ctaClass}`}
                  >
                    {cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation CTA */}
      <section className="bg-[#0F3D22] py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
            Every Contribution Reaches Real Lives
          </h2>
          <p className="mt-3 text-white/60">
            Your donation to {service.title} is 80G tax-deductible and goes directly to programme beneficiaries.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/donations"
              className="min-w-[160px] rounded-full bg-[#F5A623] px-7 py-3.5 text-sm font-bold text-[#0F3D22] shadow-lg transition-all hover:scale-105"
            >
              Donate Now
            </Link>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[160px] rounded-full border-2 border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
