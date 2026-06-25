"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  collection, query, where, getDocs, doc, getDoc, setDoc, orderBy,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/ProtectedRoute";
import { generateReceipt, generateSponsorCert, type DonationForReceipt } from "@/lib/generate-receipt";
import { WhatsApp } from "@/lib/whatsapp-templates";
import { CHILDREN } from "@/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FirestoreDonation {
  id:                 string;
  name:               string;
  email:              string;
  phone:              string;
  pan?:               string;
  amount:             number;
  campaign:           string;
  razorpayOrderId:    string;
  razorpayPaymentId?: string;
  status:             "pending" | "success" | "failed";
  timestamp:          string;
  isPublic?:          boolean;
}

interface FirestoreSponsorship {
  id:           string;
  sponsorName:  string;
  childId:      string;
  amount:       number;
  startDate:    string;
  isActive:     boolean;
  razorpaySubscriptionId?: string;
}

interface UserProfile {
  displayName?: string;
  address?:     string;
  pan?:         string;
  city?:        string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type TabId = "overview" | "donations" | "receipts" | "impact" | "sponsorships" | "profile";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview",      label: "Overview",          icon: "🏠" },
  { id: "donations",     label: "My Donations",      icon: "💰" },
  { id: "receipts",      label: "Tax Receipts",      icon: "📄" },
  { id: "impact",        label: "My Impact",         icon: "🌱" },
  { id: "sponsorships",  label: "My Sponsorships",   icon: "❤️" },
  { id: "profile",       label: "Profile",           icon: "👤" },
];

