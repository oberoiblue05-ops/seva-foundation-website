"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { motion, type Variants } from "framer-motion";
import {
  ChevronRight, Copy, Check, Shield, BadgeCheck,
  Heart, Lock, TrendingUp, Users, Clock,
} from "lucide-react";
import {
  collection, query, where, orderBy, limit,
  getDocs, type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import DonationModal, { type DonationCampaign } from "@/components/DonationModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Campaign {
  id:          string;
  title:       string;
  description: string;
  goal:        number;
  raised:      number;
  endDate:     string;
  category:    string;
  imageSeed:   string;
}

interface DonorTick {
  name:      string;
  amount:    number;
  campaign:  string;
  timeLabel: string;
}

// ─── Placeholder data ─────────────────────────────────────────────────────────

const PLACEHOLDER_CAMPAIGNS: Campaign[] = [
  { id: "c1", title: "Winter Food Drive 2025",    description: "Providing 500 families with ration kits and hot meals through the winter months.",   goal: 100000, raised: 67200,  endDate: "2025-12-31", category: "Food Relief",     imageSeed: "camp-food"  },
  { id: "c2", title: "School Fee Fund 2025–26",   description: "Sponsor school fees, uniforms and books for 100 underprivileged children.",           goal: 200000, raised: 143500, endDate: "2026-03-31", category: "Education",       imageSeed: "camp-edu"   },
  { id: "c3", title: "Medical Camp Series 2025",  description: "Six free medical camps with doctors for 2,000+ patients across Noida Extension.",      goal: 150000, raised: 89000,  endDate: "2025-09-30", category: "Healthcare",      imageSeed: "camp-med"   },
  { id: "c4", title: "Tree Plantation Drive 2025",description: "Plant 500 native saplings across school grounds and public parks in NCR.",             goal: 50000,  raised: 12000,  endDate: "2025-08-15", category: "Environment",     imageSeed: "camp-tree"  },
];

const PLACEHOLDER_DONORS: DonorTick[] = [
  { name: "Ramesh K.",   amount: 1000, campaign: "General",        timeLabel: "5 min ago"  },
  { name: "Priya S.",    amount: 500,  campaign: "Food Relief",    timeLabel: "12 min ago" },
  { name: "Anuj M.",     amount: 2000, campaign: "Education",      timeLabel: "28 min ago" },
  { name: "Sunita D.",   amount: 1500, campaign: "Medical Camp",   timeLabel: "1 hr ago"   },
  { name: "Rohit G.",    amount: 500,  campaign: "General",        timeLabel: "2 hrs ago"  },
  { name: "Meera T.",    amount: 5000, campaign: "Tree Plantation",timeLabel: "3 hrs ago"  },
  { name: "Vikram P.",   amount: 1000, campaign: "Education",      timeLabel: "5 hrs ago"  },
  { name: "Neha R.",     amount: 2000, campaign: "Food Relief",    timeLabel: "6 hrs ago"  },
  { name: "Deepak V.",   amount: 500,  campaign: "General",        timeLabel: "8 hrs ago"  },
  { name: "Kavita Y.",   amount: 1000, campaign: "Medical Camp",   timeLabel: "Yesterday"  },
];

