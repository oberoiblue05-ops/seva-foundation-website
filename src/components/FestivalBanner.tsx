"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";

interface Festival {
  name:    string;
  month:   number; // 1-based
  day:     number;
  message: string;
}

const FESTIVALS: Festival[] = [
  { name: "Republic Day",          month: 1,  day: 26, message: "Celebrate the spirit of India — donate and transform a life today." },
  { name: "Holi",                  month: 3,  day: 25, message: "Spread colours of joy — sponsor a child's meal this Holi." },
  { name: "Eid ul-Fitr",           month: 3,  day: 30, message: "Eid Mubarak! Share your blessings with orphans and the elderly." },
  { name: "Baisakhi",              month: 4,  day: 13, message: "New beginnings — help a child start fresh with education support." },
  { name: "Independence Day",      month: 8,  day: 15, message: "True freedom means no child goes hungry. Donate this Independence Day." },
  { name: "Navratri",              month: 10, day: 2,  message: "Honour the Devi by feeding her children — donate to our food drive." },
  { name: "Durga Puja",            month: 10, day: 10, message: "Celebrate strength — empower a widow or orphan child with your donation." },
  { name: "Diwali",                month: 10, day: 20, message: "Light a diya in someone's life this Diwali — every rupee makes a difference." },
  { name: "Guru Nanak Jayanti",    month: 11, day: 15, message: "Seva is the highest worship — join our community food drive today." },
  { name: "Christmas",             month: 12, day: 25, message: "Gift the joy of education to a child in need this Christmas." },
];

const DAYS_BEFORE = 7;

function getActiveFestival(): Festival | null {
  const now   = new Date();
  const month = now.getMonth() + 1;
  const day   = now.getDate();

  for (const festival of FESTIVALS) {
    const festDate = new Date(now.getFullYear(), festival.month - 1, festival.day);
    const diffMs   = festDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= DAYS_BEFORE) {
      return festival;
    }
  }
  return null;
}

export default function FestivalBanner() {
  const [festival,    setFestival]    = useState<Festival | null>(null);
  const [dismissed,   setDismissed]   = useState(true);
  const [mounted,     setMounted]     = useState(false);

  useEffect(() => {
    setMounted(true);
    const active = getActiveFestival();
    if (!active) return;

    const key = `festival-dismissed-${active.name}-${new Date().getFullYear()}`;
    if (localStorage.getItem(key) !== "true") {
      setFestival(active);
      setDismissed(false);
    }
  }, []);

  const dismiss = () => {
    if (!festival) return;
    const key = `festival-dismissed-${festival.name}-${new Date().getFullYear()}`;
    localStorage.setItem(key, "true");
    setDismissed(true);
  };

  if (!mounted || dismissed || !festival) return null;

  return (
    <div
      role="alert"
      className="relative z-[60] w-full overflow-hidden"
      style={{ background: "linear-gradient(135deg, #F5A623 0%, #E8930F 60%, #D4770A 100%)" }}
    >
      {/* Shimmer overlay */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Sparkles size={18} className="shrink-0 text-[#0F3D22]" />
          <p className="min-w-0 text-sm font-semibold text-[#0F3D22]">
            <span className="font-bold">{festival.name}:</span>{" "}
            <span className="font-medium opacity-90">{festival.message}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/donations"
            className="rounded-full bg-[#0F3D22] px-4 py-1.5 text-xs font-bold text-[#F5A623] transition-all hover:bg-[#1B5E37] hover:scale-105"
          >
            Donate Now
          </Link>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="rounded-full p-1.5 text-[#0F3D22] transition-colors hover:bg-black/10"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
