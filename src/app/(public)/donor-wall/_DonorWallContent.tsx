"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Heart, ChevronRight } from "lucide-react";
import { db } from "@/lib/firebase";

interface PublicDonation {
  id:        string;
  name:      string;
  amount:    number;
  campaign:  string;
  timestamp: string;
  isPublic:  boolean;
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtRs(n: number) {
  return "Rs. " + n.toLocaleString("en-IN");
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = ["All Years", ...Array.from({ length: 4 }, (_, i) => String(CURRENT_YEAR - i))];

export default function DonorWallContent() {
  const [donations,       setDonations]       = useState<PublicDonation[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [yearFilter,      setYearFilter]      = useState("All Years");
  const [campaignFilter,  setCampaignFilter]  = useState("All Campaigns");

  useEffect(() => {
    const q = query(
      collection(db, "donations"),
      where("isPublic", "==", true),
      where("status",   "==", "success"),
      orderBy("timestamp", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setDonations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PublicDonation)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const campaigns = ["All Campaigns", ...Array.from(new Set(donations.map((d) => d.campaign || "General").filter(Boolean)))];

  const filtered = donations.filter((d) => {
    if (yearFilter !== "All Years") {
      const year = d.timestamp ? new Date(d.timestamp).getFullYear().toString() : "";
      if (year !== yearFilter) return false;
    }
    if (campaignFilter !== "All Campaigns") {
      if ((d.campaign || "General") !== campaignFilter) return false;
    }
    return true;
  });

  const totalAmount = filtered.reduce((s, d) => s + d.amount, 0);

  return (
    <main>
      {/* Hero */}
      <section
        className="relative py-20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #071a0e 0%, #0F3D22 55%, #1B5E37 100%)" }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #F5A623 0%, transparent 50%), radial-gradient(circle at 70% 20%, #fff 0%, transparent 40%)" }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F5A623]/20 border border-[#F5A623]/30 mb-6">
            <Heart size={28} className="text-[#F5A623]" fill="currentColor" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading leading-tight mb-4">
            Our Generous Supporters
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            These amazing people chose to make their contributions public. Every donation, big or small, transforms lives.
          </p>
          {!loading && donations.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-8 text-white">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#F5A623]">{donations.length}</p>
                <p className="text-white/60 text-sm mt-0.5">Public Donors</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-3xl font-bold text-[#F5A623]">{fmtRs(donations.reduce((s, d) => s + d.amount, 0))}</p>
                <p className="text-white/60 text-sm mt-0.5">Total Donated</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#1B5E37]">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium">Donor Wall</span>
        </div>
      </div>

      {/* Filters */}
      <section className="bg-[#F9FBF9] border-b border-gray-100 py-4">
        <div className="mx-auto max-w-5xl px-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white outline-none focus:border-[#1B5E37] text-gray-700"
            >
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white outline-none focus:border-[#1B5E37] text-gray-700"
            >
              {campaigns.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          {filtered.length > 0 && (
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-[#1B5E37]">{filtered.length} donors</span>
              {" · "}
              <span className="font-semibold text-[#1B5E37]">{fmtRs(totalAmount)}</span> raised
            </p>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 bg-[#F9FBF9]">
        <div className="mx-auto max-w-5xl px-4">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
                  <div className="h-6 bg-gray-100 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#1B5E37]/8 mb-6">
                <Heart size={32} className="text-[#1B5E37]/40" />
              </div>
              <h2 className="text-xl font-bold text-gray-700 mb-2">
                {donations.length === 0
                  ? "Be the first on our donor wall"
                  : "No donors match your filters"}
              </h2>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {donations.length === 0
                  ? "Make a donation and choose to make it public — your name will appear here and inspire others."
                  : "Try adjusting the year or campaign filters."}
              </p>
              {donations.length === 0 && (
                <Link
                  href="/donations"
                  className="inline-flex items-center gap-2 bg-[#1B5E37] text-white font-bold rounded-full px-8 py-3 hover:bg-[#0d3320] transition-all"
                >
                  <Heart size={16} fill="currentColor" />
                  Donate Now
                </Link>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((d) => (
                <div
                  key={d.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 border-l-4 border-l-[#1B5E37] hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1B5E37]/8 flex items-center justify-center shrink-0">
                        <span className="text-[#1B5E37] font-bold text-base">
                          {(d.name || "A")?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm leading-tight">
                          {d.name?.trim() || "A Generous Soul"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {d.campaign || "General Fund"}
                        </p>
                      </div>
                    </div>
                    <Heart size={14} className="text-[#F5A623] shrink-0 mt-0.5" fill="currentColor" />
                  </div>
                  <p className="text-xl font-bold text-[#1B5E37]">{fmtRs(d.amount)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {d.timestamp ? fmtDate(d.timestamp) : "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#1B5E37]">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <Heart size={36} className="text-[#F5A623] mx-auto mb-4" fill="currentColor" />
          <h2 className="text-2xl font-bold text-white mb-3">Join Our Wall of Supporters</h2>
          <p className="text-white/70 mb-6">
            Make a donation and opt to go public. Your generosity will inspire countless others.
          </p>
          <Link
            href="/donations"
            className="inline-flex items-center gap-2 bg-[#F5A623] text-[#1B5E37] font-bold rounded-full px-8 py-3 hover:bg-[#F7BA57] transition-all hover:scale-105 shadow-lg"
          >
            Donate & Get Featured
          </Link>
        </div>
      </section>
    </main>
  );
}
