"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp, increment, limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import {
  MapPin, Clock, Calendar, Share2, CheckCircle,
  ShoppingBasket, ChevronDown, Package, Heart,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────

export const GROCERY_ITEMS = [
  { key: "rice",      label: "Rice 1–5 kg",         unit: "kg",  emoji: "🌾", defaultTarget: 100 },
  { key: "dal",       label: "Dal / Lentils",        unit: "kg",  emoji: "🫘", defaultTarget: 50  },
  { key: "oil",       label: "Cooking Oil",          unit: "ltr", emoji: "🫙", defaultTarget: 30  },
  { key: "atta",      label: "Wheat Flour / Atta",   unit: "kg",  emoji: "🌾", defaultTarget: 80  },
  { key: "sugar",     label: "Sugar",                unit: "kg",  emoji: "🍬", defaultTarget: 40  },
  { key: "salt",      label: "Salt",                 unit: "kg",  emoji: "🧂", defaultTarget: 20  },
  { key: "biscuits",  label: "Biscuits / Snacks",    unit: "pkt", emoji: "🍪", defaultTarget: 60  },
  { key: "sanitary",  label: "Sanitary Products",    unit: "pkt", emoji: "🧴", defaultTarget: 25  },
  { key: "soap",      label: "Soap / Hygiene",       unit: "pcs", emoji: "🧼", defaultTarget: 40  },
  { key: "readymade", label: "Ready-to-eat Items",   unit: "pkt", emoji: "🥫", defaultTarget: 35  },
] as const;

