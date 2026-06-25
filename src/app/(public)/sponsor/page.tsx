"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, CheckCircle, Lock } from "lucide-react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CHILDREN } from "@/constants";
import SponsorModal, { type ChildForSponsor } from "@/components/SponsorModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Child {
  id:          string;
  name:        string;
  age:         number;
  category:    string;
  story:       string;
  imageSeed?:  number;
  photo?:      string;
  isSponsored: boolean;
}

// ─── Category label map ───────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  "orphan":          "Orphan",
  "semi-orphan":     "Semi-Orphan",
  "flood-affected":  "Flood Affected",
  "accident-family": "Accident Family",
  "cancer-family":   "Cancer Family",
};

// ─── How It Works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    n:    "01",
    title: "Choose a Child",
    desc:  "Browse our child profiles below and pick the one whose story moves your heart.",
  },
  {
    n:    "02",
    title: "Set Up Rs.500/month",
    desc:  "Complete a secure Razorpay checkout. Cancel anytime — no long commitments.",
  },
  {
    n:    "03",
    title: "Receive Monthly Updates",
    desc:  "Get progress reports, photos, and stories about your sponsored child every month.",
  },
];

// ─── Breakdown card ───────────────────────────────────────────────────────────

const BREAKDOWN = [
  { amount: "Rs.200", label: "Daily meals — 3 times a day", color: "bg-green-50  border-green-200  text-green-700" },
  { amount: "Rs.150", label: "School stationery and books",  color: "bg-blue-50   border-blue-200   text-blue-700"  },
  { amount: "Rs.100", label: "Uniform maintenance",          color: "bg-amber-50  border-amber-200  text-amber-700" },
  { amount: "Rs.50",  label: "Recreation and activities",    color: "bg-purple-50 border-purple-200 text-purple-700"},
];

// ─── Child Card ───────────────────────────────────────────────────────────────

