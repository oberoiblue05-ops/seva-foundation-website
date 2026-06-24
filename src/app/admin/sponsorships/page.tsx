"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { CHILDREN } from "@/constants";
import { generateSponsorCert } from "@/lib/generate-receipt";
import toast from "react-hot-toast";

interface Sponsorship {
  id:          string;
  sponsorName: string;
  sponsorEmail?: string;
  childId:     string;
  amount:      number;
  startDate:   string;
  isActive:    boolean;
  razorpaySubscriptionId?: string;
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function SponsorshipManagerPage() {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [toggling,     setToggling]     = useState<string | null>(null);
  const [downloading,  setDownloading]  = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "sponsorships"), orderBy("startDate", "desc"));
    return onSnapshot(q, (snap) => {
      setSponsorships(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Sponsorship)));
      setLoading(false);
    });
  }, []);

  const handleToggle = async (s: Sponsorship) => {
    setToggling(s.id);
    try {
      await updateDoc(doc(db, "sponsorships", s.id), { isActive: !s.isActive });
      toast.success(s.isActive ? "Sponsorship paused." : "Sponsorship activated.");
    } catch { toast.error("Update failed."); }
    finally { setToggling(null); }
  };

  const handleCert = async (s: Sponsorship) => {
    const child = CHILDREN.find((c) => c.id === s.childId);
    setDownloading(s.id);
    try {
      await generateSponsorCert({ id: s.id, sponsorName: s.sponsorName, childName: child?.name, amount: s.amount, startDate: s.startDate });
      toast.success("Certificate downloaded.");
    } catch { toast.error("Could not generate certificate."); }
    finally { setDownloading(null); }
  };

  const active   = sponsorships.filter((s) => s.isActive).length;
  const inactive = sponsorships.length - active;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sponsorships</h1>
        <div className="flex gap-3 text-sm">
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">{active} Active</span>
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium">{inactive} Paused</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sponsorships.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">❤️</p>
          <p>No sponsorships yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 font-medium">Child</th>
                  <th className="px-4 py-3 font-medium">Sponsor</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Since</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sponsorships.map((s) => {
                  const child = CHILDREN.find((c) => c.id === s.childId);
                  return (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Image
                            src={`https://picsum.photos/seed/${child?.imageSeed ?? 100}/32/32`}
                            alt={child?.name ?? "Child"}
                            width={32} height={32}
                            className="rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-800">{child?.name ?? "Unknown Child"}</p>
                            <p className="text-xs text-gray-400 capitalize">{child?.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700">{s.sponsorName}</p>
                        {s.sponsorEmail && <p className="text-xs text-gray-400">{s.sponsorEmail}</p>}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#1B5E37]">Rs. {s.amount}/mo</td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{fmtDate(s.startDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                          ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {s.isActive ? "Active" : "Paused"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCert(s)}
                            disabled={downloading === s.id}
                            className="text-xs text-[#1B5E37] border border-[#1B5E37] rounded-lg px-2 py-1 hover:bg-[#1B5E37]/5 disabled:opacity-50"
                          >
                            {downloading === s.id ? "…" : "📜 Cert"}
                          </button>
                          <button
                            onClick={() => handleToggle(s)}
                            disabled={toggling === s.id}
                            className={`text-xs rounded-lg px-2 py-1 transition-colors disabled:opacity-50
                              ${s.isActive
                                ? "text-red-500 border border-red-200 hover:bg-red-50"
                                : "text-green-600 border border-green-200 hover:bg-green-50"
                              }`}
                          >
                            {toggling === s.id ? "…" : s.isActive ? "Pause" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
