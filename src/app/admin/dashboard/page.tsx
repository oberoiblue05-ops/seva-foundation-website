"use client";

import { useState, useEffect } from "react";
import {
  collection, query, orderBy, limit, getDocs, where,
  doc, getDoc, setDoc,
} from "firebase/firestore";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { db } from "@/lib/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecentDonation {
  id:        string;
  name:      string;
  campaign:  string;
  amount:    number;
  timestamp: string;
  status:    string;
}

interface ImpactStats {
  children: number;
  meals:    number;
  camps:    number;
  trees:    number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ s }: { s: string }) {
  const cls =
    s === "success" ? "bg-green-100 text-green-700" :
    s === "failed"  ? "bg-red-100 text-red-700"     :
                      "bg-yellow-100 text-yellow-700";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {s}
    </span>
  );
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtRs(n: number) {
  return "Rs. " + n.toLocaleString("en-IN");
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    donationsThisMonth: 0,
    activeCampaigns:    0,
    totalDonors:        0,
    publishedPosts:     0,
    volunteers:         0,
    galleryItems:       0,
  });
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([]);
  const [impact,    setImpact]    = useState<ImpactStats>({ children: 840, meals: 8400, camps: 50, trees: 500 });
  const [savingImpact, setSavingImpact] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const now        = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const [
          donSnap, campSnap, donorSnap, blogSnap, volSnap, galSnap, recentSnap, impactSnap,
        ] = await Promise.all([
          getDocs(query(collection(db, "donations"), where("timestamp", ">=", monthStart), where("status", "==", "success"))),
          getDocs(query(collection(db, "campaigns"),  where("isActive", "==", true))),
          getDocs(query(collection(db, "donations"),  where("status", "==", "success"))),
          getDocs(query(collection(db, "blogPosts"),  where("isPublished", "==", true))),
          getDocs(collection(db, "volunteers")),
          getDocs(collection(db, "gallery")),
          getDocs(query(collection(db, "donations"), orderBy("timestamp", "desc"), limit(10))),
          getDoc(doc(db, "settings", "impactStats")),
        ]);

        setStats({
          donationsThisMonth: donSnap.size,
          activeCampaigns:    campSnap.size,
          totalDonors:        new Set(donorSnap.docs.map((d) => d.data().phone as string)).size,
          publishedPosts:     blogSnap.size,
          volunteers:         volSnap.size,
          galleryItems:       galSnap.size,
        });

        setRecentDonations(
          recentSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RecentDonation))
        );

        if (impactSnap.exists()) {
          setImpact(impactSnap.data() as ImpactStats);
        }
      } catch (err) {
        console.warn("[admin/dashboard]", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSaveImpact = async () => {
    setSavingImpact(true);
    try {
      await setDoc(doc(db, "settings", "impactStats"), impact);
      toast.success("Impact stats saved! Homepage will update.");
    } catch {
      toast.error("Could not save. Try again.");
    } finally {
      setSavingImpact(false);
    }
  };

  const STAT_CARDS = [
    { label: "Donations This Month", value: stats.donationsThisMonth, icon: "💰", color: "bg-green-50  border-green-200" },
    { label: "Active Campaigns",     value: stats.activeCampaigns,    icon: "🎯", color: "bg-blue-50   border-blue-200"  },
    { label: "Total Donors",         value: stats.totalDonors,        icon: "👥", color: "bg-purple-50 border-purple-200"},
    { label: "Published Posts",      value: stats.publishedPosts,     icon: "📝", color: "bg-orange-50 border-orange-200"},
    { label: "Volunteers",           value: stats.volunteers,         icon: "🤝", color: "bg-pink-50   border-pink-200"  },
    { label: "Gallery Items",        value: stats.galleryItems,       icon: "🖼️", color: "bg-teal-50   border-teal-200"  },
  ];

  const QUICK_ACTIONS = [
    { label: "Upload Photo",      href: "/admin/media",     icon: "📷" },
    { label: "Write Blog",        href: "/admin/blog",      icon: "✍️" },
    { label: "Create Campaign",   href: "/admin/campaigns", icon: "🎯" },
    { label: "View Donations",    href: "/admin/donations", icon: "💰" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_CARDS.map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border rounded-2xl p-4 ${s.color}`}
          >
            <span className="text-2xl">{s.icon}</span>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {loading ? "—" : s.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3
                hover:border-[#1B5E37] hover:shadow-sm transition-all text-sm font-medium text-gray-700"
            >
              <span className="text-lg">{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Donations */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">Recent Donations</h2>
            <Link href="/admin/donations" className="text-xs text-[#1B5E37] hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs border-b border-gray-50">
                  <th className="px-5 py-3 font-medium">Donor</th>
                  <th className="px-3 py-3 font-medium">Campaign</th>
                  <th className="px-3 py-3 font-medium">Amount</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-6 text-gray-400">Loading…</td></tr>
                ) : recentDonations.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-6 text-gray-400">No donations yet</td></tr>
                ) : (
                  recentDonations.map((d) => (
                    <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800 truncate max-w-[120px]">{d.name || "—"}</td>
                      <td className="px-3 py-3 text-gray-500 truncate max-w-[100px]">{d.campaign || "General"}</td>
                      <td className="px-3 py-3 font-medium text-[#1B5E37]">{fmtRs(d.amount)}</td>
                      <td className="px-3 py-3 text-gray-400 whitespace-nowrap">{d.timestamp ? fmtDate(d.timestamp) : "—"}</td>
                      <td className="px-3 py-3"><StatusBadge s={d.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Impact Counter Editor */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1">Impact Counter Editor</h2>
          <p className="text-xs text-gray-400 mb-5">Values shown on the homepage. Save to update live.</p>

          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(impact) as (keyof ImpactStats)[]).map((key) => {
              const labels: Record<keyof ImpactStats, string> = {
                children: "Children Helped",
                meals:    "Meals Served",
                camps:    "Camps Conducted",
                trees:    "Trees Planted",
              };
              const icons: Record<keyof ImpactStats, string> = {
                children: "👧",
                meals:    "🍚",
                camps:    "⛺",
                trees:    "🌳",
              };
              return (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    {icons[key]} {labels[key]}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={impact[key]}
                    onChange={(e) =>
                      setImpact((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                      outline-none focus:border-[#1B5E37] transition-colors font-medium"
                  />
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSaveImpact}
            disabled={savingImpact}
            className="mt-5 w-full bg-[#1B5E37] hover:bg-[#0d3320] text-white font-semibold rounded-xl py-3
              text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {savingImpact ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