function monthsDiff(from: Date, to: Date): number {
  return Math.max(0, (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()));
}

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtRs(n: number): string {
  return "Rs. " + n.toLocaleString("en-IN");
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    success: "bg-green-100 text-green-700",
    failed:  "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({
  user, donations, sponsorships, onTabChange,
}: {
  user: { displayName?: string | null; phoneNumber?: string | null };
  donations: FirestoreDonation[];
  sponsorships: FirestoreSponsorship[];
  onTabChange: (t: TabId) => void;
}) {
  const success   = donations.filter((d) => d.status === "success");
  const total     = success.reduce((s, d) => s + d.amount, 0);
  const campaigns = new Set(success.map((d) => d.campaign)).size;
  const firstDate = success.length
    ? new Date(success[success.length - 1].timestamp)
    : null;
  const months = firstDate ? monthsDiff(firstDate, new Date()) : 0;

  const stats = [
    { label: "Total Donated",    value: fmtRs(total),   icon: "💚" },
    { label: "Campaigns Backed", value: String(campaigns), icon: "🎯" },
    { label: "Months as Donor",  value: months > 0 ? `${months}m` : "New", icon: "📅" },
  ];

  const name = user.displayName ?? user.phoneNumber ?? "Donor";

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-[#1B5E37] to-[#2d7a4f] rounded-2xl p-6 text-white">
        <p className="text-white/70 text-sm mb-1">Welcome back</p>
        <h2 className="text-2xl font-bold">{name} 👋</h2>
        <p className="text-white/80 text-sm mt-2">
          Thank you for being a changemaker. Every rupee you give changes lives.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <span className="text-2xl">{s.icon}</span>
            <p className="font-bold text-[#1B5E37] text-lg mt-1">{s.value}</p>
            <p className="text-[#1A1A1A]/50 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {(["donations", "receipts", "impact", "sponsorships"] as TabId[]).map((id) => {
          const t = TABS.find((x) => x.id === id)!;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 text-left hover:border-[#1B5E37] hover:shadow-md transition-all"
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="text-sm font-medium text-[#1A1A1A]">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Recent donation */}
      {donations[0] && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-[#1A1A1A]/50 font-medium mb-3 uppercase tracking-wide">Latest Donation</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#1A1A1A]">{donations[0].campaign || "General Donation"}</p>
              <p className="text-xs text-[#1A1A1A]/50 mt-0.5">{fmtDate(donations[0].timestamp)}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#1B5E37]">{fmtRs(donations[0].amount)}</p>
              <StatusBadge status={donations[0].status} />
            </div>
          </div>
        </div>
      )}

      {/* Active sponsorships */}
      {sponsorships.filter((s) => s.isActive).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-[#1A1A1A]/50 font-medium mb-3 uppercase tracking-wide">Active Sponsorships</p>
          {sponsorships
            .filter((s) => s.isActive)
            .slice(0, 2)
            .map((s) => {
              const child = CHILDREN.find((c) => c.id === s.childId);
              return (
                <div key={s.id} className="flex items-center gap-3 py-2">
                  <Image
                    src={`https://picsum.photos/seed/${child?.imageSeed ?? 100}/40/40`}
                    alt={child?.name ?? "Child"}
                    width={40} height={40}
                    className="rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{child?.name ?? "Sponsored Child"}</p>
                    <p className="text-xs text-[#1A1A1A]/50">{fmtRs(s.amount)}/month</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

// ─── Tab: My Donations ────────────────────────────────────────────────────────

function DonationsTab({ donations }: { donations: FirestoreDonation[] }) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (d: FirestoreDonation) => {
    if (d.status !== "success") {
      toast.error("Receipt is only available for successful donations.");
      return;
    }
    setDownloading(d.id);
    try {
      await generateReceipt(d as DonationForReceipt);
      toast.success("Receipt downloaded!");
    } catch {
      toast.error("Could not generate receipt. Try again.");
    } finally {
      setDownloading(null);
    }
  };

  if (donations.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl">💰</span>
        <p className="mt-4 text-[#1A1A1A]/50">No donations yet. Make your first donation!</p>
        <a
          href="/donations"
          className="mt-4 inline-block bg-[#1B5E37] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#0d3320] transition-colors"
        >
          Donate Now
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#1A1A1A]/50 font-medium">{donations.length} donation{donations.length !== 1 ? "s" : ""} found</p>
      {donations.map((d) => (
        <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#1A1A1A] truncate">{d.campaign || "General Donation"}</p>
              <p className="text-xs text-[#1A1A1A]/50 mt-0.5">{fmtDate(d.timestamp)}</p>
              {d.razorpayPaymentId && (
                <p className="text-xs text-[#1A1A1A]/40 mt-0.5 truncate">ID: {d.razorpayPaymentId}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-[#1B5E37] text-lg">{fmtRs(d.amount)}</p>
              <StatusBadge status={d.status} />
            </div>
          </div>
          {d.status === "success" && (
            <button
              onClick={() => handleDownload(d)}
              disabled={downloading === d.id}
              className="mt-3 w-full border border-[#1B5E37] text-[#1B5E37] text-sm font-medium rounded-xl py-2
                hover:bg-[#1B5E37] hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {downloading === d.id ? (
                <span className="h-4 w-4 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
              ) : (
                "📄 Download Receipt"
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Tax Receipts ────────────────────────────────────────────────────────

function ReceiptsTab({ donations }: { donations: FirestoreDonation[] }) {
  const [bulkBusy, setBulkBusy] = useState(false);
  const success = donations.filter((d) => d.status === "success");

  const handleBulkDownload = async () => {
    if (success.length === 0) return;
    setBulkBusy(true);
    try {
      for (const d of success) {
        await generateReceipt(d as DonationForReceipt);
        await new Promise((r) => setTimeout(r, 400));
      }
      toast.success(`${success.length} receipt(s) downloaded!`);
    } catch {
      toast.error("Some receipts could not be generated.");
    } finally {
      setBulkBusy(false);
    }
  };

  if (success.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl">📄</span>
        <p className="mt-4 text-[#1A1A1A]/50">No 80G receipts available yet.</p>
        <p className="text-sm text-[#1A1A1A]/40 mt-2">Receipts are generated for successful donations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#1A1A1A]/50">{success.length} receipt(s) available</p>
        <button
          onClick={handleBulkDownload}
          disabled={bulkBusy}
          className="bg-[#1B5E37] text-white text-sm px-4 py-2 rounded-xl hover:bg-[#0d3320] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {bulkBusy ? (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "⬇ Download All"
          )}
        </button>
      </div>

      {/* 80G info card */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-xs font-medium text-amber-800 mb-1">80G Tax Benefit</p>
        <p className="text-xs text-amber-700">
          Your donations are eligible for 50% tax deduction under Section 80G of Income Tax Act, 1961.
          Download receipts below and attach them to your ITR filing.
        </p>
      </div>

      {success.map((d) => (
        <ReceiptCard key={d.id} donation={d} />
      ))}
    </div>
  );
}

function ReceiptCard({ donation: d }: { donation: FirestoreDonation }) {
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    setBusy(true);
    try {
      await generateReceipt(d as DonationForReceipt);
    } catch {
      toast.error("Could not generate receipt.");
    } finally {
      setBusy(false);
    }
  };

  const fy = (() => {
    const dt = new Date(d.timestamp);
    const yr = dt.getFullYear();
    const mo = dt.getMonth(); // 0-indexed, Apr = 3
    return mo >= 3 ? `${yr}-${yr + 1}` : `${yr - 1}-${yr}`;
  })();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="w-10 h-10 bg-[#1B5E37]/10 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-xl">📄</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1A1A1A] truncate">{d.campaign || "General"}</p>
          <p className="text-xs text-[#1A1A1A]/50">FY {fy}  ·  {fmtDate(d.timestamp)}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-[#1B5E37]">{fmtRs(d.amount)}</p>
        </div>
      </div>
      <div className="px-4 pb-4">
        <button
          onClick={handleDownload}
          disabled={busy}
          className="w-full border border-[#1B5E37] text-[#1B5E37] text-sm font-medium rounded-xl py-2.5
            hover:bg-[#1B5E37] hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {busy ? (
            <span className="h-4 w-4 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
          ) : (
            "📥 Download 80G Receipt"
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Tab: My Impact ───────────────────────────────────────────────────────────

function ImpactTab({
  user, donations,
}: {
  user: { displayName?: string | null; phoneNumber?: string | null };
  donations: FirestoreDonation[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const success   = donations.filter((d) => d.status === "success");
  const total     = success.reduce((s, d) => s + d.amount, 0);
  const meals     = Math.floor(total / 50);
  const children  = Math.floor(total / 500);
  const name      = user.displayName ?? user.phoneNumber ?? "Our Valued Donor";

  const drawCertificate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 800, H = 560;

    // Green background
    ctx.fillStyle = "#1B5E37";
    ctx.fillRect(0, 0, W, H);

    // Gold outer border
    ctx.strokeStyle = "#F5A623";
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, W - 20, H - 20);

    // Gold inner border
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);

    // Header text
    ctx.fillStyle = "#F5A623";
    ctx.font = "bold 14px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SEVA GROUP FOUNDATION", W / 2, 60);

    // Gold divider
    ctx.strokeStyle = "#F5A623";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 75);
    ctx.lineTo(700, 75);
    ctx.stroke();

    // Title
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 38px Georgia, serif";
    ctx.fillText("IMPACT CERTIFICATE", W / 2, 120);

    // Subtitle
    ctx.font = "16px Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("This certifies that", W / 2, 165);

    // Name
    ctx.fillStyle = "#F5A623";
    ctx.font = "bold 30px Georgia, serif";
    ctx.fillText(name, W / 2, 205);

    // Name underline
    ctx.strokeStyle = "#F5A623";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(200, 215);
    ctx.lineTo(600, 215);
    ctx.stroke();

    // Contribution text
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "16px Arial, sans-serif";
    ctx.fillText("has generously donated", W / 2, 252);

    // Amount
    ctx.fillStyle = "#F5A623";
    ctx.font = "bold 36px Georgia, serif";
    ctx.fillText(fmtRs(total), W / 2, 298);

    // Impact
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "15px Arial, sans-serif";
    ctx.fillText(
      `contributing ${meals.toLocaleString("en-IN")} meals and supporting ${children} ${children === 1 ? "child" : "children"}`,
      W / 2, 338
    );

    // Date
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "13px Arial, sans-serif";
    ctx.fillText(
      `Issued: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
      W / 2, 378
    );

    // Quote
    ctx.fillStyle = "#F5A623";
    ctx.font = "italic bold 14px Georgia, serif";
    ctx.fillText('"Serving humanity, one life at a time."', W / 2, 422);

    // Signature line
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 120, 475);
    ctx.lineTo(W / 2 + 120, 475);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "12px Arial, sans-serif";
    ctx.fillText("Authorized Signatory", W / 2, 493);
    ctx.fillText("Seva Group Foundation", W / 2, 510);
  }, [name, total, meals, children]);

  useEffect(() => {
    drawCertificate();
  }, [drawCertificate]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "seva-impact-certificate.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleShare = () => {
    const url = WhatsApp.shareDonationSuccess(name, total, meals, children);
    window.open(url, "_blank");
  };

  const impactItems = [
    { icon: "🍚", label: "Meals Provided",     value: meals.toLocaleString("en-IN") },
    { icon: "👧", label: "Children Supported",  value: String(children) },
    { icon: "🌱", label: "Trees Equivalent",    value: String(Math.floor(total / 250)) },
    { icon: "💊", label: "Health Kits Funded",  value: String(Math.floor(total / 200)) },
  ];

  return (
    <div className="space-y-6">
      {total === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl">🌱</span>
          <p className="mt-4 text-[#1A1A1A]/50">Make your first donation to see your impact!</p>
          <a
            href="/donations"
            className="mt-4 inline-block bg-[#1B5E37] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#0d3320] transition-colors"
          >
            Donate Now
          </a>
        </div>
      ) : (
        <>
          {/* Impact stats */}
          <div className="grid grid-cols-2 gap-3">
            {impactItems.map((item) => (
              <div key={item.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
                <span className="text-2xl">{item.icon}</span>
                <p className="font-bold text-[#1B5E37] text-xl mt-1">{item.value}</p>
                <p className="text-[#1A1A1A]/50 text-xs">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Certificate */}
          <div>
            <p className="text-sm font-medium text-[#1A1A1A]/50 mb-3">Your Impact Certificate</p>
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <canvas
                ref={canvasRef}
                width={800}
                height={560}
                className="w-full"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 bg-[#1B5E37] text-white rounded-2xl py-3 text-sm font-medium hover:bg-[#0d3320] transition-colors"
            >
              📥 Download
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-2xl py-3 text-sm font-medium hover:bg-[#1ebe5a] transition-colors"
            >
              📲 Share on WhatsApp
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Tab: My Sponsorships ─────────────────────────────────────────────────────

function SponsorshipsTab({ sponsorships }: { sponsorships: FirestoreSponsorship[] }) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadCert = async (s: FirestoreSponsorship) => {
    const child = CHILDREN.find((c) => c.id === s.childId);
    setDownloading(s.id);
    try {
      await generateSponsorCert({
        id:          s.id,
        sponsorName: s.sponsorName,
        childName:   child?.name,
        amount:      s.amount,
        startDate:   s.startDate,
      });
      toast.success("Certificate downloaded!");
    } catch {
      toast.error("Could not generate certificate.");
    } finally {
      setDownloading(null);
    }
  };

  if (sponsorships.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl">❤️</span>
        <p className="mt-4 text-[#1A1A1A]/50">You haven&apos;t sponsored a child yet.</p>
        <a
          href="/sponsor"
          className="mt-4 inline-block bg-[#1B5E37] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#0d3320] transition-colors"
        >
          Sponsor a Child
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#1A1A1A]/50">{sponsorships.length} sponsorship(s)</p>
      {sponsorships.map((s) => {
        const child   = CHILDREN.find((c) => c.id === s.childId);
        const months  = monthsDiff(new Date(s.startDate), new Date());
        const total   = months * s.amount;
        return (
          <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              <Image
                src={`https://picsum.photos/seed/${child?.imageSeed ?? 200}/64/64`}
                alt={child?.name ?? "Child"}
                width={64} height={64}
                className="rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-[#1A1A1A]">{child?.name ?? "Sponsored Child"}</p>
                  {s.isActive ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                  )}
                </div>
                <p className="text-sm text-[#1A1A1A]/50 mt-0.5">
                  {fmtRs(s.amount)}/month · Since {fmtDate(s.startDate)}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs bg-[#1B5E37]/10 text-[#1B5E37] px-2 py-0.5 rounded-full font-medium">
                    {months} month{months !== 1 ? "s" : ""} active
                  </span>
                  <span className="text-xs text-[#1A1A1A]/40">
                    {fmtRs(total)} contributed
                  </span>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={() => handleDownloadCert(s)}
                disabled={downloading === s.id}
                className="w-full border border-[#1B5E37] text-[#1B5E37] text-sm font-medium rounded-xl py-2.5
                  hover:bg-[#1B5E37] hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {downloading === s.id ? (
                  <span className="h-4 w-4 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
                ) : (
                  "📜 Download Certificate"
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab: Profile ─────────────────────────────────────────────────────────────

function ProfileTab({
  userId, userPhone, userEmail,
}: {
  userId:    string;
  userPhone: string | null;
  userEmail: string | null;
}) {
  const [profile,  setProfile]  = useState<UserProfile>({});
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", userId));
        if (snap.exists()) setProfile(snap.data() as UserProfile);
      } catch { /* no profile yet */ }
      finally { setLoading(false); }
    })();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "users", userId), profile, { merge: true });
      toast.success("Profile saved!");
    } catch {
      toast.error("Could not save profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <span className="h-8 w-8 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const fields: { label: string; key: keyof UserProfile; placeholder: string }[] = [
    { label: "Full Name",    key: "displayName", placeholder: "e.g. Ramesh Kumar" },
    { label: "City",         key: "city",        placeholder: "e.g. Noida" },
    { label: "Address",      key: "address",     placeholder: "Full mailing address" },
    { label: "PAN Number",   key: "pan",         placeholder: "e.g. ABCDE1234F" },
  ];

  return (
    <div className="space-y-4">
      {/* Non-editable info */}
      <div className="bg-[#F9FBF9] rounded-2xl p-4 space-y-3">
        {userPhone && (
          <div>
            <p className="text-xs text-[#1A1A1A]/40 uppercase tracking-wide mb-0.5">Phone (verified)</p>
            <p className="font-medium text-[#1A1A1A]">{userPhone}</p>
          </div>
        )}
        {userEmail && (
          <div>
            <p className="text-xs text-[#1A1A1A]/40 uppercase tracking-wide mb-0.5">Email</p>
            <p className="font-medium text-[#1A1A1A]">{userEmail}</p>
          </div>
        )}
      </div>

      {/* Editable fields */}
      {fields.map(({ label, key, placeholder }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{label}</label>
          <input
            type="text"
            value={profile[key] ?? ""}
            onChange={(e) => setProfile((prev) => ({ ...prev, [key]: e.target.value }))}
            placeholder={placeholder}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1B5E37] transition-colors"
          />
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-[#1B5E37] text-white rounded-2xl py-4 text-sm font-bold hover:bg-[#0d3320] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? (
          <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          "Save Profile"
        )}
      </button>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function DashboardContent() {
  const { user, signOut } = useAuth();

  const [activeTab,     setActiveTab]     = useState<TabId>("overview");
  const [donations,     setDonations]     = useState<FirestoreDonation[]>([]);
  const [sponsorships,  setSponsorships]  = useState<FirestoreSponsorship[]>([]);
  const [dataLoading,   setDataLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;

    const phone = user.phoneNumber?.replace("+91", "") ?? "";

    async function loadAll() {
      try {
        // Donations — query by phone number
        if (phone) {
          const dq = query(
            collection(db, "donations"),
            where("phone", "==", phone),
            orderBy("timestamp", "desc")
          );
          const dsnap = await getDocs(dq);
          setDonations(dsnap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreDonation)));
        }

        // Sponsorships — by phone number (matches what SponsorModal saves)
        if (phone) {
          const sq = query(
            collection(db, "sponsorships"),
            where("phone", "==", phone),
          );
          const ssnap = await getDocs(sq);
          setSponsorships(ssnap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreSponsorship)));
        }
      } catch (err) {
        // Silently degrade (missing index, no permissions, etc.)
        console.warn("[dashboard]", err);
      } finally {
        setDataLoading(false);
      }
    }

    loadAll();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  const displayName = user?.displayName ?? user?.phoneNumber ?? "Account";

  return (
    <div className="min-h-screen bg-[#F9FBF9] flex flex-col lg:flex-row">
      {/* ── Desktop Sidebar ───────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white border-r border-gray-100 sticky top-0 h-screen">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1B5E37] rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white text-sm">🙏</span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#1B5E37] text-xs leading-tight truncate">Seva Group</p>
              <p className="text-[10px] text-[#1A1A1A]/40 truncate">Foundation</p>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-b border-gray-50">
          <p className="text-xs text-[#1A1A1A]/40 truncate">{displayName}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left
                ${activeTab === t.id
                  ? "bg-[#1B5E37] text-white font-medium"
                  : "text-[#1A1A1A]/60 hover:bg-[#1B5E37]/8 hover:text-[#1B5E37]"
                }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <a
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#1A1A1A]/50 hover:text-[#1B5E37] hover:bg-[#1B5E37]/8 transition-all"
          >
            🏠 <span>Back to Site</span>
          </a>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all"
          >
            🚪 <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🙏</span>
            <span className="font-bold text-[#1B5E37] text-sm">Dashboard</span>
          </div>
          <button onClick={handleSignOut} className="text-red-500 text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
            Sign Out
          </button>
        </div>

        {/* Tab title */}
        <div className="px-4 lg:px-8 pt-6 pb-2">
          <h1 className="text-xl font-bold text-[#1A1A1A]">
            {TABS.find((t) => t.id === activeTab)?.label}
          </h1>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-24 lg:pb-8">
          {dataLoading ? (
            <div className="flex justify-center pt-20">
              <span className="h-10 w-10 border-3 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "overview" && (
                  <OverviewTab
                    user={{ displayName: user?.displayName, phoneNumber: user?.phoneNumber }}
                    donations={donations}
                    sponsorships={sponsorships}
                    onTabChange={setActiveTab}
                  />
                )}
                {activeTab === "donations" && <DonationsTab donations={donations} />}
                {activeTab === "receipts"  && <ReceiptsTab  donations={donations} />}
                {activeTab === "impact"    && (
                  <ImpactTab
                    user={{ displayName: user?.displayName, phoneNumber: user?.phoneNumber }}
                    donations={donations}
                  />
                )}
                {activeTab === "sponsorships" && <SponsorshipsTab sponsorships={sponsorships} />}
                {activeTab === "profile" && user && (
                  <ProfileTab
                    userId={user.uid}
                    userPhone={user.phoneNumber}
                    userEmail={user.email}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── Mobile bottom tab bar ─────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors
              ${activeTab === t.id
                ? "text-[#1B5E37] font-semibold"
                : "text-[#1A1A1A]/40"
              }`}
          >
            <span className="text-lg leading-none">{t.icon}</span>
            <span className="truncate max-w-full px-0.5">{t.label.split(" ")[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