const PICKUP_TIMES = [
  "Morning (9:00 AM – 12:00 PM)",
  "Afternoon (12:00 PM – 3:00 PM)",
  "Evening (3:00 PM – 6:00 PM)",
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface DriveItem { target: number; received: number; }
interface Drive {
  id:             string;
  name:           string;
  status:         "active" | "completed";
  date:           string;
  time:           string;
  location:       string;
  mapsLink?:      string;
  totalKg?:       number;
  familiesServed?: number;
  pledgeCount?:   number;
  items?:         Record<string, DriveItem>;
  createdAt?:     string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function WaveDividerLightToDark() {
  return (
    <div className="overflow-hidden leading-[0] bg-[#F9FBF9]">
      <svg viewBox="0 0 1440 48" fill="none" preserveAspectRatio="none" className="w-full h-12">
        <path d="M0 0L60 8C120 16 240 32 360 37.3C480 42.7 600 37.3 720 32C840 26.7 960 21.3 1080 24C1200 26.7 1320 37.3 1380 42.7L1440 48V48H0Z" fill="#0F3D22" />
      </svg>
    </div>
  );
}

function WaveDividerDarkToLight() {
  return (
    <div className="overflow-hidden leading-[0] bg-[#0F3D22]">
      <svg viewBox="0 0 1440 48" fill="none" preserveAspectRatio="none" className="w-full h-12">
        <path d="M0 48L60 40C120 32 240 16 360 10.7C480 5.3 600 10.7 720 16C840 21.3 960 26.7 1080 24C1200 21.3 1320 10.7 1380 5.3L1440 0V0H0Z" fill="#F9FBF9" />
      </svg>
    </div>
  );
}

// ── WishlistItem card ─────────────────────────────────────────────────────────

function WishlistItem({ item, received, target }: {
  item: typeof GROCERY_ITEMS[number];
  received: number;
  target: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const percent = target > 0 ? Math.min((received / target) * 100, 100) : 0;
  const needed  = Math.max(0, target - received);

  return (
    <div ref={ref} className="glass-light glass-hover rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl" aria-hidden="true">{item.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#0F3D22] text-sm leading-tight">{item.label}</p>
          <p className="text-xs text-[#1A1A1A]/50 mt-0.5">
            {received} / {target} {item.unit} received
          </p>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${percent >= 100 ? "bg-green-500/20 text-green-700" : "bg-[#1B5E37]/10 text-[#1B5E37]"}`}>
          {percent >= 100 ? "✓ Done" : `${Math.round(percent)}%`}
        </span>
      </div>

      <div className="h-2.5 bg-[#1B5E37]/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #1B5E37, #F5A623)" }}
          initial={{ width: "0%" }}
          animate={inView ? { width: `${percent}%` } : {}}
          transition={{ duration: 1.3, ease: "easeOut", delay: 0.15 }}
        />
      </div>

      {needed > 0 && (
        <p className="text-[10px] text-[#1A1A1A]/40 mt-2">
          Still need: {needed} {item.unit}
        </p>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function DonateGroceriesContent() {
  const [activeDrive,     setActiveDrive]     = useState<Drive | null>(null);
  const [completedDrives, setCompletedDrives] = useState<Drive[]>([]);
  const [loadingDrives,   setLoadingDrives]   = useState(true);

  // Form state
  const [name,             setName]             = useState("");
  const [phone,            setPhone]            = useState("");
  const [selectedItems,    setSelectedItems]    = useState<Record<string, boolean>>({});
  const [itemQtys,         setItemQtys]         = useState<Record<string, string>>({});
  const [dropoffMethod,    setDropoffMethod]    = useState<"dropoff" | "pickup">("dropoff");
  const [pickupAddress,    setPickupAddress]    = useState("");
  const [pickupTime,       setPickupTime]       = useState(PICKUP_TIMES[0]);
  const [additionalItems,  setAdditionalItems]  = useState("");
  const [submitting,       setSubmitting]       = useState(false);
  const [submitted,        setSubmitted]        = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  // ── Firestore load ──────────────────────────────────────────────────────────

  useEffect(() => {
    const unsubActive = onSnapshot(
      query(collection(db, "groceryDrives"), where("status", "==", "active"), orderBy("date", "desc"), limit(1)),
      (snap) => {
        if (!snap.empty) {
          const d = snap.docs[0];
          setActiveDrive({ id: d.id, ...d.data() } as Drive);
        } else {
          setActiveDrive(null);
        }
        setLoadingDrives(false);
      },
      () => setLoadingDrives(false)
    );

    const unsubCompleted = onSnapshot(
      query(collection(db, "groceryDrives"), where("status", "==", "completed"), orderBy("date", "desc")),
      (snap) => {
        setCompletedDrives(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Drive)));
      },
      () => {}
    );

    return () => { unsubActive(); unsubCompleted(); };
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const toggleItem = (key: string) => {
    setSelectedItems((prev) => ({ ...prev, [key]: !prev[key] }));
    if (!itemQtys[key]) setItemQtys((prev) => ({ ...prev, [key]: "1" }));
  };

  const buildWAConfirm = () => {
    const itemsList = GROCERY_ITEMS
      .filter((i) => selectedItems[i.key])
      .map((i) => `${i.emoji} ${i.label}: ${itemQtys[i.key] || 1} ${i.unit}`)
      .join(", ");
    const msg = `Hi Seva Foundation Team! 🙏\n\nI've pledged to donate groceries for ${activeDrive?.name}.\n\n*Items:* ${itemsList}${additionalItems ? `\n*Additional:* ${additionalItems}` : ""}\n*Method:* ${dropoffMethod === "dropoff" ? "Will drop off at the centre" : `Need pickup from: ${pickupAddress} (${pickupTime})`}\n\n*Name:* ${name}\n*Phone:* +91${phone}\n\nThank you! 🙏`;
    return `https://wa.me/918287061147?text=${encodeURIComponent(msg)}`;
  };

  const buildWAShare = () => {
    if (!activeDrive) return "#";
    const msg = `🛒 *${activeDrive.name}*\n📅 ${formatDate(activeDrive.date)}\n⏰ ${activeDrive.time || "10 AM – 4 PM"}\n📍 ${activeDrive.location}\n\nJoin Seva Group Foundation's monthly grocery drive! Bring dry rations or pledge online.\n\nPledge here: https://sevagroupfdn.org/donate-groceries\n\nFor info: +91 82870 61147`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDrive) { toast.error("No active drive found."); return; }
    if (!name.trim())  { toast.error("Please enter your full name."); return; }
    if (!/^\d{10}$/.test(phone)) { toast.error("Enter a valid 10-digit phone number."); return; }
    if (!Object.values(selectedItems).some(Boolean)) { toast.error("Please select at least one grocery item."); return; }
    if (dropoffMethod === "pickup" && !pickupAddress.trim()) { toast.error("Please enter your pickup address."); return; }

    const items: Record<string, number> = {};
    GROCERY_ITEMS.forEach(({ key }) => {
      if (selectedItems[key]) items[key] = Math.max(1, Number(itemQtys[key]) || 1);
    });

    setSubmitting(true);
    try {
      await addDoc(collection(db, "groceryDrives", activeDrive.id, "pledges"), {
        name:           name.trim(),
        phone,
        items,
        dropoffMethod,
        pickupAddress:  dropoffMethod === "pickup" ? pickupAddress.trim() : "",
        pickupTime:     dropoffMethod === "pickup" ? pickupTime : "",
        additionalItems: additionalItems.trim(),
        status:         "pledged",
        createdAt:      serverTimestamp(),
      });
      await updateDoc(doc(db, "groceryDrives", activeDrive.id), {
        pledgeCount: increment(1),
      });
      setSubmitted(true);
      toast.success("Pledge registered! Thank you.");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalReceivedKg = activeDrive?.items
    ? Object.values(activeDrive.items).reduce((s, i) => s + (i.received || 0), 0)
    : 0;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0F3D22] py-24 text-center">
        <div className="absolute inset-0 diagonal-stripes pointer-events-none" />
        <div className="absolute inset-0 dot-pattern pointer-events-none opacity-20" />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto max-w-3xl px-4 sm:px-6"
        >
          {/* Basket icon in gold */}
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#F5A623]/15 border border-[#F5A623]/30">
            <ShoppingBasket size={38} className="text-[#F5A623]" />
          </div>

          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#F5A623]">
            Monthly Grocery Drive
          </p>
          <h1
            className="mb-5 font-heading font-bold text-white"
            style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", lineHeight: 1.1 }}
          >
            Donate Groceries.
            <br />
            <span className="text-[#F5A623]">Feed a Family.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-white/70 leading-relaxed">
            Monthly drives at our centre in Noida Extension. Drop off dry rations and essentials
            — or we can arrange pickup from your doorstep.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="btn-gold min-w-[180px] rounded-full px-8 py-4 font-bold text-[#0F3D22] text-sm"
            >
              Make Your Pledge
            </button>
            <a
              href="#wishlist"
              className="flex items-center justify-center gap-2 min-w-[180px] rounded-full border-2 border-white/25 px-8 py-4 text-white text-sm hover:bg-white/10 transition-all"
            >
              <ChevronDown size={16} />
              See What We Need
            </a>
          </div>
        </motion.div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0]">
          <svg viewBox="0 0 1440 48" fill="none" preserveAspectRatio="none" className="w-full h-12">
            <path d="M0 48L60 40C120 32 240 16 360 10.7C480 5.3 600 10.7 720 16C840 21.3 960 26.7 1080 24C1200 21.3 1320 10.7 1380 5.3L1440 0V0H0Z" fill="#F9FBF9" />
          </svg>
        </div>
      </section>

      {/* ── Active Drive Card ── */}
      <section className="bg-[#F9FBF9] py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {loadingDrives ? (
            <div className="h-48 animate-pulse rounded-2xl bg-[#1B5E37]/10" />
          ) : activeDrive ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, #0a1e10 0%, #0F3D22 50%, #1B5E37 100%)" }}
            >
              <div className="p-7 sm:p-9">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="inline-block mb-3 rounded-full bg-[#F5A623] px-4 py-1 text-xs font-bold uppercase tracking-widest text-[#0F3D22]">
                      Active Drive
                    </span>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-4">
                      {activeDrive.name}
                    </h2>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3 text-white/80 text-sm">
                        <Calendar size={16} className="text-[#F5A623] shrink-0" />
                        <span>{formatDate(activeDrive.date)}</span>
                      </div>
                      {activeDrive.time && (
                        <div className="flex items-center gap-3 text-white/80 text-sm">
                          <Clock size={16} className="text-[#F5A623] shrink-0" />
                          <span>{activeDrive.time}</span>
                        </div>
                      )}
                      <div className="flex items-start gap-3 text-white/80 text-sm">
                        <MapPin size={16} className="text-[#F5A623] shrink-0 mt-0.5" />
                        <span>{activeDrive.location}</span>
                      </div>
                      {activeDrive.mapsLink && (
                        <a
                          href={activeDrive.mapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#F5A623] text-sm underline underline-offset-4 hover:no-underline"
                        >
                          <MapPin size={14} />
                          View on Google Maps →
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Pledge counter */}
                  <div className="glass-dark rounded-2xl p-5 text-center min-w-[140px]">
                    <p className="font-heading text-4xl font-bold text-[#F5A623]">
                      {activeDrive.pledgeCount || 0}
                    </p>
                    <p className="text-white/60 text-xs mt-1">Pledges so far</p>
                    {totalReceivedKg > 0 && (
                      <>
                        <div className="my-3 h-px bg-white/10" />
                        <p className="font-heading text-2xl font-bold text-white">{totalReceivedKg}</p>
                        <p className="text-white/60 text-xs">Units received</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="btn-gold rounded-full px-7 py-3 text-sm font-bold text-[#0F3D22]"
                  >
                    I Will Contribute
                  </button>
                  <a
                    href={buildWAShare()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full border-2 border-white/25 px-7 py-3 text-white text-sm hover:bg-white/10 transition-all"
                  >
                    <Share2 size={15} />
                    Share on WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-[#1B5E37]/20 bg-white p-12 text-center">
              <ShoppingBasket size={40} className="mx-auto mb-4 text-[#1B5E37]/30" />
              <p className="text-[#1A1A1A]/50">No active drive at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Grocery Wishlist Grid ── */}
      <section id="wishlist" className="bg-[#F9FBF9] py-16 pt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#1B5E37]">
              Grocery Wishlist
            </p>
            <h2 className="font-heading text-3xl font-bold text-[#0F3D22]">
              What We Need This Month
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-[#1A1A1A]/60">
              Each item below is tracked in real-time. Progress bars update as our team receives contributions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {GROCERY_ITEMS.map((item) => {
              const driveItem = activeDrive?.items?.[item.key];
              return (
                <WishlistItem
                  key={item.key}
                  item={item}
                  received={driveItem?.received ?? 0}
                  target={driveItem?.target ?? item.defaultTarget}
                />
              );
            })}
          </div>
        </div>
      </section>

      <WaveDividerLightToDark />

      {/* ── Pledge / Registration Form ── */}
      <section className="bg-[#0F3D22] py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#F5A623]">
              Register Your Pledge
            </p>
            <h2 className="font-heading text-3xl font-bold text-white">
              Make Your Pledge
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/60">
              Tell us what you&apos;ll bring. Our team will confirm via WhatsApp within 24 hours.
            </p>
          </div>

          <div ref={formRef} id="pledge-form" className="scroll-mt-20">
            {!activeDrive && !loadingDrives ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                <Package size={36} className="mx-auto mb-3 text-[#F5A623]/50" />
                <p className="text-white/50">No active drive. Please check back when the next drive is announced.</p>
              </div>
            ) : submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-[#F5A623]/30 bg-[#F5A623]/10 p-10 text-center"
              >
                <CheckCircle size={52} className="mx-auto mb-4 text-[#F5A623]" />
                <h3 className="font-heading text-2xl font-bold text-white mb-2">
                  Thank You, {name}! 🙏
                </h3>
                <p className="text-white/70 mb-6">
                  We&apos;ve recorded your pledge for{" "}
                  <strong className="text-white">{activeDrive?.name}</strong>.
                  {activeDrive?.date && (
                    <> See you on <strong className="text-[#F5A623]">{formatDate(activeDrive.date)}</strong>!</>
                  )}
                </p>
                <a
                  href={buildWAConfirm()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 btn-gold rounded-full px-7 py-3 text-sm font-bold text-[#0F3D22]"
                >
                  <Heart size={15} />
                  Send WhatsApp Confirmation
                </a>
                <p className="mt-4 text-xs text-white/40">
                  A message will open in WhatsApp for you to send to our team.
                </p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="glass-dark rounded-2xl p-7 sm:p-9 space-y-6"
              >
                {/* Name + Phone */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wide text-white/60">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-white text-sm placeholder:text-white/35 outline-none focus:border-[#F5A623] transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wide text-white/60">
                      Phone (10 digits) *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-xl bg-white/10 border border-r-0 border-white/15 px-3 text-white/60 text-sm">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="9876543210"
                        className="flex-1 rounded-r-xl bg-white/10 border border-white/15 px-4 py-3 text-white text-sm placeholder:text-white/35 outline-none focus:border-[#F5A623] transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Item checkboxes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-white/60 mb-3">
                    I Will Bring *
                  </label>
                  <div className="space-y-2">
                    {GROCERY_ITEMS.map((item) => (
                      <div
                        key={item.key}
                        className={`flex items-center gap-3 rounded-xl p-3 border transition-all cursor-pointer ${
                          selectedItems[item.key]
                            ? "bg-[#F5A623]/10 border-[#F5A623]/40"
                            : "bg-white/5 border-white/10 hover:bg-white/8"
                        }`}
                        onClick={() => toggleItem(item.key)}
                      >
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                            selectedItems[item.key]
                              ? "bg-[#F5A623] border-[#F5A623]"
                              : "border-white/30"
                          }`}
                        >
                          {selectedItems[item.key] && (
                            <CheckCircle size={12} className="text-[#0F3D22]" fill="currentColor" />
                          )}
                        </div>
                        <span className="text-lg" aria-hidden="true">{item.emoji}</span>
                        <span className="flex-1 text-sm text-white/85">{item.label}</span>

                        {selectedItems[item.key] && (
                          <div
                            className="flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="number"
                              min="1"
                              value={itemQtys[item.key] || "1"}
                              onChange={(e) =>
                                setItemQtys((prev) => ({ ...prev, [item.key]: e.target.value }))
                              }
                              className="w-16 rounded-lg bg-white/15 border border-white/25 px-2 py-1.5 text-white text-sm text-center outline-none focus:border-[#F5A623]"
                            />
                            <span className="text-white/50 text-xs">{item.unit}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Drop-off / Pickup */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-white/60 mb-3">
                    Delivery Method *
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {(["dropoff", "pickup"] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setDropoffMethod(method)}
                        className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                          dropoffMethod === method
                            ? "bg-[#F5A623]/10 border-[#F5A623]/50 text-white"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/8"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                            dropoffMethod === method ? "border-[#F5A623]" : "border-white/30"
                          }`}
                        >
                          {dropoffMethod === method && (
                            <div className="h-2 w-2 rounded-full bg-[#F5A623]" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {method === "dropoff" ? "Drop off at centre" : "Pickup from my location"}
                          </p>
                          <p className="text-xs mt-0.5 opacity-60">
                            {method === "dropoff"
                              ? "Bring items on the drive date"
                              : "We arrange pickup at a time you choose"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {dropoffMethod === "pickup" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 space-y-3"
                    >
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wide text-white/60">
                          Pickup Address *
                        </label>
                        <textarea
                          rows={2}
                          value={pickupAddress}
                          onChange={(e) => setPickupAddress(e.target.value)}
                          placeholder="Enter your full address for pickup"
                          className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-white text-sm placeholder:text-white/35 outline-none focus:border-[#F5A623] transition-colors resize-none"
                          required={dropoffMethod === "pickup"}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wide text-white/60">
                          Preferred Time
                        </label>
                        <select
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-white text-sm outline-none focus:border-[#F5A623] transition-colors"
                        >
                          {PICKUP_TIMES.map((t) => (
                            <option key={t} value={t} className="bg-[#0F3D22]">{t}</option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Additional items */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wide text-white/60">
                    Additional Items (optional)
                  </label>
                  <input
                    type="text"
                    value={additionalItems}
                    onChange={(e) => setAdditionalItems(e.target.value)}
                    placeholder="e.g. Maggi noodles, Tea powder, etc."
                    className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-white text-sm placeholder:text-white/35 outline-none focus:border-[#F5A623] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold w-full rounded-full py-4 text-sm font-bold text-[#0F3D22] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 border-2 border-[#0F3D22] border-t-transparent rounded-full animate-spin" />
                      Registering…
                    </>
                  ) : (
                    "Register My Pledge"
                  )}
                </button>

                <p className="text-center text-xs text-white/35">
                  Our team will confirm via WhatsApp within 24 hours.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <WaveDividerDarkToLight />

      {/* ── Past Drives Timeline ── */}
      {completedDrives.length > 0 && (
        <section className="bg-[#F9FBF9] py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#1B5E37]">
                Our Track Record
              </p>
              <h2 className="font-heading text-3xl font-bold text-[#0F3D22]">
                Past Drives
              </h2>
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#1B5E37]/15" />

              <div className="space-y-6">
                {completedDrives.map((drive, i) => (
                  <motion.div
                    key={drive.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex gap-5"
                  >
                    {/* Timeline dot */}
                    <div className="flex shrink-0 flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B5E37] text-white z-10">
                        <CheckCircle size={18} />
                      </div>
                    </div>

                    <div className="flex-1 rounded-2xl bg-white border border-[#1B5E37]/10 p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-heading font-bold text-[#0F3D22]">{drive.name}</p>
                          <p className="text-sm text-[#1A1A1A]/50 mt-0.5">
                            {formatDate(drive.date)}
                          </p>
                        </div>
                        <div className="flex gap-4 text-right shrink-0">
                          {drive.totalKg != null && (
                            <div>
                              <p className="font-heading text-xl font-bold text-[#1B5E37]">
                                {drive.totalKg}<span className="text-sm font-normal"> kg</span>
                              </p>
                              <p className="text-[10px] text-[#1A1A1A]/40">collected</p>
                            </div>
                          )}
                          {drive.familiesServed != null && (
                            <div>
                              <p className="font-heading text-xl font-bold text-[#F5A623]">
                                {drive.familiesServed}
                              </p>
                              <p className="text-[10px] text-[#1A1A1A]/40">families</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Cannot Come In Person ── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[#1B5E37]/15 bg-[#F9FBF9] p-8 text-center"
          >
            <span className="text-4xl mb-4 block" aria-hidden="true">🏠</span>
            <h3 className="font-heading text-xl font-bold text-[#0F3D22] mb-2">
              Can&apos;t Come In Person?
            </h3>
            <p className="text-[#1A1A1A]/60 text-sm leading-relaxed mb-6">
              Donate money instead — we buy groceries in bulk at wholesale prices.
            </p>

            <div className="inline-flex items-center gap-3 rounded-2xl bg-[#1B5E37]/8 border border-[#1B5E37]/15 px-6 py-4 mb-6">
              <span className="font-heading text-2xl font-bold text-[#F5A623]">Rs.200</span>
              <span className="text-sm text-[#1A1A1A]/70">
                = 1 family grocery bag for a week
              </span>
            </div>

            <Link
              href="/donations"
              className="btn-gold inline-block rounded-full px-8 py-3.5 text-sm font-bold text-[#0F3D22]"
            >
              Donate Rs.200 for Groceries
            </Link>

            <p className="mt-4 text-xs text-[#1A1A1A]/40">
              Select &ldquo;Grocery Fund&rdquo; on the donation page &bull; 80G tax benefit applicable
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