const UPI_ID   = "sevagroupfdn@sbi";
const UPI_NAME = "Seva Group Foundation";
const UPI_URI  = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&cu=INR&tn=${encodeURIComponent("Donation to " + UPI_NAME)}`;

const QUICK_AMOUNTS = [200, 500, 1000, 2000, 5000];

const TRUST_BADGES = [
  { Icon: Shield,      label: "Razorpay Secured",  sub: "256-bit SSL encryption"          },
  { Icon: BadgeCheck,  label: "80G Tax Exempt",    sub: "Income Tax Act, 1961"            },
  { Icon: Heart,       label: "Registered NGO",    sub: "Govt. of UP reg. trust"          },
  { Icon: Lock,        label: "SSL Encrypted",     sub: "Your data stays private"         },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pct(raised: number, goal: number) {
  return Math.min(Math.round((raised / goal) * 100), 100);
}

function daysLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function fmtRs(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

function CampaignCard({
  campaign,
  onDonate,
}: {
  campaign: Campaign;
  onDonate: (c: DonationCampaign) => void;
}) {
  const progress = pct(campaign.raised, campaign.goal);
  const days     = daysLeft(campaign.endDate);

  return (
    <motion.div
      variants={fadeUp}
      className="glass-light glass-hover flex flex-col overflow-hidden rounded-2xl"
    >
      <div className="relative" style={{ aspectRatio: "16/9" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://picsum.photos/seed/${campaign.imageSeed}/640/360`}
          alt={campaign.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span className="absolute right-3 top-3 rounded-full bg-[#1B5E37]/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
          {campaign.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-1 font-heading text-sm font-bold text-[#0F3D22]">{campaign.title}</h3>
        <p className="mb-4 flex-1 text-xs leading-relaxed text-[#1A1A1A]/60 line-clamp-2">
          {campaign.description}
        </p>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="font-bold text-[#1B5E37]">Rs. {fmtRs(campaign.raised)} raised</span>
            <span className="text-[#1A1A1A]/40">of Rs. {fmtRs(campaign.goal)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#1B5E37] to-[#F5A623]"
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-[#1A1A1A]/40">
            <span>{progress}% funded</span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {days > 0 ? `${days} days left` : "Ended"}
            </span>
          </div>
        </div>

        <button
          onClick={() => onDonate({ id: campaign.id, title: campaign.title })}
          className="w-full rounded-xl bg-[#1B5E37] py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          Donate to This Campaign
        </button>
      </div>
    </motion.div>
  );
}

function DonorTicker({ donors }: { donors: DonorTick[] }) {
  const doubled = [...donors, ...donors]; // for seamless loop

  return (
    <div className="overflow-hidden">
      <div className="flex animate-marquee gap-4">
        {doubled.map((d, i) => (
          <div
            key={i}
            className="flex shrink-0 items-center gap-3 rounded-full bg-white px-5 py-2.5 shadow-sm"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1B5E37]/10 text-xs font-bold text-[#1B5E37]">
              {d.name[0]}
            </span>
            <span className="text-sm">
              <span className="font-semibold text-[#0F3D22]">{d.name}</span>
              {" donated "}
              <span className="font-bold text-[#F5A623]">Rs. {fmtRs(d.amount)}</span>
              {" to "}
              <span className="text-[#1A1A1A]/60">{d.campaign}</span>
            </span>
            <span className="text-xs text-[#1A1A1A]/40">{d.timeLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type DonationTab = "onetime" | "monthly" | "sponsor";

export default function DonationsPage() {
  const [tab,            setTab]           = useState<DonationTab>("onetime");
  const [selectedAmount, setSelectedAmount]= useState<number>(500);
  const [customAmount,   setCustomAmount]  = useState("");
  const [showCustom,     setShowCustom]    = useState(false);
  const [modalOpen,      setModalOpen]     = useState(false);
  const [modalCampaign,  setModalCampaign] = useState<DonationCampaign | undefined>();
  const [campaigns,      setCampaigns]     = useState<Campaign[]>(PLACEHOLDER_CAMPAIGNS);
  const [donors,         setDonors]        = useState<DonorTick[]>(PLACEHOLDER_DONORS);
  const [upiCopied,      setUpiCopied]     = useState(false);

  const finalAmount = showCustom
    ? Number(customAmount) || 0
    : selectedAmount;

  // Load campaigns from Firestore
  useEffect(() => {
    const load = async () => {
      try {
        const q   = query(collection(db, "campaigns"), where("isActive", "==", true), limit(4));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setCampaigns(
            snap.docs.map((d) => ({
              id:          d.id,
              title:       (d.data().title       as string) ?? "",
              description: (d.data().description as string) ?? "",
              goal:        (d.data().goal        as number) ?? 0,
              raised:      (d.data().raised      as number) ?? 0,
              endDate:     ((d.data().endDate    as Timestamp | undefined)?.toDate?.() ?? new Date()).toISOString(),
              category:    (d.data().category    as string) ?? "",
              imageSeed:   (d.data().imageSeed   as string) ?? "camp-default",
            }))
          );
        }
      } catch {
        // keep placeholder data
      }
    };
    load();
  }, []);

  // Load recent donors from Firestore
  useEffect(() => {
    const load = async () => {
      try {
        const q = query(
          collection(db, "donations"),
          where("status",   "==", "success"),
          where("isPublic", "==", true),
          orderBy("timestamp", "desc"),
          limit(10)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setDonors(
            snap.docs.map((d) => {
              const ts = (d.data().timestamp as Timestamp | undefined)?.toDate?.() ?? new Date();
              const diff = Date.now() - ts.getTime();
              let timeLabel: string;
              if (diff < 3_600_000) timeLabel = `${Math.floor(diff / 60_000)} min ago`;
              else if (diff < 86_400_000) timeLabel = `${Math.floor(diff / 3_600_000)} hrs ago`;
              else timeLabel = ts.toLocaleDateString("en-IN");
              return {
                name:      `${((d.data().name as string) ?? "Donor").split(" ")[0]} ${((d.data().name as string) ?? "").split(" ")[1]?.[0] ?? ""}.`,
                amount:    (d.data().amount   as number) ?? 0,
                campaign:  (d.data().campaign as string) ?? "General",
                timeLabel,
              };
            })
          );
        }
      } catch {
        // keep placeholder donors
      }
    };
    load();
  }, []);

  const openModal = (campaign?: DonationCampaign) => {
    setModalCampaign(campaign);
    setModalOpen(true);
  };

  const handleDonateNow = () => openModal();

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setUpiCopied(true);
      setTimeout(() => setUpiCopied(false), 2500);
    } catch {
      // silent
    }
  };

  const campaignOptions: DonationCampaign[] = campaigns.map((c) => ({ id: c.id, title: c.title }));

  return (
    <main>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#1B5E37] to-[#0F3D22] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="mb-5 flex items-center gap-2 text-sm text-white/60">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">Donate</span>
          </nav>
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Support a Life Today
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-white/70">
              Every rupee you give feeds a child, funds a school seat, or runs a medical camp.
              100% transparent. 80G tax exempt. No middlemen.
            </p>
          </div>

          {/* Trust row */}
          <div className="mt-8 flex flex-wrap gap-4">
            {[
              "80G Tax Exempt",
              "Razorpay Secured",
              "Govt. Registered Trust",
              "Quarterly Reports Published",
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                <Check size={12} className="text-[#F5A623]" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Donation Tabs ───────────────────────────────────────── */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Tab bar */}
          <div className="mb-8 flex overflow-hidden rounded-2xl border border-gray-100 bg-[#F9FBF9] p-1">
            {([
              { id: "onetime", label: "One-Time" },
              { id: "monthly", label: "Monthly" },
              { id: "sponsor", label: "Sponsor a Child" },
            ] as { id: DonationTab; label: string }[]).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${
                  tab === id
                    ? "bg-[#1B5E37] text-white shadow-md"
                    : "text-[#1A1A1A]/50 hover:text-[#1B5E37]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── One-time & Monthly tab content ── */}
          {(tab === "onetime" || tab === "monthly") && (
            <div>
              {tab === "monthly" && (
                <div className="mb-6 rounded-2xl bg-[#F5A623]/10 p-4 text-sm text-[#0F3D22]">
                  <TrendingUp size={16} className="mr-1.5 inline text-[#F5A623]" />
                  Your card will be charged the same amount on this date every month. Cancel anytime.
                </div>
              )}

              {/* Quick amounts */}
              <div className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => { setSelectedAmount(amt); setShowCustom(false); setCustomAmount(""); }}
                    className={`rounded-2xl py-3.5 text-center transition-all ${
                      !showCustom && selectedAmount === amt
                        ? "bg-[#1B5E37] text-white shadow-lg scale-105"
                        : "bg-[#F9FBF9] text-[#1A1A1A]/70 hover:bg-[#1B5E37]/10 hover:text-[#1B5E37]"
                    }`}
                  >
                    <span className="block text-xs font-semibold text-current/60">Rs.</span>
                    <span className="block font-heading text-lg font-bold">{fmtRs(amt)}</span>
                  </button>
                ))}
                <button
                  onClick={() => setShowCustom(true)}
                  className={`rounded-2xl py-3.5 sm:col-span-1 col-span-3 transition-all ${
                    showCustom
                      ? "bg-[#F5A623] text-[#0F3D22] shadow-lg scale-105"
                      : "bg-[#F9FBF9] text-[#1A1A1A]/60 hover:bg-[#F5A623]/20 hover:text-[#0F3D22]"
                  }`}
                >
                  <span className="block text-xs font-semibold">Custom</span>
                  <span className="block font-heading text-lg font-bold">Any</span>
                </button>
              </div>

              {/* Custom amount input */}
              {showCustom && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-5"
                >
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-heading text-lg font-bold text-[#1B5E37]">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount in Rs."
                      autoFocus
                      className="w-full rounded-2xl border-2 border-[#1B5E37]/30 bg-[#F9FBF9] py-4 pl-10 pr-4 font-heading text-xl font-bold focus:border-[#1B5E37] focus:outline-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* Impact preview */}
              {finalAmount > 0 && (
                <div className="mb-6 rounded-2xl bg-[#1B5E37]/5 p-4 text-sm text-[#0F3D22]">
                  <span className="font-bold">Rs. {fmtRs(finalAmount)}</span> can{" "}
                  {finalAmount >= 5000
                    ? "fund a full medical camp for 10 patients."
                    : finalAmount >= 2000
                    ? "provide meals for a family for a month."
                    : finalAmount >= 1000
                    ? "sponsor a child's school supplies."
                    : finalAmount >= 500
                    ? "feed a family for a week."
                    : "provide 4 nutritious meals."}
                </div>
              )}

              <button
                onClick={handleDonateNow}
                disabled={finalAmount < 1}
                className="w-full rounded-2xl bg-gradient-to-r from-[#1B5E37] to-[#0F3D22] py-5 text-base font-bold text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {tab === "monthly"
                  ? `Set Up Rs. ${fmtRs(finalAmount)}/month`
                  : `Donate Rs. ${fmtRs(finalAmount)} →`}
              </button>
            </div>
          )}

          {/* ── Sponsor a Child tab ── */}
          {tab === "sponsor" && (
            <div className="rounded-2xl bg-[#F9FBF9] p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1B5E37]/10">
                <Users size={28} className="text-[#1B5E37]" />
              </div>
              <h3 className="mb-2 font-heading text-xl font-bold text-[#0F3D22]">
                Rs. 500/month changes a child's life
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-[#1A1A1A]/60">
                Choose a child from our programme. Your Rs. 500/month covers their meals, school fees,
                and medical care. You receive monthly progress updates.
              </p>
              <Link
                href="/sponsor"
                className="inline-block rounded-2xl bg-[#1B5E37] px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:scale-105"
              >
                See Children Waiting for a Sponsor →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Campaign Cards ──────────────────────────────────────── */}
      <section className="bg-[#F9FBF9] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-[#1B5E37]">
                Active Campaigns
              </p>
              <h2 className="font-heading text-2xl font-bold text-[#0F3D22] sm:text-3xl">
                Fund a Specific Mission
              </h2>
            </div>
          </div>
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {campaigns.map((c) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                onDonate={(camp) => openModal(camp)}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── UPI Section ────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: QR + UPI ID */}
            <div className="flex flex-col items-center gap-6">
              <div className="rounded-3xl bg-[#F9FBF9] p-8 shadow-inner">
                <QRCodeSVG
                  value={UPI_URI}
                  size={200}
                  fgColor="#0F3D22"
                  bgColor="#F9FBF9"
                  level="H"
                  imageSettings={{
                    src: "/logo.png",
                    x:   undefined,
                    y:   undefined,
                    height: 40,
                    width:  40,
                    opacity: 1,
                    excavate: true,
                  }}
                />
              </div>

              <div className="flex w-full max-w-xs items-center gap-2 rounded-2xl border border-[#1B5E37]/20 bg-[#F9FBF9] px-5 py-3">
                <span className="flex-1 font-mono text-sm font-semibold text-[#0F3D22]">{UPI_ID}</span>
                <button
                  onClick={handleCopyUpi}
                  className="flex items-center gap-1 rounded-xl bg-[#1B5E37] px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
                  title="Copy UPI ID"
                >
                  {upiCopied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
            </div>

            {/* Right: Instructions */}
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#1B5E37]">
                UPI Payment
              </p>
              <h2 className="mb-6 font-heading text-2xl font-bold text-[#0F3D22] sm:text-3xl">
                Pay Directly via UPI
              </h2>
              <ol className="space-y-5">
                {[
                  { step: "1", text: "Open any UPI app — GPay, PhonePe, Paytm, BHIM or your bank app." },
                  { step: "2", text: `Scan the QR code or search for UPI ID: ${UPI_ID}` },
                  { step: "3", text: "Enter your donation amount and add a note (e.g. \"Donation for food drive\")." },
                  { step: "4", text: `WhatsApp your payment screenshot to +91 82870 61147 to receive your 80G receipt.` },
                ].map(({ step, text }) => (
                  <li key={step} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B5E37] font-heading text-sm font-bold text-white">
                      {step}
                    </span>
                    <p className="pt-1 text-sm leading-relaxed text-[#1A1A1A]/70">{text}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-6 rounded-2xl bg-[#F5A623]/10 p-4 text-xs text-[#0F3D22]">
                <strong>Account name: </strong>Seva Group Foundation &nbsp;·&nbsp;
                <strong>Bank: </strong>State Bank of India &nbsp;·&nbsp;
                <strong>UPI: </strong>{UPI_ID}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ───────────────────────────────────────── */}
      <section className="bg-[#0F3D22] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {TRUST_BADGES.map(({ Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-3 rounded-2xl bg-white/10 p-6 text-center backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5A623]/20">
                  <Icon size={22} className="text-[#F5A623]" />
                </div>
                <p className="font-heading text-sm font-bold text-white">{label}</p>
                <p className="text-xs text-white/50">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Donor Ticker ───────────────────────────────────── */}
      <section className="bg-[#F9FBF9] py-10">
        <div className="mx-auto max-w-7xl overflow-hidden px-4 sm:px-6">
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#1A1A1A]/40">
            <span className="inline-block h-2 w-2 rounded-full bg-[#1B5E37] animate-pulse" />
            Recent Donations
          </p>
          <DonorTicker donors={donors} />
        </div>
      </section>

      {/* ── FAQ strip ──────────────────────────────────────────── */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-8 font-heading text-xl font-bold text-[#0F3D22]">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Is my donation eligible for 80G tax deduction?",
                a: "Yes. Seva Group Foundation is registered under Section 80G of the Income Tax Act, 1961. You can claim 50% deduction on your taxable income. Your receipt is emailed immediately after payment.",
              },
              {
                q: "How do I know my money is used correctly?",
                a: "We publish quarterly financial reports on our Legal page. 85% of every donation goes directly to programme beneficiaries — one of the lowest admin-overhead ratios in the sector.",
              },
              {
                q: "Can I donate for a specific child or campaign?",
                a: "Yes. Use the campaign cards above, or visit /sponsor to sponsor a specific child for Rs. 500/month with monthly progress updates.",
              },
              {
                q: "What payment methods are accepted?",
                a: "All major credit/debit cards, net banking, UPI (GPay, PhonePe, Paytm, BHIM), and wallets via Razorpay. You can also pay via the UPI QR code above.",
              },
            ].map(({ q, a }) => (
              <details key={q} className="group rounded-2xl border border-gray-100 bg-[#F9FBF9]">
                <summary className="flex cursor-pointer list-none items-center justify-between p-5 font-semibold text-[#0F3D22]">
                  {q}
                  <ChevronRight
                    size={16}
                    className="text-[#1B5E37] transition-transform group-open:rotate-90"
                  />
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-[#1A1A1A]/65">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Donation Modal ─────────────────────────────────────── */}
      <DonationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialAmount={finalAmount > 0 ? finalAmount : 500}
        preselectedCampaign={modalCampaign}
        campaigns={campaignOptions}
        isRecurring={tab === "monthly"}
      />
    </main>
  );
}