function ChildCard({ child, onSponsor }: { child: Child; onSponsor: (c: ChildForSponsor) => void }) {
  const photoSrc   = child.photo ?? `https://picsum.photos/seed/${child.imageSeed ?? child.id}/300/300`;
  const badgeLabel = CATEGORY_LABELS[child.category] ?? child.category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-light rounded-2xl overflow-hidden flex flex-col shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Photo */}
      <div className="relative">
        <div className="aspect-square overflow-hidden">
          <Image
            src={photoSrc}
            alt={child.name}
            width={300}
            height={300}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Circular photo overlay effect */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/80 to-transparent" />
        <span className="absolute top-3 left-3 bg-[#1B5E37] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
          {badgeLabel}
        </span>
        {child.isSponsored && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white/95 rounded-2xl px-4 py-3 text-center">
              <CheckCircle className="mx-auto mb-1 text-[#1B5E37]" size={22} />
              <p className="text-sm font-bold text-[#1B5E37]">Sponsored</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading font-bold text-[#0F3D22] text-lg">{child.name}</h3>
          <span className="text-xs bg-[#F9FBF9] border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
            Age {child.age}
          </span>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed flex-1 line-clamp-3">{child.story}</p>

        <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
          {/* Status */}
          <div className="flex items-center gap-1.5">
            {child.isSponsored ? (
              <>
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-xs text-gray-400 font-medium">Sponsored</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#1B5E37] animate-pulse" />
                <span className="text-xs text-[#1B5E37] font-medium">Available for Sponsorship</span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#1B5E37] font-bold">
              Rs.500<span className="text-xs font-normal text-gray-400">/month</span>
            </span>
            <button
              disabled={child.isSponsored}
              onClick={() =>
                onSponsor({
                  id:        child.id,
                  name:      child.name,
                  age:       child.age,
                  category:  child.category,
                  imageSeed: child.imageSeed,
                  photo:     child.photo,
                })
              }
              className="flex items-center gap-1.5 bg-[#1B5E37] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#0d3320] transition-all hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Heart size={12} />
              Sponsor {child.name}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SponsorPage() {
  const [children,      setChildren]      = useState<Child[]>([]);
  const [firestoreLoad, setFirestoreLoad] = useState(true);
  const [selectedChild, setSelectedChild] = useState<ChildForSponsor | null>(null);

  useEffect(() => {
    let timedOut = false;

    const timer = setTimeout(() => {
      if (firestoreLoad) {
        timedOut = true;
        setChildren([...CHILDREN] as unknown as Child[]);
        setFirestoreLoad(false);
      }
    }, 4000);

    const q = query(collection(db, "children"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        clearTimeout(timer);
        if (!timedOut) {
          if (snap.empty) {
            setChildren([...CHILDREN] as unknown as Child[]);
          } else {
            setChildren(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Child)));
          }
          setFirestoreLoad(false);
        }
      },
      () => {
        clearTimeout(timer);
        if (!timedOut) {
          setChildren([...CHILDREN] as unknown as Child[]);
          setFirestoreLoad(false);
        }
      },
    );

    return () => { clearTimeout(timer); unsub(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24 md:py-32"
        style={{ background: "linear-gradient(135deg, #071a0e 0%, #1B5E37 100%)" }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_60%,#F5A623,transparent_55%)]" />
        <div className="relative z-10 container mx-auto px-4 text-center max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-[#F5A623]/20 border border-[#F5A623]/40 text-[#F5A623] text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6"
          >
            Child Sponsorship Programme
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading text-4xl md:text-6xl font-bold text-white leading-tight mb-6"
          >
            Sponsor a Child.{" "}
            <span className="text-[#F5A623]">Change a Life.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/75 text-lg md:text-xl leading-relaxed mb-10"
          >
            Rs.500/month — less than a cup of coffee a day — provides education, meals, and hope
            for a child who needs you.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm"
          >
            {["80G Tax Benefit", "Secure Razorpay", "Monthly Updates", "Cancel Anytime"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#F5A623]" />
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-[#F9FBF9] py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0F3D22] text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-14 h-14 rounded-full bg-[#1B5E37] flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#F5A623] font-bold text-sm font-heading">{s.n}</span>
                </div>
                <h3 className="font-bold text-[#0F3D22] mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Child Profiles ── */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0F3D22] mb-3">
              Children Awaiting Your Support
            </h2>
            <p className="text-gray-500 text-sm md:text-base">
              Each child has a story. Find the one that speaks to your heart.
            </p>
          </div>

          {firestoreLoad ? (
            <div className="flex justify-center py-20">
              <span className="w-10 h-10 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
              {children.map((child) => (
                <ChildCard key={child.id} child={child} onSponsor={setSelectedChild} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── What Rs.500 Covers ── */}
      <section className="bg-[#F9FBF9] py-16 border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="font-heading text-2xl font-bold text-[#0F3D22] text-center mb-8">
            What Rs.500 Covers
          </h2>
          <div className="space-y-3">
            {BREAKDOWN.map(({ amount, label, color }) => (
              <div
                key={amount}
                className={`flex items-center gap-4 border rounded-xl px-5 py-4 ${color}`}
              >
                <span className="font-heading font-bold text-xl w-20 shrink-0">{amount}</span>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-xs mt-6">
            100% of sponsorship funds go directly to the child&apos;s care. No admin deductions.
          </p>
        </div>
      </section>

      {/* ── Security note ── */}
      <section className="bg-white py-8 border-t border-gray-100">
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <Lock size={14} />
            Secured by Razorpay · 256-bit SSL
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle size={14} className="text-[#1B5E37]" />
            80G tax deduction certificate issued
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle size={14} className="text-[#1B5E37]" />
            Cancel sponsorship anytime
          </span>
        </div>
      </section>

      {/* ── Sponsor Modal ── */}
      {selectedChild && (
        <SponsorModal child={selectedChild} onClose={() => setSelectedChild(null)} />
      )}
    </>
  );
}
